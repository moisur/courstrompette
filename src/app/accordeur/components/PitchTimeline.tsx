'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import type { TimelinePoint } from '../hooks/usePitchTimeline'
import { NOTES_FR, A4 } from '../lib/noteUtils'

interface PitchTimelineProps {
    getPoints: () => TimelinePoint[]
    durationMs: number
    isListening: boolean
}

// Plage fixe pour trompette (Fa#3 à Contre Do6)
const CENTER_MIDI = 69 // A4
const SEMITONES_VISIBLE = 32 // Couvre de MIDI 53 (F3) à MIDI 85 (C#6)
const MIN_MIDI = CENTER_MIDI - SEMITONES_VISIBLE / 2
const MAX_MIDI = CENTER_MIDI + SEMITONES_VISIBLE / 2
const TOLERANCE_TIGHT = 5   // ±5 cents: green band
const TOLERANCE_WIDE = 10   // ±10 cents: yellow band

// Colors
const BG_COLOR = '#0f172a'
const GRID_COLOR = 'rgba(148, 163, 184, 0.15)'
const GRID_LABEL_COLOR = 'rgba(148, 163, 184, 0.6)'
const NOTE_LINE_COLOR = 'rgba(148, 163, 184, 0.25)'
const BAND_GREEN = 'rgba(74, 222, 128, 0.08)'
const BAND_YELLOW = 'rgba(251, 191, 36, 0.06)'
const TRACE_GREEN = '#4ade80'
const TRACE_YELLOW = '#fbbf24'
const TRACE_RED = '#ef4444'
const TRACE_GRAY = '#64748b'
const TIME_LABEL_COLOR = 'rgba(148, 163, 184, 0.4)'

function midiToFreq(midi: number): number {
    return A4 * Math.pow(2, (midi - 69) / 12)
}

function freqToMidi(freq: number): number {
    return 69 + 12 * Math.log2(freq / A4)
}

function midiToNoteName(midi: number): string {
    const idx = ((midi % 12) + 12) % 12
    return NOTES_FR[idx]
}

function getTraceColor(confidence: string, cents: number): string {
    if (confidence === 'none' || confidence === 'low') return TRACE_GRAY
    const abs = Math.abs(cents)
    if (abs <= TOLERANCE_TIGHT) return TRACE_GREEN
    if (abs <= TOLERANCE_WIDE) return TRACE_YELLOW
    return TRACE_RED
}

