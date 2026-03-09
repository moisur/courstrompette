'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, MicOff } from 'lucide-react'
import { usePitchEngine } from './hooks/usePitchEngine'
import { usePitchTimeline } from './hooks/usePitchTimeline'
import { INSTRUMENTS } from './lib/noteUtils'
import type { PitchFrame, TunerStateInfo, TunerState, Confidence } from './lib/pitchStateMachine'
import PitchTimeline from './components/PitchTimeline'
import TunerStatus from './components/TunerStatus'

// ── Helpers visuels ─────────────────────────────────────────────────

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
  const [instrument, setInstrument] = useState('Concert Pitch')

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

  // Reset timeline when instrument changes
  useEffect(() => {
    timeline.reset()
  }, [instrument, timeline])

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
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Instrument selector — full width above */}
      <div className="mb-6 max-w-xs relative z-0">
        <Select value={instrument} onValueChange={setInstrument}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionnez un instrument" />
          </SelectTrigger>
          <SelectContent>
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
          {/* Gauge SVG */}
          <div className="relative aspect-square max-w-[320px] mx-auto">
            <svg viewBox="0 0 200 200" className="w-full h-full">
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

          {/* Start/Stop button */}
          <div className="mt-6">
            <Button
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className="w-full"
              onClick={handleToggle}
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" />
                  Arrêter
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Démarrer
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* RIGHT — Timeline */}
        <Card className="w-full lg:flex-1 min-h-[400px] p-4 bg-background flex flex-col">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Historique de justesse
          </div>
          <div className="flex-1 min-h-[350px]">
            <PitchTimeline
              getPoints={timeline.getPoints}
              durationMs={timeline.durationMs}
              isListening={isListening}
            />
          </div>
          {!isListening && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm min-h-[350px]">
              Démarrez l&apos;accordeur pour voir l&apos;historique
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
