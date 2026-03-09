export const A4 = 440
export const NOTES_FR = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']

export interface InstrumentProfile {
    transpositionSemitones: number
    minConcertFrequency: number
    maxConcertFrequency: number
}

export const INSTRUMENTS: Record<string, InstrumentProfile> = {
    'Concert Pitch': {
        transpositionSemitones: 0,
        minConcertFrequency: 82,
        maxConcertFrequency: 1175,
    },
    'Trumpet in Bb': {
        transpositionSemitones: 2,
        minConcertFrequency: 145,
        maxConcertFrequency: 1175,
    },
    'Alto Saxophone in Eb': {
        transpositionSemitones: -3,
        minConcertFrequency: 138,
        maxConcertFrequency: 1047,
    },
}

export interface NoteData {
    noteName: string
    octave: number
    centsOff: number
    midiNote: number
    exactFrequency: number
}

export function getInstrumentProfile(instrument: string): InstrumentProfile {
    return INSTRUMENTS[instrument] ?? INSTRUMENTS['Concert Pitch']
}

export function centsBetween(freqA: number, freqB: number): number {
    if (freqA <= 0 || freqB <= 0) return 0
    return 1200 * Math.log2(freqA / freqB)
}

export function getNoteData(frequency: number, instrument: string): NoteData {
    const profile = getInstrumentProfile(instrument)
    const adjustedFrequency = frequency * Math.pow(2, profile.transpositionSemitones / 12)
    const midiNoteExact = 69 + 12 * Math.log2(adjustedFrequency / A4)
    const roundedMidi = Math.round(midiNoteExact)
    const centsOff = Math.round((midiNoteExact - roundedMidi) * 100)
    const noteIndex = ((roundedMidi % 12) + 12) % 12
    const noteName = NOTES_FR[noteIndex]
    const octave = Math.floor(roundedMidi / 12) - 1
    const exactFrequency = A4 * Math.pow(2, (roundedMidi - 69) / 12)
    return { noteName, octave, centsOff, midiNote: roundedMidi, exactFrequency }
}

export function frequencyToMidi(freq: number): number {
    return 69 + 12 * Math.log2(freq / A4)
}

export function midiToFrequency(midi: number): number {
    return A4 * Math.pow(2, (midi - 69) / 12)
}

export function median(values: number[]): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid]
}

/**
 * Correction harmonique étendue.
 * Teste f/3, f/2, f, 2f, 3f et choisit le candidat
 * le plus proche de la fréquence de référence (en cents).
 */
export function pickClosestHarmonic(
    frequency: number,
    reference: number | null,
    profile: InstrumentProfile
): number {
    const candidates = [frequency / 3, frequency / 2, frequency, frequency * 2, frequency * 3].filter(
        (c) => c >= profile.minConcertFrequency && c <= profile.maxConcertFrequency
    )

    if (candidates.length === 0) return frequency
    if (!reference) {
        return candidates.includes(frequency) ? frequency : candidates[0]
    }

    return candidates.reduce((best, candidate) => {
        const bestDist = Math.abs(centsBetween(best, reference))
        const candDist = Math.abs(centsBetween(candidate, reference))
        return candDist < bestDist ? candidate : best
    }, candidates[0])
}

export function calculateRms(data: Float32Array): number {
    if (data.length === 0) return 0
    let sum = 0
    for (let i = 0; i < data.length; i++) {
        sum += data[i] * data[i]
    }
    return Math.sqrt(sum / data.length)
}

export function applyDetectionWindow(input: Float32Array, output: Float32Array): void {
    if (input.length === 0 || output.length !== input.length) return

    let prevIn = input[0]
    let prevOut = input[0]
    const alpha = 0.995
    const denom = Math.max(input.length - 1, 1)

    for (let i = 0; i < input.length; i++) {
        const sample = input[i]
        const hp = i === 0 ? sample : alpha * (prevOut + sample - prevIn)
        prevIn = sample
        prevOut = hp
        const window = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / denom)
        output[i] = hp * window
    }
}
