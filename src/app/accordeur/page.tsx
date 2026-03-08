'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { PitchDetector } from 'pitchy'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic } from 'lucide-react'

const A4 = 440
const NOTES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']

const DEFAULT_NOTE = '--'
const DEFAULT_OCTAVE = 0
const VOLUME_SMOOTHING_FACTOR = 0.2
const PITCH_SMOOTHING_FACTOR = 0.28
const DETECTOR_CLARITY_THRESHOLD = 0.9
const HOLD_CLARITY_THRESHOLD = 0.78
const MIN_DETECTABLE_VOLUME = 0.008
const WEAK_FRAMES_FOR_RESET = 4
const NOTE_SWITCH_CONFIRM_FRAMES = 3
const HISTORY_LENGTH = 5
const MAX_CENTS_JUMP_WITHOUT_CONFIRM = 65
const DISPLAY_DEADBAND_CENTS = 3
const VOLUME_METER_THRESHOLDS = [0.008, 0.016, 0.032, 0.064, 0.1]
const HIGH_PASS_CUTOFF = 110
const LOW_PASS_CUTOFF = 2200

interface InstrumentProfile {
  transpositionSemitones: number
  minConcertFrequency: number
  maxConcertFrequency: number
}

const INSTRUMENTS: Record<string, InstrumentProfile> = {
  'Concert Pitch': {
    transpositionSemitones: 0,
    minConcertFrequency: 82,
    maxConcertFrequency: 1175,
  },
  'Trumpet in Bb': {
    transpositionSemitones: -2,
    minConcertFrequency: 145,
    maxConcertFrequency: 1175,
  },
  'Alto Saxophone in Eb': {
    transpositionSemitones: 3,
    minConcertFrequency: 138,
    maxConcertFrequency: 1047,
  },
}

function applyDetectionWindow(input: Float32Array, output: Float32Array): Float32Array {
  if (input.length === 0 || output.length !== input.length) {
    return output
  }

  let previousInput = input[0]
  let previousOutput = input[0]
  const alpha = 0.995
  const denominator = Math.max(input.length - 1, 1)

  for (let i = 0; i < input.length; i++) {
    const sample = input[i]
    const highPassed = i === 0 ? sample : alpha * (previousOutput + sample - previousInput)
    previousInput = sample
    previousOutput = highPassed

    const window = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / denominator)
    output[i] = highPassed * window
  }

  return output
}

function calculateRms(data: Float32Array): number {
  if (data.length === 0) {
    return 0
  }

  let sumSquares = 0
  for (let i = 0; i < data.length; i++) {
    sumSquares += data[i] * data[i]
  }

  return Math.sqrt(sumSquares / data.length)
}

