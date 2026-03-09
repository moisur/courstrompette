'use client'

import { useCallback, useRef, useMemo } from 'react'
import type { PitchFrame } from '../lib/pitchStateMachine'

export interface TimelinePoint {
    t: number
    freq: number | null
    cents: number
    noteName: string
    octave: number
    confidence: 'high' | 'medium' | 'low' | 'none'
}

const TIMELINE_DURATION_S = 8
const SAMPLES_PER_SECOND = 20
const BUFFER_CAPACITY = TIMELINE_DURATION_S * SAMPLES_PER_SECOND
const SAMPLE_INTERVAL_MS = 1000 / SAMPLES_PER_SECOND

export function usePitchTimeline() {
    const bufferRef = useRef<TimelinePoint[]>([])
    const headRef = useRef(0)
    const lastSampleTimeRef = useRef(0)
    const centerNoteRef = useRef(69) // A4 MIDI as default center

    const push = useCallback((frame: PitchFrame) => {
        const now = frame.timestamp
        if (now - lastSampleTimeRef.current < SAMPLE_INTERVAL_MS) return
        lastSampleTimeRef.current = now

        const point: TimelinePoint = {
            t: now,
            freq: frame.smoothedFrequency > 0 ? frame.smoothedFrequency : null,
            cents: frame.cents,
            noteName: frame.noteName,
            octave: frame.octave,
            confidence: frame.confidence,
        }

        const buf = bufferRef.current
        if (buf.length < BUFFER_CAPACITY) {
            buf.push(point)
        } else {
            buf[headRef.current % BUFFER_CAPACITY] = point
        }
        headRef.current++

        // Update center note when we have a confident pitch
        if (frame.confidence === 'high' || frame.confidence === 'medium') {
            if (frame.smoothedFrequency > 0) {
                const midi = 69 + 12 * Math.log2(frame.smoothedFrequency / 440)
                // Smooth the center note transition
                centerNoteRef.current = centerNoteRef.current + (Math.round(midi) - centerNoteRef.current) * 0.1
            }
        }
    }, [])

    const getPoints = useCallback((): TimelinePoint[] => {
        const buf = bufferRef.current
        if (buf.length < BUFFER_CAPACITY) {
            return [...buf]
        }
        // Reconstruct in chronological order from circular buffer
        const start = headRef.current % BUFFER_CAPACITY
        return [...buf.slice(start), ...buf.slice(0, start)]
    }, [])

    const getCenterMidi = useCallback(() => {
        return Math.round(centerNoteRef.current)
    }, [])

    const reset = useCallback(() => {
        bufferRef.current = []
        headRef.current = 0
        lastSampleTimeRef.current = 0
        centerNoteRef.current = 69
    }, [])

    return useMemo(() => ({
        push,
        getPoints,
        getCenterMidi,
        reset,
        durationMs: TIMELINE_DURATION_S * 1000,
    }), [push, getPoints, getCenterMidi, reset])
}
