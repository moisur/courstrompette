"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Volume2, Play, Square, Music, Activity, Pause } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Types & Data (Inchangés)
interface PianoKeyData {
    note: string; soundNote: string; key: string; label: string; octave: number; kbd: string; type: 'white' | 'black'
}

const PIANO_DATA: PianoKeyData[] = [
    { note: "C3", soundNote: "Bb2", key: "KeyZ", label: "Do", octave: 3, kbd: "W", type: "white" },
    { note: "C#3", soundNote: "B2", key: "KeyS", label: "Do#", octave: 3, kbd: "S", type: "black" },
    { note: "D3", soundNote: "C3", key: "KeyX", label: "Ré", octave: 3, kbd: "X", type: "white" },
    { note: "D#3", soundNote: "C#3", key: "KeyD", label: "Ré#", octave: 3, kbd: "D", type: "black" },
    { note: "E3", soundNote: "D3", key: "KeyC", label: "Mi", octave: 3, kbd: "C", type: "white" },
    { note: "F3", soundNote: "Eb3", key: "KeyV", label: "Fa", octave: 3, kbd: "V", type: "white" },
    { note: "F#3", soundNote: "E3", key: "KeyG", label: "Fa#", octave: 3, kbd: "G", type: "black" },
    { note: "G3", soundNote: "F3", key: "KeyB", label: "Sol", octave: 3, kbd: "B", type: "white" },
    { note: "G#3", soundNote: "F#3", key: "KeyH", label: "Sol#", octave: 3, kbd: "H", type: "black" },
    { note: "A3", soundNote: "G3", key: "KeyN", label: "La", octave: 3, kbd: "N", type: "white" },
    { note: "A#3", soundNote: "G#3", key: "KeyJ", label: "La#", octave: 3, kbd: "J", type: "black" },
    { note: "B3", soundNote: "A3", key: "KeyM", label: "Si", octave: 3, kbd: ",", type: "white" },
    { note: "C4", soundNote: "Bb3", key: "Comma", label: "Do", octave: 4, kbd: ";", type: "white" },
    { note: "C#4", soundNote: "B3", key: "KeyL", label: "Do#", octave: 4, kbd: "L", type: "black" },
    { note: "D4", soundNote: "C4", key: "Period", label: "Ré", octave: 4, kbd: ":", type: "white" },
    { note: "D#4", soundNote: "C#4", key: "Semicolon", label: "Ré#", octave: 4, kbd: "M", type: "black" },
    { note: "E4", soundNote: "D4", key: "Slash", label: "Mi", octave: 4, kbd: "!", type: "white" },
    { note: "F4", soundNote: "Eb4", key: "KeyQ", label: "Fa", octave: 4, kbd: "A", type: "white" },
    { note: "F#4", soundNote: "E4", key: "Digit2", label: "Fa#", octave: 4, kbd: "É", type: "black" },
    { note: "G4", soundNote: "F4", key: "KeyW", label: "Sol", octave: 4, kbd: "Z", type: "white" },
    { note: "G#4", soundNote: "F#4", key: "Digit3", label: "Sol#", octave: 4, kbd: "\"", type: "black" },
    { note: "A4", soundNote: "G4", key: "KeyE", label: "La", octave: 4, kbd: "E", type: "white" },
    { note: "A#4", soundNote: "G#4", key: "Digit4", label: "La#", octave: 4, kbd: "'", type: "black" },
    { note: "B4", soundNote: "A4", key: "KeyR", label: "Si", octave: 4, kbd: "R", type: "white" },
    { note: "C5", soundNote: "Bb4", key: "KeyT", label: "Do", octave: 5, kbd: "T", type: "white" },
    { note: "C#5", soundNote: "B4", key: "Digit6", label: "Do#", octave: 5, kbd: "-", type: "black" },
    { note: "D5", soundNote: "C5", key: "KeyY", label: "Ré", octave: 5, kbd: "Y", type: "white" },
    { note: "D#5", soundNote: "C#5", key: "Digit7", label: "Ré#", octave: 5, kbd: "È", type: "black" },
    { note: "E5", soundNote: "D5", key: "KeyU", label: "Mi", octave: 5, kbd: "U", type: "white" },
    { note: "F5", soundNote: "Eb5", key: "KeyI", label: "Fa", octave: 5, kbd: "I", type: "white" },
    { note: "F#5", soundNote: "E5", key: "Digit9", label: "Fa#", octave: 5, kbd: "Ç", type: "black" },
    { note: "G5", soundNote: "F5", key: "KeyO", label: "Sol", octave: 5, kbd: "O", type: "white" },
    { note: "G#5", soundNote: "F#5", key: "Digit0", label: "Sol#", octave: 5, kbd: "À", type: "black" },
    { note: "A5", soundNote: "G5", key: "KeyP", label: "La", octave: 5, kbd: "P", type: "white" },
    { note: "A#5", soundNote: "G#5", key: "Minus", label: "La#", octave: 5, kbd: ")", type: "black" },
    { note: "B5", soundNote: "A5", key: "BracketLeft", label: "Si", octave: 5, kbd: "^", type: "white" },
    { note: "C6", soundNote: "Bb5", key: "BracketRight", label: "Do", octave: 6, kbd: "$", type: "white" },
    { note: "C#6", soundNote: "B5", key: "Backslash", label: "Do#", octave: 6, kbd: "*", type: "black" },
    { note: "D6", soundNote: "C6", key: "Enter", label: "Ré", octave: 6, kbd: "↵", type: "white" },
    { note: "D#6", soundNote: "C#6", key: "ShiftRight", label: "Ré#", octave: 6, kbd: "Maj", type: "black" },
    { note: "E6", soundNote: "D6", key: "ControlRight", label: "Mi", octave: 6, kbd: "Ctrl", type: "white" }
]

