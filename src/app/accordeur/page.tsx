'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, MicOff, Play, Pause, Square } from 'lucide-react'
import { usePitchEngine } from './hooks/usePitchEngine'
import { usePitchTimeline } from './hooks/usePitchTimeline'
import { INSTRUMENTS } from './lib/noteUtils'
import type { PitchFrame, TunerStateInfo, TunerState, Confidence } from './lib/pitchStateMachine'
import PitchTimeline from './components/PitchTimeline'
import TunerStatus from './components/TunerStatus'

// ── Helpers visuels d'origine ──────────────────────────────────────────

function getGaugeColor(state: TunerState, cents: number, confidence: Confidence): string {
  if (state === 'IDLE' || state === 'LOST') return '#94a3b8'
  if (state === 'ATTACK') return '#fbbf24'
  if (confidence === 'low') return '#94a3b8'

  const abs = Math.abs(cents)
  if (abs <= 5) return '#4ade80'
  if (abs <= 15) return '#fbbf24'
  return '#ef4444'
}

function getGaugeRotation(cents: number, hasNote: boolean): number {
  if (!hasNote) return 0
  return Math.min(Math.max(cents * 0.6, -30), 30)
}

// ── Composant principal ─────────────────────────────────────────────

export default function Tuner() {
  const [instrument, setInstrument] = useState('Trumpet in Bb')

  // State from the pitch engine
  const [tunerInfo, setTunerInfo] = useState<TunerStateInfo>({
    state: 'IDLE',
    message: 'Jouez une note',
    noteName: null,
    octave: null,
    cents: 0,
    frequency: null,
    confidence: 'none',
  })
  const [rms, setRms] = useState(0)

  // Timeline
  const timeline = usePitchTimeline()

  const onFrame = useCallback((frame: PitchFrame, stateInfo: TunerStateInfo) => {
    setTunerInfo(stateInfo)
    setRms(frame.rmsFiltered)
    timeline.push(frame)
  }, [timeline])

  // Pitch engine
  const { isListening, error, startListening, stopListening } = usePitchEngine(instrument, { onFrame })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  const hasNote = tunerInfo.noteName !== null && tunerInfo.noteName !== '--'
  const rotation = getGaugeRotation(tunerInfo.cents, hasNote)
  const color = getGaugeColor(tunerInfo.state, tunerInfo.cents, tunerInfo.confidence)

  const handleToggle = () => {
    if (isListening) {
      stopListening()
      timeline.reset()
      setTunerInfo({
        state: 'IDLE',
        message: 'En attente',
        noteName: null,
        octave: null,
        cents: 0,
        frequency: null,
        confidence: 'none',
      })
      setRms(0)
    } else {
      startListening()
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32">
      {/* Instrument selector */}
      <div className="mb-6 max-w-xs relative z-[60]">
        <Select value={instrument} onValueChange={(val) => {
          setInstrument(val)
          timeline.reset()
        }}>
          <SelectTrigger className="w-full bg-background/95">
            <SelectValue placeholder="Sélectionnez un instrument" />
          </SelectTrigger>
          <SelectContent className="z-[110]">
            {Object.keys(INSTRUMENTS).map((inst) => (
              <SelectItem key={inst} value={inst}>
                {inst}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Side-by-side layout: Tuner left, Timeline right */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* LEFT — Tuner */}
        <Card className="w-full lg:w-[360px] lg:flex-shrink-0 p-6 bg-background">
          {/* Gauge SVG original */}
          <div className="relative aspect-square max-w-[320px] mx-auto">
            <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
              <defs>
                <linearGradient id="tunerGradient" x1="0%" y1="0%" x2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="35%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#4ade80" />
                  <stop offset="65%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {/* Arc */}
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="url(#tunerGradient)"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Center tick marks */}
              <line x1="100" y1="28" x2="100" y2="35" stroke="rgba(148,163,184,0.5)" strokeWidth="1.5" />
              <line x1="80" y1="32" x2="82" y2="39" stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
              <line x1="120" y1="32" x2="118" y2="39" stroke="rgba(148,163,184,0.3)" strokeWidth="1" />

              {/* Needle */}
              <g
                transform={`rotate(${rotation}, 100, 100)`}
                style={{ transition: 'transform 120ms ease-out' }}
              >
                <polygon
                  points="100,28 96,42 104,42"
                  fill={color}
                  style={{ transition: 'fill 200ms ease' }}
                />
              </g>
            </svg>

            {/* Note display overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold" style={{ color, transition: 'color 200ms ease' }}>
                {hasNote ? tunerInfo.noteName : '--'}
                <span className="text-2xl align-super">
                  {hasNote && tunerInfo.octave !== null ? tunerInfo.octave : ''}
                </span>
              </div>
              {hasNote && (
                <div
                  className="text-lg font-mono mt-1"
                  style={{ color, transition: 'color 200ms ease' }}
                >
                  {tunerInfo.cents > 0 ? '+' : ''}{tunerInfo.cents}¢
                </div>
              )}
              {hasNote && tunerInfo.frequency !== null && (
                <div className="text-xs text-muted-foreground mt-1">
                  {tunerInfo.frequency.toFixed(1)} Hz
                </div>
              )}
            </div>

            {/* Logo repositioned with absolute positioning and full opacity */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 pointer-events-none z-0">
              <img
                src={instrument.toLowerCase().includes('sax') ? '/trompette/sax.png' : '/trompette/trompette.png'}
                alt={instrument}
                className="w-full object-contain"
              />
            </div>
          </div>

          {/* Status + volume */}
          <TunerStatus
            state={tunerInfo.state}
            message={tunerInfo.message}
            confidence={tunerInfo.confidence}
            rms={rms}
          />

          {/* Error display */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex flex-col gap-3">
            {!isListening ? (
              <Button
                size="lg"
                className="w-full text-lg h-14"
                onClick={handleToggle}
              >
                <Mic className="mr-2 h-5 w-5" />
                Démarrer l&apos;accordeur
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="lg"
                  variant={timeline.isPaused ? "default" : "secondary"}
                  className="flex-1 h-12"
                  onClick={timeline.togglePause}
                >
                  {timeline.isPaused ? (
                    <><Play className="mr-2 h-4 w-4" /> Reprendre</>
                  ) : (
                    <><Pause className="mr-2 h-4 w-4" /> Pause</>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="flex-1 h-12"
                  onClick={handleToggle}
                >
                  <Square className="mr-2 h-4 w-4" /> Stop
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* RIGHT — Timeline */}
        <Card className="w-full lg:flex-1 min-h-[500px] p-6 bg-background flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Historique Temps Réel</h3>
              <p className="text-xs text-muted-foreground/60">Trace complète de la session (Fa#3 — Mi6)</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Juste</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Proche</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Faux</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Faible</span>
            </div>
          </div>
          <div className="flex-1 relative bg-slate-950/20 rounded-xl border border-slate-200/5 overflow-hidden">
            {isListening ? (
              <PitchTimeline
                getPoints={timeline.getPoints}
                isListening={isListening}
                startTime={timeline.startTime}
                isPaused={timeline.isPaused}
                pauseTime={timeline.pauseTime}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-sm">
                Démarrez l&apos;accordeur pour voir l&apos;historique
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
