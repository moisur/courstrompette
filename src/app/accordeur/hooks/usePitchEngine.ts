'use client'

import { useCallback, useRef, useState } from 'react'
import { PitchDetector } from 'pitchy'
import {
    getInstrumentProfile,
    pickClosestHarmonic,
    applyDetectionWindow,
    calculateRms,
    getNoteData,
    median,
    centsBetween,
    type InstrumentProfile,
} from '../lib/noteUtils'
import { PitchStateMachine, type PitchFrame, type TunerStateInfo, type Confidence } from '../lib/pitchStateMachine'

// ── Constantes DSP ──────────────────────────────────────────────────
const HIGH_PASS_CUTOFF = 110
const LOW_PASS_CUTOFF = 2200
const DETECTOR_CLARITY_THRESHOLD = 0.78
const HOLD_CLARITY_THRESHOLD = 0.62
const MIN_DETECTABLE_VOLUME = 0.006
const PITCH_SMOOTHING_FACTOR = 0.25
const VOLUME_SMOOTHING_FACTOR = 0.2
const HISTORY_LENGTH = 5
const MAX_CENTS_JUMP_WITHOUT_CONFIRM = 65
const NOTE_SWITCH_CONFIRM_FRAMES = 3
const DISPLAY_DEADBAND_CENTS = 2

export interface PitchEngineCallbacks {
    onFrame: (frame: PitchFrame, stateInfo: TunerStateInfo) => void
}