const NOTE_FREQUENCIES: Record<string, number> = {
    'Bb2': 116.54, 'B2': 123.47, 'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94, 'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77, 'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66
}

export default function PianoView() {
    // Refs Audio
    const audioContextRef = useRef<AudioContext | null>(null)
    const activeOscillatorsRef = useRef<Record<string, { oscillator: OscillatorNode, gainNode: GainNode, isContinuous: boolean }>>({})
    const pianoGainNodeRef = useRef<GainNode | null>(null)
    const metronomeGainNodeRef = useRef<GainNode | null>(null)
    const metronomeTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Refs pour la logique stable (évite les problèmes de closure React)
    const isMetronomePlayingRef = useRef(false)
    const nextClickTimeRef = useRef(0)
    const currentBeatInSubRef = useRef(0)
    const currentMeasureBeatRef = useRef(0)

    // États UI
    const [isMetronomePlaying, setIsMetronomePlaying] = useState(false)
    const [isContinuousMode, setIsContinuousMode] = useState(false)
    const [currentSingleNotePlaying, setCurrentSingleNotePlaying] = useState<string | null>(null)
    const [metronomeBPM, setMetronomeBPM] = useState(120)
    const [subdivision, setSubdivision] = useState(1)
    const [beatsPerMeasure, setBeatsPerMeasure] = useState(4)
    const [displayBeat, setDisplayBeat] = useState(1)
    const [displayMeasure, setDisplayMeasure] = useState(1)
    const [volume, setVolume] = useState(0.5)
    const [metronomeVolume, setMetronomeVolume] = useState(0.5)

    const bpmRef = useRef(metronomeBPM)
    const subRef = useRef(subdivision)
    const beatsRef = useRef(beatsPerMeasure)

    useEffect(() => { bpmRef.current = metronomeBPM }, [metronomeBPM])
    useEffect(() => { subRef.current = subdivision }, [subdivision])
    useEffect(() => { beatsRef.current = beatsPerMeasure }, [beatsPerMeasure])

    // Initialisation Audio
    const initAudio = useCallback(() => {
        if (typeof window === 'undefined') return
        if (!audioContextRef.current) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            audioContextRef.current = ctx
            const mainGain = ctx.createGain()
            mainGain.connect(ctx.destination)

            pianoGainNodeRef.current = ctx.createGain()
            pianoGainNodeRef.current.connect(mainGain)
            pianoGainNodeRef.current.gain.value = volume * 0.58

            metronomeGainNodeRef.current = ctx.createGain()
            metronomeGainNodeRef.current.connect(mainGain)
            metronomeGainNodeRef.current.gain.value = metronomeVolume * 2.0
        }
        if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume()
    }, [volume, metronomeVolume])

    useEffect(() => {
        if (pianoGainNodeRef.current) pianoGainNodeRef.current.gain.value = volume * 0.58
    }, [volume])

    useEffect(() => {
        if (metronomeGainNodeRef.current) metronomeGainNodeRef.current.gain.value = metronomeVolume * 2.0
    }, [metronomeVolume])

    // Piano Logic
    const stopNote = useCallback((noteName: string, forceStop = false) => {
        const noteData = activeOscillatorsRef.current[noteName]
        if (noteData) {
            if (noteData.isContinuous && !forceStop) return
            const { oscillator, gainNode } = noteData
            const ctx = audioContextRef.current!
            const now = ctx.currentTime
            gainNode.gain.cancelScheduledValues(now)
            gainNode.gain.setValueAtTime(gainNode.gain.value, now)
            gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.1)
            oscillator.stop(now + 0.15)
            delete activeOscillatorsRef.current[noteName]
            setCurrentSingleNotePlaying(null)
        }
    }, [])

    const playNote = useCallback((noteName: string, continuous = isContinuousMode) => {
        initAudio()
        const ctx = audioContextRef.current!

        // Monophonie
        Object.keys(activeOscillatorsRef.current).forEach(n => {
            if (n !== noteName) stopNote(n, true)
        })

        if (continuous && activeOscillatorsRef.current[noteName]) {
            stopNote(noteName, true)
            return
        }

        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(pianoGainNodeRef.current!)
        oscillator.type = 'triangle'
        oscillator.frequency.setValueAtTime(NOTE_FREQUENCIES[noteName] || 440, ctx.currentTime)

        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.02)
        gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.07)

        oscillator.start()
        activeOscillatorsRef.current[noteName] = { oscillator, gainNode, isContinuous: continuous }
        setCurrentSingleNotePlaying(noteName)
    }, [initAudio, isContinuousMode, stopNote])

    // Métronome Logic
    const playMetronomeClick = useCallback((time: number) => {
        const ctx = audioContextRef.current!
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(metronomeGainNodeRef.current!)

        let freq = 660; let vol = 0.4
        if (currentBeatInSubRef.current === 0) {
            if (currentMeasureBeatRef.current === 0) { freq = 1000; vol = 0.8 }
            else { freq = 880; vol = 0.6 }
        }

        osc.frequency.setValueAtTime(freq, time)
        gain.gain.setValueAtTime(vol, time)
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
        osc.start(time)
        osc.stop(time + 0.05)

        currentBeatInSubRef.current++
        const subUnits = subRef.current
        if (currentBeatInSubRef.current >= subUnits) {
            currentBeatInSubRef.current = 0
            currentMeasureBeatRef.current++
            const nextBeat = currentMeasureBeatRef.current + 1
            setDisplayBeat(nextBeat)
            if (currentMeasureBeatRef.current >= beatsRef.current) {
                currentMeasureBeatRef.current = 0
                setDisplayBeat(1)
                setDisplayMeasure(m => m + 1)
            }
        }
    }, [])

    const scheduleMetronome = useCallback(() => {
        const ctx = audioContextRef.current!
        const lookahead = 0.1
        const subDur = (60.0 / bpmRef.current) / subRef.current
        while (nextClickTimeRef.current < ctx.currentTime + lookahead) {
            playMetronomeClick(nextClickTimeRef.current)
            nextClickTimeRef.current += subDur
        }
    }, [playMetronomeClick])

    const startMetronome = useCallback(() => {
        initAudio()
        if (isMetronomePlayingRef.current) return
        nextClickTimeRef.current = audioContextRef.current!.currentTime + 0.05
        metronomeTimerRef.current = setInterval(scheduleMetronome, 25)
        isMetronomePlayingRef.current = true
        setIsMetronomePlaying(true)
    }, [initAudio, scheduleMetronome])

    const stopMetronome = useCallback((reset = false) => {
        if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current)
        isMetronomePlayingRef.current = false
        setIsMetronomePlaying(false)
        if (reset) {
            currentBeatInSubRef.current = 0
            currentMeasureBeatRef.current = 0
            setDisplayBeat(1)
            setDisplayMeasure(1)
        }
    }, [])

    // LE PANIC BUTTON / ESPACE
    const stopEverything = useCallback(() => {
        // 1. Stop Métronome
        stopMetronome(false) // On ne reset pas forcément la mesure pour permettre une "pause"

        // 2. Stop Piano
        Object.keys(activeOscillatorsRef.current).forEach(note => {
            stopNote(note, true)
        })
    }, [stopNote, stopMetronome])

    // PAUSE & RESUME
    const togglePlayPause = () => {
        if (isMetronomePlayingRef.current) {
            stopEverything()
        } else {
            startMetronome()
        }
    }

    // Keyboard Events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return

            // Touche ESPACE
            if (e.code === 'Space') {
                e.preventDefault()
                const hasActiveNotes = Object.keys(activeOscillatorsRef.current).length > 0

                // Si quelque chose tourne -> On coupe TOUT (Panic)
                if (isMetronomePlayingRef.current || hasActiveNotes) {
                    stopEverything()
                } else {
                    // Si rien ne tourne -> On lance le métronome
                    startMetronome()
                }
                return
            }

            const keyData = PIANO_DATA.find(k => k.key === e.code)
            if (keyData) {
                if (['Slash', 'Period', 'Comma', 'Semicolon'].includes(e.code)) e.preventDefault()
                playNote(keyData.soundNote)
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            const keyData = PIANO_DATA.find(k => k.key === e.code)
            if (keyData) stopNote(keyData.soundNote)
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current)
        }
    }, [playNote, stopNote, stopEverything, startMetronome])

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-4 px-4 md:px-8 overflow-hidden flex flex-col">
            <div className="max-w-6xl mx-auto flex-1 flex flex-col justify-center space-y-4 w-full h-full">

                <div className="text-center space-y-1">
                    <motion.h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500">
                        Piano Virtuel pour Trompette
                    </motion.h1>
                </div>

                <Card className="border-slate-200 shadow-xl overflow-hidden rounded-2xl">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-2.5 px-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-orange-600" />
                                <CardTitle className="text-base font-bold text-slate-800">Console de Contrôle</CardTitle>
                            </div>
                            <Button
                                variant={isContinuousMode ? "default" : "outline"}
                                size="sm"
                                className={cn("h-8 text-[11px] font-bold px-3 uppercase transition-all", isContinuousMode && "bg-orange-600 ring-2 ring-orange-200")}
                                onClick={() => {
                                    setIsContinuousMode(!isContinuousMode)
                                    stopEverything()
                                }}
                            >
                                {isContinuousMode ? 'Note Longue' : 'Note Courte'}
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 md:p-6 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* Bouton Play/Pause/Stop combiné */}
                            <div className="lg:col-span-5 flex items-center gap-5">
                                <div className="flex flex-col gap-2">
                                    <Button
                                        size="sm"
                                        className={cn(
                                            "w-20 h-20 rounded-full flex flex-col gap-1 shadow-xl transition-all active:scale-95 text-white",
                                            isMetronomePlaying ? "bg-orange-600 ring-4 ring-orange-100" : "bg-slate-400"
                                        )}
                                        onClick={togglePlayPause}
                                    >
                                        {isMetronomePlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {isMetronomePlaying ? 'Pause' : 'Play'}
                                        </span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[10px] text-slate-400 hover:text-red-500"
                                        onClick={() => stopMetronome(true)}
                                    >
                                        RESET MESURE
                                    </Button>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter">
                                        {metronomeBPM} <span className="text-xs font-bold text-slate-400">BPM</span>
                                    </div>
                                    <Slider
                                        value={[metronomeBPM]}
                                        min={40} max={240}
                                        onValueChange={(vals) => setMetronomeBPM(vals[0])}
                                    />
                                </div>
                            </div>

                            {/* Rythme (Inchangé) */}
                            <div className="lg:col-span-4 space-y-4 border-slate-100 lg:border-l lg:pl-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Subdivision</Label>
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4].map((v) => (
                                            <Button
                                                key={v}
                                                variant={subdivision === v ? "default" : "outline"}
                                                className={cn("h-10 flex-1", subdivision === v && "bg-orange-500 ring-2 ring-orange-100")}
                                                onClick={() => setSubdivision(v)}
                                            >
                                                {v === 1 ? '♩' : v === 2 ? '♫' : v === 3 ? (
                                                    <svg width="24" height="24" viewBox="0 0 120 100" className="opacity-80" fill="currentColor">
                                                        <g>
                                                            <ellipse cx="20" cy="80" rx="12" ry="9" transform="rotate(-20 20 80)" />
                                                            <ellipse cx="60" cy="75" rx="12" ry="9" transform="rotate(-20 60 75)" />
                                                            <ellipse cx="100" cy="70" rx="12" ry="9" transform="rotate(-20 100 70)" />
                                                            <path d="M30 25 V80" stroke="currentColor" strokeWidth="4" />
                                                            <path d="M70 20 V75" stroke="currentColor" strokeWidth="4" />
                                                            <path d="M110 15 V70" stroke="currentColor" strokeWidth="4" />
                                                            <path d="M30 25 L110 15" stroke="currentColor" strokeWidth="8" strokeLinecap="butt" />
                                                            <text x="60" y="12" textAnchor="middle" fill="currentColor" fontFamily="sans-serif" fontWeight="bold" fontSize="14">3</text>
                                                        </g>
                                                    </svg>
                                                ) : '♬'}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Temps / Mesure</Label>
                                    <div className="flex flex-wrap gap-1">
                                        {[2, 3, 4, 5, 6].map((n) => (
                                            <Button
                                                key={n}
                                                variant={beatsPerMeasure === n ? "default" : "outline"}
                                                className={cn("h-8 w-8 text-[11px]", beatsPerMeasure === n && "bg-orange-600")}
                                                onClick={() => setBeatsPerMeasure(n)}
                                            >
                                                {n}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Compteurs (Inchangé) */}
                            <div className="lg:col-span-3 flex lg:flex-col gap-3">
                                <div className="flex-1 text-center">
                                    <Label className="text-[9px] text-orange-600 font-bold uppercase">Temps</Label>
                                    <div className="bg-[#0a0a0a] rounded-xl p-2 text-3xl font-mono font-black text-orange-500 border border-slate-800 shadow-inner">
                                        {displayBeat}
                                    </div>
                                </div>
                                <div className="flex-1 text-center">
                                    <Label className="text-[9px] text-orange-600 font-bold uppercase">Mesure</Label>
                                    <div className="bg-[#0a0a0a] rounded-xl p-2 text-3xl font-mono font-black text-orange-500 border border-slate-800 shadow-inner">
                                        {displayMeasure}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Piano Layout (Inchangé) */}
                <Card className="bg-[#1a1a1a] shadow-xl border-none p-4 md:p-6 overflow-hidden rounded-2xl relative flex-1 flex flex-col min-h-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                    <div className="relative overflow-x-auto flex-1 min-h-[220px] custom-scrollbar pb-2">
                        <div className="flex min-w-fit mx-auto select-none bg-black/40 p-2 rounded-xl border border-white/5 h-full items-stretch">
                            {PIANO_DATA.map((key, index) => {
                                const isActive = currentSingleNotePlaying === key.soundNote
                                return (
                                    <div
                                        key={`${key.note}-${index}`}
                                        onMouseDown={(e) => { e.preventDefault(); playNote(key.soundNote) }}
                                        onMouseUp={(e) => { e.preventDefault(); stopNote(key.soundNote) }}
                                        onMouseLeave={() => stopNote(key.soundNote)}
                                        onTouchStart={(e) => { e.preventDefault(); playNote(key.soundNote) }}
                                        onTouchEnd={(e) => { e.preventDefault(); stopNote(key.soundNote) }}
                                        className={cn(
                                            "relative cursor-pointer transition-colors duration-75 flex flex-col items-center justify-end pb-2 shrink-0 touch-none",
                                            key.type === 'white'
                                                ? "w-[44px] min-h-[220px] h-full bg-slate-50 border-x-[0.5px] border-slate-300 rounded-b-md z-10 shadow-sm"
                                                : "w-[30px] h-[140px] bg-[#222] border-x-[0.5px] border-black -mx-[15px] z-20 rounded-b-sm shadow-xl",
                                            isActive && (key.type === 'white' ? "bg-orange-100 !border-orange-300" : "bg-orange-600 !border-orange-800"),
                                            isActive && "translate-y-[1px] scale-[0.99]"
                                        )}
                                    >
                                        <div className={cn("flex flex-col items-center select-none", key.type === 'white' ? "text-slate-900" : "text-slate-50")}>
                                            <span className="text-[11px] font-bold">{key.label}{key.octave}</span>
                                            <span className="text-[8px] opacity-40 font-mono">{key.kbd}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}