function centsBetween(frequencyA: number, frequencyB: number): number {
  if (frequencyA <= 0 || frequencyB <= 0) {
    return 0
  }

  return 1200 * Math.log2(frequencyA / frequencyB)
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

function pickClosestHarmonic(
  frequency: number,
  reference: number | null,
  profile: InstrumentProfile
): number {
  const candidates = [frequency / 2, frequency, frequency * 2].filter(
    (candidate) => candidate >= profile.minConcertFrequency && candidate <= profile.maxConcertFrequency
  )

  if (!reference || candidates.length === 0) {
    return candidates.includes(frequency) ? frequency : (candidates[0] ?? frequency)
  }

  return candidates.reduce((best, candidate) => {
    const bestDistance = Math.abs(centsBetween(best, reference))
    const candidateDistance = Math.abs(centsBetween(candidate, reference))
    return candidateDistance < bestDistance ? candidate : best
  }, candidates[0])
}

function getInstrumentProfile(instrument: string): InstrumentProfile {
  return INSTRUMENTS[instrument] ?? INSTRUMENTS['Concert Pitch']
}

export default function Tuner() {
  const [isListening, setIsListening] = useState(false)
  const [note, setNote] = useState(DEFAULT_NOTE)
  const [octave, setOctave] = useState(DEFAULT_OCTAVE)
  const [cents, setCents] = useState(0)
  const [volume, setVolume] = useState(0)
  const [frequency, setFrequency] = useState<number | null>(null)
  const [status, setStatus] = useState('En attente')
  const [instrument, setInstrument] = useState('Concert Pitch')
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const highPassFilterRef = useRef<BiquadFilterNode | null>(null)
  const lowPassFilterRef = useRef<BiquadFilterNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isListeningRef = useRef(false)
  const pitchFrameRef = useRef<number | null>(null)
  const waveformFrameRef = useRef<number | null>(null)
  const rawDataRef = useRef<Float32Array | null>(null)
  const detectorInputRef = useRef<Float32Array | null>(null)
  const visualDataRef = useRef<Float32Array | null>(null)
  const pitchDetectorRef = useRef<PitchDetector<Float32Array> | null>(null)
  const smoothedVolumeRef = useRef(0)
  const stableFrequencyRef = useRef<number | null>(null)
  const frequencyHistoryRef = useRef<number[]>([])
  const pendingFrequencyRef = useRef<number | null>(null)
  const pendingFramesRef = useRef(0)
  const weakFramesRef = useRef(0)
  const clarityRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const preprocessedCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const getNoteData = useCallback((frequency: number) => {
    const profile = getInstrumentProfile(instrument)
    const adjustedFrequency = frequency * Math.pow(2, profile.transpositionSemitones / 12)
    const midiNote = 69 + (12 * Math.log2(adjustedFrequency / A4))
    const roundedMidi = Math.round(midiNote)
    const centsOff = Math.round((midiNote - roundedMidi) * 100)
    const noteIndex = ((roundedMidi % 12) + 12) % 12
    const noteName = NOTES[noteIndex]
    const octave = Math.floor(roundedMidi / 12) - 1
    return { noteName, octave, centsOff }
  }, [instrument])

  const ensureAudioBuffers = useCallback((bufferLength: number) => {
    if (!rawDataRef.current || rawDataRef.current.length !== bufferLength) {
      rawDataRef.current = new Float32Array(bufferLength)
    }
    if (!visualDataRef.current || visualDataRef.current.length !== bufferLength) {
      visualDataRef.current = new Float32Array(bufferLength)
    }
    if (!detectorInputRef.current || detectorInputRef.current.length !== bufferLength) {
      detectorInputRef.current = new Float32Array(bufferLength)
    }
    if (!pitchDetectorRef.current || pitchDetectorRef.current.inputLength !== bufferLength) {
      const detector = PitchDetector.forFloat32Array(bufferLength)
      detector.clarityThreshold = DETECTOR_CLARITY_THRESHOLD
      detector.minVolumeAbsolute = MIN_DETECTABLE_VOLUME
      pitchDetectorRef.current = detector
    }
  }, [])

  const resetTunerValues = useCallback(() => {
    smoothedVolumeRef.current = 0
    stableFrequencyRef.current = null
    frequencyHistoryRef.current = []
    pendingFrequencyRef.current = null
    pendingFramesRef.current = 0
    weakFramesRef.current = 0
    clarityRef.current = 0
    setVolume(0)
    setFrequency(null)
    setNote(DEFAULT_NOTE)
    setOctave(DEFAULT_OCTAVE)
    setCents(0)
  }, [])


  const drawAudioData = useCallback((
    canvas: HTMLCanvasElement | null, 
    dataArray: Float32Array, 
    color: string = "rgb(0, 255, 0)"
  ) => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Nettoyage du canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dessin des données
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();

    const bufferLength = dataArray.length;
    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i];
      const y = (v + 1) * (canvas.height / 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }, [])



  const analyzePitch = useCallback(() => {
    const analyser = analyserRef.current
    const audioContext = audioContextRef.current
    const stream = streamRef.current
    const instrumentProfile = getInstrumentProfile(instrument)

    if (!isListeningRef.current || !analyser || !audioContext || !stream || !stream.active) {
      pitchFrameRef.current = null
      return
    }

    const bufferLength = analyser.fftSize
    ensureAudioBuffers(bufferLength)

    const dataArray = rawDataRef.current
    const detectorInput = detectorInputRef.current
    const visualData = visualDataRef.current
    const pitchDetector = pitchDetectorRef.current
    const sampleRate = audioContext.sampleRate

    if (!dataArray || !detectorInput || !visualData || !pitchDetector || !sampleRate) {
      if (isListeningRef.current && analyserRef.current && streamRef.current?.active) {
        pitchFrameRef.current = requestAnimationFrame(analyzePitch)
      } else {
        pitchFrameRef.current = null
      }
      return
    }

    analyser.getFloatTimeDomainData(dataArray)

    // Dessiner les données originales
    if (originalCanvasRef.current) {
      drawAudioData(originalCanvasRef.current, dataArray, "rgb(255, 0, 0)")
    }

    // Prétraitement pour la détection: suppression du DC + fenêtrage de Hann
    applyDetectionWindow(dataArray, detectorInput)
    visualData.set(detectorInput)

    // Dessiner les données prétraitées
    if (preprocessedCanvasRef.current) {
      drawAudioData(preprocessedCanvasRef.current, visualData, "rgb(0, 0, 255)")
    }

    const rms = calculateRms(dataArray)
    const smoothedRms =
      smoothedVolumeRef.current + (rms - smoothedVolumeRef.current) * VOLUME_SMOOTHING_FACTOR
    smoothedVolumeRef.current = smoothedRms
    setVolume(smoothedRms)

    const [detectedFrequency, clarity] = pitchDetector.findPitch(detectorInput, sampleRate)
    clarityRef.current = clarity

    const frequencyInRange =
      detectedFrequency >= instrumentProfile.minConcertFrequency &&
      detectedFrequency <= instrumentProfile.maxConcertFrequency
    const correctedFrequency = frequencyInRange
      ? pickClosestHarmonic(detectedFrequency, stableFrequencyRef.current, instrumentProfile)
      : 0
    const clarityThreshold = stableFrequencyRef.current === null
      ? DETECTOR_CLARITY_THRESHOLD
      : HOLD_CLARITY_THRESHOLD
    const isReliablePitch =
      correctedFrequency > 0 &&
      smoothedRms >= MIN_DETECTABLE_VOLUME &&
      clarity >= clarityThreshold

    if (isReliablePitch) {
      weakFramesRef.current = 0

      const stableFrequency = stableFrequencyRef.current
      const centsJump = stableFrequency === null
        ? 0
        : Math.abs(centsBetween(correctedFrequency, stableFrequency))

      let acceptedFrequency = correctedFrequency

      if (stableFrequency !== null && centsJump > MAX_CENTS_JUMP_WITHOUT_CONFIRM) {
        const pendingFrequency = pendingFrequencyRef.current
        const samePending =
          pendingFrequency !== null &&
          Math.abs(centsBetween(correctedFrequency, pendingFrequency)) < 35

        pendingFrequencyRef.current = correctedFrequency
        pendingFramesRef.current = samePending ? pendingFramesRef.current + 1 : 1

        if (pendingFramesRef.current < NOTE_SWITCH_CONFIRM_FRAMES) {
          acceptedFrequency = stableFrequency
        } else {
          frequencyHistoryRef.current = [correctedFrequency]
          pendingFrequencyRef.current = null
          pendingFramesRef.current = 0
        }
      } else {
        pendingFrequencyRef.current = null
        pendingFramesRef.current = 0
      }

      frequencyHistoryRef.current.push(acceptedFrequency)
      if (frequencyHistoryRef.current.length > HISTORY_LENGTH) {
        frequencyHistoryRef.current.shift()
      }

      const medianFrequency = median(frequencyHistoryRef.current)
      const smoothedFrequency = stableFrequency === null
        ? medianFrequency
        : stableFrequency + (medianFrequency - stableFrequency) * PITCH_SMOOTHING_FACTOR

      stableFrequencyRef.current = smoothedFrequency

      const { noteName, octave, centsOff } = getNoteData(smoothedFrequency)
      const displayedCents = Math.abs(centsOff) <= DISPLAY_DEADBAND_CENTS ? 0 : centsOff

      setFrequency(smoothedFrequency)
      setNote(noteName)
      setOctave(octave)
      setCents(displayedCents)

      if (pendingFramesRef.current > 0) {
        setStatus('Stabilisation...')
      } else if (Math.abs(displayedCents) <= 5) {
        setStatus('Accorde')
      } else if (displayedCents > 0) {
        setStatus('Un peu haut')
      } else {
        setStatus('Un peu bas')
      }
    } else {
      weakFramesRef.current += 1
      pendingFrequencyRef.current = null
      pendingFramesRef.current = 0

      if (weakFramesRef.current >= WEAK_FRAMES_FOR_RESET) {
        resetTunerValues()
        setStatus(smoothedRms < MIN_DETECTABLE_VOLUME ? 'Soufflez une note tenue' : 'Signal instable')
      } else if (stableFrequencyRef.current !== null) {
        setStatus('Stabilisation...')
      } else {
        setStatus('Signal faible')
      }
    }

    if (isListeningRef.current && analyserRef.current && streamRef.current?.active) {
      pitchFrameRef.current = requestAnimationFrame(analyzePitch)
    } else {
      pitchFrameRef.current = null
    }
  }, [drawAudioData, ensureAudioBuffers, getNoteData, instrument, resetTunerValues])

  const drawAudioWaveform = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bufferLength = analyser.fftSize
    ensureAudioBuffers(bufferLength)
    const dataArray = rawDataRef.current
    if (!dataArray) return
    analyser.getFloatTimeDomainData(dataArray)

    // Nettoyage du canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessin des données
    ctx.lineWidth = 2
    ctx.strokeStyle = "rgb(0, 255, 0)"
    ctx.beginPath()

    const sliceWidth = canvas.width / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i]
      const y = (value + 1) * (canvas.height / 2) // Normalisation
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      x += sliceWidth
    }

    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
  }, [ensureAudioBuffers])

  const startListening = async () => {
    try {
      if (pitchFrameRef.current !== null) {
        cancelAnimationFrame(pitchFrameRef.current)
        pitchFrameRef.current = null
      }
      if (waveformFrameRef.current !== null) {
        cancelAnimationFrame(waveformFrameRef.current)
        waveformFrameRef.current = null
      }

      resetTunerValues()

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setAudioStream(stream)
      
      const source = audioContextRef.current.createMediaStreamSource(stream)
      sourceRef.current = source

      const highPass = audioContextRef.current.createBiquadFilter()
      highPass.type = 'highpass'
      highPass.frequency.value = HIGH_PASS_CUTOFF
      highPass.Q.value = 0.707
      highPassFilterRef.current = highPass

      const lowPass = audioContextRef.current.createBiquadFilter()
      lowPass.type = 'lowpass'
      lowPass.frequency.value = LOW_PASS_CUTOFF
      lowPass.Q.value = 0.707
      lowPassFilterRef.current = lowPass
      
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 4096
      analyser.smoothingTimeConstant = 0.15
      source.connect(highPass)
      highPass.connect(lowPass)
      lowPass.connect(analyser)
      analyserRef.current = analyser

      isListeningRef.current = true
      setIsListening(true)
      setStatus('Ecoute en cours')
    } catch (error) {
      console.error('Erreur d\'accès au microphone:', error)
      isListeningRef.current = false
      setStatus('Erreur microphone')
    }
  }

  const stopListening = useCallback(() => {
    isListeningRef.current = false

    if (pitchFrameRef.current !== null) {
      cancelAnimationFrame(pitchFrameRef.current)
      pitchFrameRef.current = null
    }
    if (waveformFrameRef.current !== null) {
      cancelAnimationFrame(waveformFrameRef.current)
      waveformFrameRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    if (highPassFilterRef.current) {
      highPassFilterRef.current.disconnect()
      highPassFilterRef.current = null
    }
    if (lowPassFilterRef.current) {
      lowPassFilterRef.current.disconnect()
      lowPassFilterRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }
    resetTunerValues()
    setAudioStream(null)
    setIsListening(false)
    setStatus('En attente')
  }, [resetTunerValues])

  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  useEffect(() => {
    if (isListening) {
      analyzePitch()
    }
  }, [isListening, analyzePitch])

  useEffect(() => {
    if (isListening && canvasRef.current) {
      const animateWaveform = () => {
        if (!isListeningRef.current || !analyserRef.current || !streamRef.current?.active) {
          waveformFrameRef.current = null
          return
        }

        drawAudioWaveform()
        waveformFrameRef.current = requestAnimationFrame(animateWaveform)
      }
      animateWaveform()

      return () => {
        if (waveformFrameRef.current !== null) {
          cancelAnimationFrame(waveformFrameRef.current)
          waveformFrameRef.current = null
        }
      }
    }
  }, [isListening, drawAudioWaveform])

  useEffect(() => {
    return () => {
      stopListening()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [stopListening])

  const getRotation = () => {
    if (frequency === null) {
      return 0
    }

    return Math.min(Math.max(cents * 0.6, -30), 30)
  }

  const getColor = () => {
    if (frequency === null) return '#94a3b8'

    const absCents = Math.abs(cents)
    if (absCents < 5) return '#4ade80' // vert
    if (absCents < 15) return '#fbbf24' // jaune
    return '#ef4444' // rouge
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-background px-4 py-20">
      <div className="mb-4">
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

      <div className="relative aspect-square">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="tunerGradient" x1="0%" y1="0%" x2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
          </defs>
          
          <path
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
            stroke="url(#tunerGradient)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <g 
            transform={`rotate(${getRotation()}, 100, 100)`}
            style={{ transition: 'transform 150ms ease' }}
          >
            <polygon
              points="100,30 95,40 105,40"
              fill={getColor()}
            />
          </g>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold">
            {note}
            <span className="text-2xl align-super">{frequency !== null ? octave : ''}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {status}
          </div>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={400} 
        height={200} 
        className="w-full mt-4 border rounded"
        style={{ display: isListening ? 'block' : 'none' }}
      />
   
          {/* Canaux de visualisation audio */}
          <div className={isListening ? 'block' : 'hidden'}>
        <div className="text-sm mb-2">Signal analyse (rouge)</div>
        <canvas 
          ref={originalCanvasRef} 
          width={400} 
          height={150} 
          className="w-full border rounded mb-4"
        />

        <div className="text-sm mb-2">Signal fenetre pour la detection (bleu)</div>
        <canvas 
          ref={preprocessedCanvasRef} 
          width={400} 
          height={150} 
          className="w-full border rounded"
        />
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        <Button
          size="lg"
          variant="default"
          className="w-full relative"
          onClick={() => isListening ? stopListening() : startListening()}
        >
          <Mic className="mr-2 h-4 w-4" />
          {isListening ? 'Arrêter' : 'Démarrer'}
        </Button>

        <div className="flex gap-1">
          {VOLUME_METER_THRESHOLDS.map((threshold, i) => (
            <div
              key={i}
              className={`w-2 h-8 rounded-full transition-colors ${
                volume > threshold ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm">
        <p>Etat: {status}</p>
        <p>Note detectee: {frequency !== null ? `${note}${octave}` : 'Aucune'}</p>
        <p>Frequence: {frequency !== null ? `${frequency.toFixed(1)} Hz` : 'Aucune'}</p>
        <p>Volume: {volume.toFixed(3)}</p>
        <p>Cents: {cents}</p>
        <p>Instrument: {instrument}</p>
      </div>
    </Card>
  )
}