export function usePitchEngine(instrument: string, callbacks: PitchEngineCallbacks) {
    const [isListening, setIsListening] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Audio refs
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
    const highPassRef = useRef<BiquadFilterNode | null>(null)
    const lowPassRef = useRef<BiquadFilterNode | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const isListeningRef = useRef(false)
    const frameIdRef = useRef<number | null>(null)

    // DSP state refs
    const rawDataRef = useRef<Float32Array | null>(null)
    const detectorInputRef = useRef<Float32Array | null>(null)
    const pitchDetectorRef = useRef<PitchDetector<Float32Array> | null>(null)
    const smoothedVolumeRef = useRef(0)
    const stableFrequencyRef = useRef<number | null>(null)
    const frequencyHistoryRef = useRef<number[]>([])
    const pendingFrequencyRef = useRef<number | null>(null)
    const pendingFramesRef = useRef(0)

    // State machine
    const stateMachineRef = useRef(new PitchStateMachine())

    // Stash callbacks in ref to avoid re-creating analyze loop
    const callbacksRef = useRef(callbacks)
    callbacksRef.current = callbacks
    const instrumentRef = useRef(instrument)
    instrumentRef.current = instrument

    const ensureBuffers = useCallback((bufferLength: number) => {
        if (!rawDataRef.current || rawDataRef.current.length !== bufferLength) {
            rawDataRef.current = new Float32Array(bufferLength)
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

    const analyzePitch = useCallback(() => {
        const analyser = analyserRef.current
        const audioCtx = audioContextRef.current
        const stream = streamRef.current

        if (!isListeningRef.current || !analyser || !audioCtx || !stream?.active) {
            frameIdRef.current = null
            return
        }

        const bufferLength = analyser.fftSize
        ensureBuffers(bufferLength)

        const dataArray = rawDataRef.current!
        const detectorInput = detectorInputRef.current!
        const pitchDetector = pitchDetectorRef.current!
        const sampleRate = audioCtx.sampleRate
        const profile = getInstrumentProfile(instrumentRef.current)

        // Get raw audio data
        analyser.getFloatTimeDomainData(dataArray as any)

        // Preprocess: DC removal + Hann window
        applyDetectionWindow(dataArray, detectorInput)

        // Calculate RMS on filtered signal (not raw)
        const rmsFiltered = calculateRms(detectorInput)
        const rmsRaw = calculateRms(dataArray)
        const smoothedRms = smoothedVolumeRef.current + (rmsFiltered - smoothedVolumeRef.current) * VOLUME_SMOOTHING_FACTOR
        smoothedVolumeRef.current = smoothedRms

        // Pitch detection
        const [detectedFreq, clarity] = pitchDetector.findPitch(detectorInput, sampleRate)

        // Frequency range check + harmonic correction
        const inRange = detectedFreq >= profile.minConcertFrequency && detectedFreq <= profile.maxConcertFrequency
        const correctedFreq = inRange
            ? pickClosestHarmonic(detectedFreq, stableFrequencyRef.current, profile)
            : 0

        // Determine clarity threshold (lower if we already have a note)
        const clarityThreshold = stableFrequencyRef.current === null
            ? DETECTOR_CLARITY_THRESHOLD
            : HOLD_CLARITY_THRESHOLD

        const isReliable = correctedFreq > 0 && smoothedRms >= MIN_DETECTABLE_VOLUME && clarity >= clarityThreshold

        let smoothedFrequency = 0
        let confidence: Confidence = 'none'

        if (isReliable) {
            const stableFreq = stableFrequencyRef.current
            const centsJump = stableFreq === null ? 0 : Math.abs(centsBetween(correctedFreq, stableFreq))

            let acceptedFreq = correctedFreq

            // Note switch confirmation (hysteresis)
            if (stableFreq !== null && centsJump > MAX_CENTS_JUMP_WITHOUT_CONFIRM) {
                const pending = pendingFrequencyRef.current
                const samePending = pending !== null && Math.abs(centsBetween(correctedFreq, pending)) < 35

                pendingFrequencyRef.current = correctedFreq
                pendingFramesRef.current = samePending ? pendingFramesRef.current + 1 : 1

                if (pendingFramesRef.current < NOTE_SWITCH_CONFIRM_FRAMES) {
                    acceptedFreq = stableFreq
                } else {
                    frequencyHistoryRef.current = [correctedFreq]
                    pendingFrequencyRef.current = null
                    pendingFramesRef.current = 0
                }
            } else {
                pendingFrequencyRef.current = null
                pendingFramesRef.current = 0
            }

            // History + median
            frequencyHistoryRef.current.push(acceptedFreq)
            if (frequencyHistoryRef.current.length > HISTORY_LENGTH) {
                frequencyHistoryRef.current.shift()
            }
            const medianFreq = median(frequencyHistoryRef.current)

            // Log-frequency smoothing (critical fix)
            if (stableFreq === null) {
                smoothedFrequency = medianFreq
            } else {
                const logStable = Math.log2(stableFreq)
                const logMedian = Math.log2(medianFreq)
                const smoothedLog = logStable + (logMedian - logStable) * PITCH_SMOOTHING_FACTOR
                smoothedFrequency = Math.pow(2, smoothedLog)
            }

            stableFrequencyRef.current = smoothedFrequency

            // Composite confidence
            if (clarity >= 0.85 && smoothedRms >= 0.015) {
                confidence = 'high'
            } else if (clarity >= clarityThreshold && smoothedRms >= MIN_DETECTABLE_VOLUME) {
                confidence = 'medium'
            } else {
                confidence = 'low'
            }
        } else {
            // Not reliable — but if we have a previous stable frequency and some volume,
            // keep it alive with low confidence so the timeline and state machine don't drop
            const lastStable = stableFrequencyRef.current
            if (lastStable !== null && smoothedRms >= MIN_DETECTABLE_VOLUME * 0.5) {
                smoothedFrequency = lastStable
                confidence = 'low'
            } else if (smoothedRms < MIN_DETECTABLE_VOLUME) {
                confidence = 'none'
            } else {
                confidence = 'low'
            }
        }

        // Build note data
        const noteData = smoothedFrequency > 0
            ? getNoteData(smoothedFrequency, instrumentRef.current)
            : { noteName: '--', octave: 0, centsOff: 0, midiNote: 0, exactFrequency: 0 }

        const displayCents = Math.abs(noteData.centsOff) <= DISPLAY_DEADBAND_CENTS ? 0 : noteData.centsOff

        const frame: PitchFrame = {
            timestamp: performance.now(),
            rawFrequency: detectedFreq > 0 ? detectedFreq : null,
            correctedFrequency: correctedFreq,
            smoothedFrequency,
            clarity,
            rmsFiltered: smoothedRms,
            rmsRaw,
            cents: displayCents,
            noteName: noteData.noteName,
            octave: noteData.octave,
            confidence,
        }

        // Feed state machine
        const stateInfo = stateMachineRef.current.update(frame)

        // Emit to UI
        callbacksRef.current.onFrame(frame, stateInfo)

        // Schedule next frame
        if (isListeningRef.current) {
            frameIdRef.current = requestAnimationFrame(analyzePitch)
        } else {
            frameIdRef.current = null
        }
    }, [ensureBuffers])

    const startListening = useCallback(async () => {
        try {
            setError(null)

            // Cancel any existing animation
            if (frameIdRef.current !== null) {
                cancelAnimationFrame(frameIdRef.current)
                frameIdRef.current = null
            }

            // Reset DSP state
            smoothedVolumeRef.current = 0
            stableFrequencyRef.current = null
            frequencyHistoryRef.current = []
            pendingFrequencyRef.current = null
            pendingFramesRef.current = 0
            stateMachineRef.current.reset()

            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext()
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume()
            }

            // Try with optimal constraints first, fallback to basic if not supported
            let stream: MediaStream
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: false,
                        noiseSuppression: false,
                        autoGainControl: false,
                        channelCount: 1,
                    },
                })
            } catch {
                console.warn('Advanced audio constraints not supported, falling back to basic')
                stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            }
            streamRef.current = stream

            const ctx = audioContextRef.current
            const source = ctx.createMediaStreamSource(stream)
            sourceRef.current = source

            const highPass = ctx.createBiquadFilter()
            highPass.type = 'highpass'
            highPass.frequency.value = HIGH_PASS_CUTOFF
            highPass.Q.value = 0.707
            highPassRef.current = highPass

            const lowPass = ctx.createBiquadFilter()
            lowPass.type = 'lowpass'
            lowPass.frequency.value = LOW_PASS_CUTOFF
            lowPass.Q.value = 0.707
            lowPassRef.current = lowPass

            const analyser = ctx.createAnalyser()
            analyser.fftSize = 4096
            analyser.smoothingTimeConstant = 0
            analyserRef.current = analyser

            source.connect(highPass)
            highPass.connect(lowPass)
            lowPass.connect(analyser)

            isListeningRef.current = true
            setIsListening(true)

            // Start analysis loop
            frameIdRef.current = requestAnimationFrame(analyzePitch)
        } catch (err) {
            console.error('Microphone error:', err)
            const msg = err instanceof Error ? err.message : 'Erreur inconnue'
            setError(`Erreur microphone : ${msg}`)
            isListeningRef.current = false
            setIsListening(false)
        }
    }, [analyzePitch])

    const stopListening = useCallback(() => {
        isListeningRef.current = false

        if (frameIdRef.current !== null) {
            cancelAnimationFrame(frameIdRef.current)
            frameIdRef.current = null
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop())
            streamRef.current = null
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect()
            sourceRef.current = null
        }
        if (highPassRef.current) {
            highPassRef.current.disconnect()
            highPassRef.current = null
        }
        if (lowPassRef.current) {
            lowPassRef.current.disconnect()
            lowPassRef.current = null
        }
        if (analyserRef.current) {
            analyserRef.current.disconnect()
            analyserRef.current = null
        }

        smoothedVolumeRef.current = 0
        stableFrequencyRef.current = null
        frequencyHistoryRef.current = []
        pendingFrequencyRef.current = null
        pendingFramesRef.current = 0
        stateMachineRef.current.reset()

        setIsListening(false)
    }, [])

    return { isListening, error, startListening, stopListening }
}
