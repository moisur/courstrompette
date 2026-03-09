'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import type { TimelinePoint } from '../hooks/usePitchTimeline'
import { NOTES_FR, A4 } from '../lib/noteUtils'

interface PitchTimelineProps {
    getPoints: () => TimelinePoint[]
    isListening: boolean
    startTime: number | null
    isPaused: boolean
    pauseTime: number | null
}

// Fixed range for trumpet: Concert E3 (MIDI 52) to Concert D6 (MIDI 86)
// +1 semitone padding each side
const MIN_MIDI = 51
const MAX_MIDI = 87

const BG_COLOR = '#0f172a'

function freqToMidi(freq: number): number {
    return 69 + 12 * Math.log2(freq / A4)
}

function getTrumpetNoteName(concertMidi: number): string {
    const trumpetMidi = Math.round(concertMidi) + 2 // Bb transposition
    const noteIndex = ((trumpetMidi % 12) + 12) % 12
    const noteName = NOTES_FR[noteIndex]
    const octave = Math.floor(trumpetMidi / 12) - 1
    return `${noteName}${octave}`
}

function getTraceColor(confidence: string, cents: number): string {
    if (confidence === 'none' || confidence === 'low') return '#94a3b8' // slate-400
    const abs = Math.abs(cents)
    if (abs <= 10) return '#22c55e'  // green-500
    if (abs <= 20) return '#eab308'  // yellow-500
    return '#ef4444'                  // red-500
}

export default function PitchTimeline({ getPoints, isListening, startTime, isPaused, pauseTime }: PitchTimelineProps) {
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

        const LEFT_MARGIN = 52
        const RIGHT_MARGIN = 8
        const TOP_MARGIN = 8
        const BOTTOM_MARGIN = 22
        const plotW = cw - LEFT_MARGIN - RIGHT_MARGIN
        const plotH = ch - TOP_MARGIN - BOTTOM_MARGIN

        // Background
        ctx.fillStyle = BG_COLOR
        ctx.fillRect(0, 0, cw, ch)

        if (!startTime) {
            if (isListening) {
                animFrameRef.current = requestAnimationFrame(draw)
            }
            return
        }

        const now = isPaused ? (pauseTime ?? performance.now()) : performance.now()
        const duration = Math.max(5000, now - startTime)

        // Y mapping: MIDI note → pixel
        const midiToY = (midi: number): number => {
            return TOP_MARGIN + plotH - ((midi - MIN_MIDI) / (MAX_MIDI - MIN_MIDI)) * plotH
        }

        // Draw horizontal grid lines (semitones)
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'

        for (let m = MIN_MIDI; m <= MAX_MIDI; m++) {
            const y = midiToY(m)

            // Highlight Do notes (Trumpet Do = Concert Bb = MIDI 58, 70, 82)
            const trumpetMidi = m + 2
            const isTrumpetDo = trumpetMidi % 12 === 0

            ctx.lineWidth = isTrumpetDo ? 1.5 : 0.5
            ctx.strokeStyle = isTrumpetDo ? '#334155' : '#1e293b'

            ctx.beginPath()
            ctx.moveTo(LEFT_MARGIN, y)
            ctx.lineTo(cw - RIGHT_MARGIN, y)
            ctx.stroke()

            // Note label
            ctx.fillStyle = isTrumpetDo ? '#cbd5e1' : '#475569'
            ctx.font = isTrumpetDo ? 'bold 11px Inter, system-ui, sans-serif' : '9px Inter, system-ui, sans-serif'
            ctx.fillText(getTrumpetNoteName(m), LEFT_MARGIN - 5, y)
        }

        // Time axis: X mapping
        const xForTime = (t: number): number => {
            return LEFT_MARGIN + ((t - startTime) / duration) * plotW
        }

        // Time grid lines (every second)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)'
        ctx.lineWidth = 0.5
        ctx.font = '9px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'

        const totalSeconds = Math.ceil(duration / 1000)
        const gridStep = totalSeconds > 30 ? 5 : totalSeconds > 10 ? 2 : 1
        for (let s = 0; s <= totalSeconds; s += gridStep) {
            const t = startTime + s * 1000
            const x = xForTime(t)
            if (x >= LEFT_MARGIN && x <= cw - RIGHT_MARGIN) {
                ctx.beginPath()
                ctx.moveTo(x, TOP_MARGIN)
                ctx.lineTo(x, TOP_MARGIN + plotH)
                ctx.stroke()
                ctx.fillText(`${s}s`, x, TOP_MARGIN + plotH + 4)
            }
        }

        // Draw pitch trace
        const points = getPoints()

        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'

        // Clip to plot area
        ctx.save()
        ctx.beginPath()
        ctx.rect(LEFT_MARGIN, TOP_MARGIN, plotW, plotH)
        ctx.clip()

        let isDrawing = false
        let prevX = 0
        let prevY = 0

        for (let i = 0; i < points.length; i++) {
            const pt = points[i]

            if (!pt.freq || pt.confidence === 'none') {
                isDrawing = false
                continue
            }

            const midi = freqToMidi(pt.freq)
            const x = xForTime(pt.t)
            const y = midiToY(midi)

            // Color based on confidence and tuning
            const color = getTraceColor(pt.confidence, pt.cents)
            ctx.strokeStyle = color

            // Dashed for low confidence
            if (pt.confidence === 'low') {
                ctx.setLineDash([4, 4])
                ctx.lineWidth = 1.5
            } else {
                ctx.setLineDash([])
                ctx.lineWidth = 2
            }

            if (!isDrawing) {
                prevX = x
                prevY = y
                isDrawing = true
            } else {
                ctx.beginPath()
                ctx.moveTo(prevX, prevY)
                ctx.lineTo(x, y)
                ctx.stroke()
                prevX = x
                prevY = y
            }

            // Draw dot
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(x, y, pt.confidence === 'high' ? 2 : 1.2, 0, Math.PI * 2)
            ctx.fill()
        }

        ctx.restore()
        ctx.setLineDash([])

        // "Now" indicator line
        const nowX = xForTime(now)
        if (nowX >= LEFT_MARGIN && nowX <= cw - RIGHT_MARGIN) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
            ctx.lineWidth = 1
            ctx.setLineDash([4, 4])
            ctx.beginPath()
            ctx.moveTo(nowX, TOP_MARGIN)
            ctx.lineTo(nowX, TOP_MARGIN + plotH)
            ctx.stroke()
            ctx.setLineDash([])
        }

        if (isListening) {
            animFrameRef.current = requestAnimationFrame(draw)
        }
    }, [getPoints, isListening, startTime, isPaused, pauseTime])

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
                minHeight: '400px',
                borderRadius: '12px',
                display: 'block',
            }}
        />
    )
}
