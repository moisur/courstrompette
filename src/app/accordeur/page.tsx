'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic } from 'lucide-react'

const A4 = 440
const NOTES = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']

const YIN_THRESHOLD = 0.1
const MIN_FREQUENCY = 80
const MAX_FREQUENCY = 1100

// Instrument transposition values (in semitones)
const INSTRUMENTS: { [key: string]: number } = {
    'Concert Pitch': 0,
    'Trumpet in B♭': -2,
    'Alto Saxophone in E♭': 3
}

function yinPitchDetection(audioData: Float32Array, sampleRate: number): number {
  const halfBufferSize = Math.floor(audioData.length / 2)
  const yinBuffer = new Float32Array(halfBufferSize)

  // Calcul différence de carrés
  yinBuffer[0] = 0
  for (let tau = 1; tau < halfBufferSize; tau++) {
    let sum = 0
    for (let i = 0; i < halfBufferSize; i++) {
      const delta = audioData[i] - audioData[i + tau]
      sum += delta * delta
    }
    yinBuffer[tau] = sum
  }

  // Normalisation cumulative
  let runningSum = 0
  yinBuffer[0] = 1
  for (let tau = 1; tau < halfBufferSize; tau++) {
    runningSum += yinBuffer[tau]
    yinBuffer[tau] *= tau / runningSum
  }

  // Trouver le premier minimum absolu
  for (let tau = 1; tau < halfBufferSize; tau++) {
    if (yinBuffer[tau] < YIN_THRESHOLD) {
      const pitch = sampleRate / tau
      return (pitch >= MIN_FREQUENCY && pitch <= MAX_FREQUENCY) ? pitch : 0
    }
  }

  return 0
}

function preprocessAudio(audioData: Float32Array): Float32Array {
  // Filtre passe-haut simple
  const filteredData = new Float32Array(audioData.length)
  const alpha = 0.99
  
  filteredData[0] = audioData[0]
  for (let i = 1; i < audioData.length; i++) {
    filteredData[i] = audioData[i] - alpha * audioData[i-1]
  }

  // Réduction du bruit
  const noiseThreshold = calculateNoiseThreshold(filteredData)
  return filteredData.map(sample => 
    Math.abs(sample) > noiseThreshold ? sample : 0
  )
}

function calculateNoiseThreshold(data: Float32Array): number {
  const sortedData = [...data].sort((a, b) => Math.abs(a) - Math.abs(b))
  return sortedData[Math.floor(sortedData.length * 0.1)]
}

export default function Tuner() {
  const [isListening, setIsListening] = useState(false)
  const [note, setNote] = useState('Mi')
  const [octave, setOctave] = useState(4)
  const [cents, setCents] = useState(0)
  const [volume, setVolume] = useState(0)
  const [status, setStatus] = useState('En attente')
  const [instrument, setInstrument] = useState('Concert Pitch')
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const preprocessedCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const getNoteData = useCallback((frequency: number) => {
    // Adjust frequency based on instrument transposition
    const adjustedFrequency = frequency * Math.pow(2, INSTRUMENTS[instrument] / 12)
    
    const noteNum = 12 * (Math.log2(adjustedFrequency / A4)) + 49
    const note = Math.round(noteNum)
    const centsOff = Math.round((noteNum - note) * 100)
    const noteName = NOTES[note % 12]
    const octave = Math.floor(note / 12) - 1
    return { noteName, octave, centsOff }
  }, [instrument])


  const drawAudioData = useCallback((
    canvas: HTMLCanvasElement | null, 
    dataArray: Float32Array, 
    color: string = "rgb(0, 255, 0)"
  ) => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Nettoyage du canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    if (!analyserRef.current || !isListening) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Float32Array(bufferLength)
    analyserRef.current.getFloatTimeDomainData(dataArray)

    // Dessiner les données originales
    if (originalCanvasRef.current) {
      drawAudioData(originalCanvasRef.current, dataArray, "rgb(255, 0, 0)")
    }

    // Prétraitement du signal
    const processedData = preprocessAudio(dataArray)

    // Dessiner les données prétraitées
    if (preprocessedCanvasRef.current) {
      drawAudioData(preprocessedCanvasRef.current, processedData, "rgb(0, 0, 255)")
    }

    // Détection de pitch avec YIN
    const foundFrequency = yinPitchDetection(processedData, audioContextRef.current!.sampleRate)

    // Calcul du volume RMS
    const rms = Math.sqrt(
      processedData.reduce((sum, val) => sum + val * val, 0) / processedData.length
    )
    setVolume(rms)

    // Détection et mise à jour de la note
    if (foundFrequency > 0 && rms > 0.01) {
      const { noteName, octave, centsOff } = getNoteData(foundFrequency)
      setNote(noteName)
      setOctave(octave)
      setCents(centsOff)
      setStatus('Accordé')
    } else {
      setStatus('Signal faible')
    }

    rafRef.current = requestAnimationFrame(analyzePitch)
  }, [isListening, drawAudioData, getNoteData])

  const drawAudioWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(dataArray);

    // Nettoyage du canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessin des données
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(0, 255, 0)";
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    dataArray.forEach((value, i) => {
      const y = (value + 1) * (canvas.height / 2); // Normalisation
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    });

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }, [])

  const startListening = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setAudioStream(stream)
      
      const source = audioContextRef.current.createMediaStreamSource(stream)
      sourceRef.current = source
      
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 4096  // Augmentation de la résolution
      source.connect(analyser)
      analyserRef.current = analyser

      setIsListening(true)
      setStatus('Écoute en cours')
    } catch (error) {
      console.error('Erreur d\'accès au microphone:', error)
      setStatus('Erreur microphone')
    }
  }

  const stopListening = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect()
    }
    setIsListening(false)
    setStatus('En attente')
  }, [])

  useEffect(() => {
    if (isListening) {
      analyzePitch()
    }
  }, [isListening, analyzePitch])

  useEffect(() => {
    if (isListening && canvasRef.current) {
      const animateWaveform = () => {
        drawAudioWaveform()
        rafRef.current = requestAnimationFrame(animateWaveform)
      }
      animateWaveform()

      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
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
    return Math.min(Math.max(cents * 0.6, -30), 30)
  }

  const getColor = () => {
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
            <span className="text-2xl align-super">{octave}</span>
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
        <div className="text-sm mb-2">Données audio originales (rouge)</div>
        <canvas 
          ref={originalCanvasRef} 
          width={400} 
          height={150} 
          className="w-full border rounded mb-4"
        />

        <div className="text-sm mb-2">Données audio prétraitées (bleu)</div>
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
          {[0.2, 0.4, 0.6, 0.8, 1].map((threshold, i) => (
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
        <p>État: {status}</p>
        <p>Fréquence détectée: {note !== 'Mi' ? `${note}${octave}` : 'Aucune'}</p>
        <p>Volume: {volume.toFixed(3)}</p>
        <p>Cents: {cents}</p>
        <p>Instrument: {instrument}</p>
      </div>
    </Card>
  )
}

