'use client'

import React from 'react'
import type { TunerState, Confidence } from '../lib/pitchStateMachine'

interface TunerStatusProps {
    state: TunerState
    message: string
    confidence: Confidence
    rms: number
}

const VOLUME_THRESHOLDS = [0.006, 0.014, 0.028, 0.056, 0.09]

function getStateColor(state: TunerState, confidence: Confidence): string {
    switch (state) {
        case 'IDLE': return '#94a3b8'
        case 'ATTACK': return '#fbbf24'
        case 'TRACKING': return '#38bdf8'
        case 'LOCKED': return confidence === 'high' ? '#4ade80' : '#fbbf24'
        case 'LOST': return '#ef4444'
    }
}

function getStateDot(state: TunerState): string {
    switch (state) {
        case 'IDLE': return '○'
        case 'ATTACK': return '◐'
        case 'TRACKING': return '◑'
        case 'LOCKED': return '●'
        case 'LOST': return '◌'
    }
}

export default function TunerStatus({ state, message, confidence, rms }: TunerStatusProps) {
    const color = getStateColor(state, confidence)

    return (
        <div className="flex flex-col items-center gap-3 mt-2">
            {/* Status message */}
            <div className="flex items-center gap-2">
                <span
                    className="text-lg"
                    style={{ color, transition: 'color 200ms ease' }}
                >
                    {getStateDot(state)}
                </span>
                <span
                    className="text-sm font-medium"
                    style={{ color, transition: 'color 200ms ease' }}
                >
                    {message}
                </span>
            </div>

            {/* Volume meter */}
            <div className="flex gap-1">
                {VOLUME_THRESHOLDS.map((threshold, i) => (
                    <div
                        key={i}
                        className="w-2 h-6 rounded-full transition-colors duration-150"
                        style={{
                            backgroundColor: rms > threshold
                                ? (i < 2 ? '#4ade80' : i < 4 ? '#fbbf24' : '#ef4444')
                                : 'rgba(148, 163, 184, 0.2)',
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
