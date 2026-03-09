'use client'

import React from 'react'

interface TunerGaugeProps {
    cents: number
    isActive: boolean
    noteName?: string
    octave?: number
}

function getCentsColor(c: number): string {
    if (Math.abs(c) <= 10) return '#22c55e'  // green-500
    if (Math.abs(c) <= 20) return '#eab308'  // yellow-500
    return '#ef4444'                          // red-500
}

function getCentsTextClass(c: number): string {
    if (Math.abs(c) <= 10) return 'text-green-500'
    if (Math.abs(c) <= 20) return 'text-yellow-500'
    return 'text-red-500'
}

export default function TunerGauge({ cents, isActive, noteName, octave }: TunerGaugeProps) {
    const clampedCents = Math.max(-50, Math.min(50, cents))
    const angle = isActive ? (clampedCents / 50) * 90 : 0

    return (
        <div className="relative w-full max-w-sm mx-auto mt-4 mb-8">
            <svg viewBox="0 0 200 115" className="w-full h-auto overflow-visible drop-shadow-xl">
                <defs>
                    <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="20%" stopColor="#f59e0b" />
                        <stop offset="50%" stopColor="#22c55e" />
                        <stop offset="80%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                </defs>

                {/* Background Arc */}
                <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={isActive ? "url(#gauge-gradient)" : "#334155"}
                    strokeWidth="14"
                    strokeLinecap="round"
                />

                {/* Ticks */}
                {isActive && (
                    <>
                        {/* 0 Cents (Center) */}
                        <line x1="100" y1="13" x2="100" y2="27" stroke="#0f172a" strokeWidth="3" />
                        <line x1="100" y1="13" x2="100" y2="27" stroke="#cbd5e1" strokeWidth="1" />

                        {/* -10 Cents */}
                        <g transform="rotate(-18 100 100)">
                            <line x1="100" y1="13" x2="100" y2="27" stroke="#0f172a" strokeWidth="3" />
                            <line x1="100" y1="15" x2="100" y2="25" stroke="#94a3b8" strokeWidth="1" />
                        </g>

                        {/* +10 Cents */}
                        <g transform="rotate(18 100 100)">
                            <line x1="100" y1="13" x2="100" y2="27" stroke="#0f172a" strokeWidth="3" />
                            <line x1="100" y1="15" x2="100" y2="25" stroke="#94a3b8" strokeWidth="1" />
                        </g>
                    </>
                )}

                {/* Needle */}
                <g
                    style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: '100px 100px',
                        transition: 'transform 120ms ease-out',
                    }}
                >
                    <polygon
                        points="94,52 106,52 100,32"
                        fill={isActive ? getCentsColor(cents) : "transparent"}
                    />
                </g>
            </svg>

            {/* Note Display Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                {isActive && noteName ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
                        <div className="flex items-baseline gap-1">
                            <span className="text-6xl font-bold tracking-tighter text-white drop-shadow-md">{noteName}</span>
                            <span className="text-3xl font-semibold text-slate-400">{octave}</span>
                        </div>
                        <div className={`text-xl font-mono font-bold mt-1 tracking-wider ${getCentsTextClass(cents)}`}>
                            {cents > 0 ? '+' : ''}{cents}¢
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center mb-4">
                        <div className="text-5xl font-bold text-slate-700 tracking-tighter">--</div>
                    </div>
                )}
            </div>
        </div>
    )
}
