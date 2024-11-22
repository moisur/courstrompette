"use client"

import React, { useState, useEffect, useCallback } from 'react'

interface AudioAnalyzerProps {
  onNoteDetected: (note: string | null) => void
  isListening: boolean
}

export default function AudioAnalyzer({ onNoteDetected, isListening }: AudioAnalyzerProps) {
  const [detectedNote, setDetectedNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeAudio = useCallback((audioContext: AudioContext, analyser: AnalyserNode) => {
    console.log('Starting audio analysis with listening:', isListening)
    const bufferLength = analyser.fftSize
    const audioData = new Float32Array(bufferLength)

    const detectPitch = () => {
      console.log('Detecting pitch...')
      analyser.getFloatTimeDomainData(audioData)
      const pitch = extractPitch(audioData, audioContext.sampleRate)
      console.log('Extracted pitch:', pitch)
      
      setDetectedNote(pitch)
      onNoteDetected(pitch)

      if (isListening) {
        requestAnimationFrame(detectPitch)
      }
    }

    detectPitch()
  }, [isListening, onNoteDetected])

  useEffect(() => {
    let audioContext: AudioContext | null = null
    let analyser: AnalyserNode | null = null
    let stream: MediaStream | null = null

    const startAudio = async () => {
      try {
        console.log('Attempting to get user media...')
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log('User media stream obtained successfully')
        
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        console.log('Audio context created')
        
        analyser = audioContext.createAnalyser()
        const source = audioContext.createMediaStreamSource(stream)

        analyser.fftSize = 2048
        source.connect(analyser)

        if (isListening) {
          console.log('Starting audio analysis')
          analyzeAudio(audioContext, analyser)
        }
        setError(null)
      } catch (error) {
        console.error('Error accessing microphone:', error)
        setError('Error accessing microphone. Please check your permissions and try again.')
      }
    }

    if (isListening) {
      startAudio()
    }

    return () => {
      console.log('Cleaning up audio resources')
      if (audioContext) {
        audioContext.close()
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isListening, analyzeAudio])

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Audio Analysis</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p className="text-lg">
          {isListening
            ? `Detected Note: ${detectedNote || 'Listening...'}`
            : 'Click Start to begin audio analysis'}
        </p>
      )}
    </div>
  )
}

function extractPitch(data: Float32Array, sampleRate: number): string | null {
  console.log('Extracting pitch from data:', { dataLength: data.length, sampleRate })
  const fundamentalFrequency = detectFrequencyUsingACF(data, sampleRate)
  
  console.log('Fundamental frequency:', fundamentalFrequency)
  
  if (!fundamentalFrequency) {
    return null
  }

  const note = frequencyToNote(fundamentalFrequency)
  console.log('Converted to note:', note)
  return note
}

function detectFrequencyUsingACF(data: Float32Array, sampleRate: number): number | null {
  const size = data.length
  const autocorrelation = new Float32Array(size)

  // Preprocess: remove DC offset
  const dcOffset = data.reduce((sum, val) => sum + val, 0) / size
  const preprocessedData = data.map(val => val - dcOffset)

  // Compute autocorrelation
  for (let lag = 0; lag < size / 2; lag++) {
    let sum = 0
    for (let i = 0; i < size - lag; i++) {
      sum += preprocessedData[i] * preprocessedData[i + lag]
    }
    autocorrelation[lag] = sum / size
  }

  // Find the first significant peak after the first zero-crossing
  let significantPeakIndex = -1
  let maxCorrelation = 0
  let isDescending = false

  for (let i = 1; i < size / 2; i++) {
    // Look for first significant zero-crossing
    if (autocorrelation[i-1] > 0 && autocorrelation[i] <= 0) {
      for (let j = i; j < size / 2; j++) {
        if (autocorrelation[j] > maxCorrelation) {
          maxCorrelation = autocorrelation[j]
          significantPeakIndex = j
          isDescending = false
        }
        
        // Stop if the correlation starts descending significantly
        if (!isDescending && autocorrelation[j] < maxCorrelation * 0.7) {
          isDescending = true
        }
        
        // Stop searching if we've descended too far
        if (isDescending && autocorrelation[j] < maxCorrelation * 0.3) {
          break
        }
      }
      break
    }
  }

  // Validate and return frequency
  if (significantPeakIndex > 0) {
    const frequency = sampleRate / significantPeakIndex
    
    // Additional frequency validation
    if (frequency >= 20 && frequency <= 4186) { // Typical audible musical range
      return frequency
    }
  }

  return null
}

function frequencyToNote(frequency: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const midiNote = Math.round(12 * Math.log2(frequency / 440) + 69)

  if (midiNote < 0 || midiNote > 127) {
    return 'Out of Range'
  }

  const noteName = noteNames[midiNote % 12]
  const octave = Math.floor(midiNote / 12) - 1

  return `${noteName}${octave}`
}