export default function PitchTimeline({ getPoints, durationMs, isListening }: PitchTimelineProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animFrameRef = useRef<number | null>(null)

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // High-DPI support
        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        const w = rect.width * dpr
        const h = rect.height * dpr
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w
            canvas.height = h
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        const cw = rect.width
        const ch = rect.height

        const LEFT_MARGIN = 44
        const RIGHT_MARGIN = 8
        const TOP_MARGIN = 8
        const BOTTOM_MARGIN = 22
        const plotW = cw - LEFT_MARGIN - RIGHT_MARGIN
        const plotH = ch - TOP_MARGIN - BOTTOM_MARGIN

        // Background
        ctx.fillStyle = BG_COLOR
        ctx.fillRect(0, 0, cw, ch)

        const centerMidi = CENTER_MIDI
        const minMidi = MIN_MIDI
        const maxMidi = MAX_MIDI

        // Y mapping: MIDI note → pixel
        const midiToY = (midi: number): number => {
            const ratio = (maxMidi - midi) / (maxMidi - minMidi)
            return TOP_MARGIN + ratio * plotH
        }

        // Draw tolerance bands + note grid lines
        ctx.font = '10px Inter, system-ui, sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'

        for (let midi = Math.ceil(minMidi); midi <= Math.floor(maxMidi); midi++) {
            const y = midiToY(midi)

            // Yellow band (±10 cents = ±10/100 of a semitone)
            const yTop10 = midiToY(midi + 0.10)
            const yBot10 = midiToY(midi - 0.10)
            ctx.fillStyle = BAND_YELLOW
            ctx.fillRect(LEFT_MARGIN, yTop10, plotW, yBot10 - yTop10)

            // Green band (±5 cents)
            const yTop5 = midiToY(midi + 0.05)
            const yBot5 = midiToY(midi - 0.05)
            ctx.fillStyle = BAND_GREEN
            ctx.fillRect(LEFT_MARGIN, yTop5, plotW, yBot5 - yTop5)

            // Note line
            ctx.strokeStyle = NOTE_LINE_COLOR
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(LEFT_MARGIN, y)
            ctx.lineTo(cw - RIGHT_MARGIN, y)
            ctx.stroke()

            // Note label
            const name = midiToNoteName(midi)
            const oct = Math.floor(midi / 12) - 1
            ctx.fillStyle = GRID_LABEL_COLOR
            ctx.fillText(`${name}${oct}`, LEFT_MARGIN - 4, y)
        }

        // Time axis
        const now = performance.now()
        const tMin = now - durationMs
        const tMax = now

        const xForTime = (t: number): number => {
            const ratio = (t - tMin) / (tMax - tMin)
            return LEFT_MARGIN + ratio * plotW
        }

        // Time grid (every 1 second)
        ctx.strokeStyle = GRID_COLOR
        ctx.lineWidth = 0.5
        ctx.font = '9px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = TIME_LABEL_COLOR

        for (let s = 1; s <= Math.floor(durationMs / 1000); s++) {
            const t = tMax - s * 1000
            const x = xForTime(t)
            ctx.beginPath()
            ctx.moveTo(x, TOP_MARGIN)
            ctx.lineTo(x, TOP_MARGIN + plotH)
            ctx.stroke()
            ctx.fillText(`-${s}s`, x, TOP_MARGIN + plotH + 4)
        }

        // Draw pitch trace
        const points = getPoints()
        if (points.length < 2) {
            if (isListening) {
                animFrameRef.current = requestAnimationFrame(draw)
            }
            return
        }

        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // Clip to plot area
        ctx.save()
        ctx.beginPath()
        ctx.rect(LEFT_MARGIN, TOP_MARGIN, plotW, plotH)
        ctx.clip()

        let prevX: number | null = null
        let prevY: number | null = null
        let prevColor: string | null = null

        for (let i = 0; i < points.length; i++) {
            const pt = points[i]
            if (!pt.freq || pt.confidence === 'none') {
                prevX = null
                prevY = null
                prevColor = null
                continue
            }

            const midi = freqToMidi(pt.freq) + pt.cents / 100 // incorporate cents offset for accuracy
            const x = xForTime(pt.t)
            const y = midiToY(freqToMidi(pt.freq))
            const color = getTraceColor(pt.confidence, pt.cents)

            // Dashed for low confidence
            if (pt.confidence === 'low') {
                ctx.setLineDash([4, 4])
                ctx.lineWidth = 1.5
            } else {
                ctx.setLineDash([])
                ctx.lineWidth = 2.5
            }

            if (prevX !== null && prevY !== null) {
                ctx.strokeStyle = color
                ctx.beginPath()
                ctx.moveTo(prevX, prevY)
                ctx.lineTo(x, y)
                ctx.stroke()
            }

            // Draw dot for current point
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(x, y, pt.confidence === 'high' ? 2.5 : 1.5, 0, Math.PI * 2)
            ctx.fill()

            prevX = x
            prevY = y
            prevColor = color
        }

        ctx.restore()
        ctx.setLineDash([])

        // "Now" indicator line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cw - RIGHT_MARGIN, TOP_MARGIN)
        ctx.lineTo(cw - RIGHT_MARGIN, TOP_MARGIN + plotH)
        ctx.stroke()

        if (isListening) {
            animFrameRef.current = requestAnimationFrame(draw)
        }
    }, [getPoints, durationMs, isListening])

    useEffect(() => {
        if (isListening) {
            animFrameRef.current = requestAnimationFrame(draw)
        }
        return () => {
            if (animFrameRef.current !== null) {
                cancelAnimationFrame(animFrameRef.current)
                animFrameRef.current = null
            }
        }
    }, [isListening, draw])

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height: '100%',
                minHeight: '300px',
                borderRadius: '12px',
                display: isListening ? 'block' : 'none',
                position: 'relative',
                zIndex: 0,
            }}
        />
    )
}
