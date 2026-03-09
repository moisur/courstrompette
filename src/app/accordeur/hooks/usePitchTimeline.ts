'use client'

import { useCallback, useRef, useState, useMemo } from 'react'
import type { PitchFrame } from '../lib/pitchStateMachine'

export interface TimelinePoint {
    t: number
    freq: number | null
    cents: number
    noteName: string
    octave: number
    confidence: 'high' | 'medium' | 'low' | 'none'
}

// Full history: we'll store more points now
const BUFFER_CAPACITY = 5000 // ~4 minutes at 20fps
const SAMPLES_PER_SECOND = 20
const SAMPLE_INTERVAL_MS = 1000 / SAMPLES_PER_SECOND

export function usePitchTimeline() {
    const bufferRef = useRef<TimelinePoint[]>([])
    const lastSampleTimeRef = useRef(0)
    const [startTime, setStartTime] = useState<number | null>(null)
    const [isPaused, setIsPaused] = useState(false)
    const pauseTimeRef = useRef<number | null>(null)

    const push = useCallback((frame: PitchFrame) => {
        if (isPaused) return

        const now = frame.timestamp
        if (startTime === null) {
            setStartTime(now)
        }

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

        if (bufferRef.current.length < BUFFER_CAPACITY) {
            bufferRef.current.push(point)
        } else {
            bufferRef.current.shift()
            bufferRef.current.push(point)
        }
    }, [startTime, isPaused])

    const getPoints = useCallback((): TimelinePoint[] => {
        return [...bufferRef.current]
    }, [])

    const togglePause = useCallback(() => {
        const now = performance.now()
        if (isPaused) {
            // Resuming
            if (pauseTimeRef.current !== null && startTime !== null) {
                const pauseDuration = now - pauseTimeRef.current
                setStartTime(prev => prev !== null ? prev + pauseDuration : prev)
                bufferRef.current = bufferRef.current.map(p => ({
                    ...p,
                    t: p.t + pauseDuration
                }))
            }
            pauseTimeRef.current = null
            setIsPaused(false)
        } else {
            // Pausing
            pauseTimeRef.current = now
            setIsPaused(true)
        }
    }, [isPaused, startTime])

    const reset = useCallback(() => {
        bufferRef.current = []
        lastSampleTimeRef.current = 0
        setStartTime(null)
        setIsPaused(false)
        pauseTimeRef.current = null
    }, [])

    return useMemo(() => ({
        push,
        getPoints,
        reset,
        togglePause,
        startTime,
        isPaused,
        durationMs: 0, // No longer used in fixed-window sense
    }), [push, getPoints, reset, togglePause, startTime, isPaused])
}
