export type TunerState = 'IDLE' | 'ATTACK' | 'TRACKING' | 'LOCKED' | 'LOST'

export type Confidence = 'high' | 'medium' | 'low' | 'none'

export interface PitchFrame {
    timestamp: number
    rawFrequency: number | null
    correctedFrequency: number
    smoothedFrequency: number
    clarity: number
    rmsFiltered: number
    rmsRaw: number
    cents: number
    noteName: string
    octave: number
    confidence: Confidence
}

export interface TunerStateInfo {
    state: TunerState
    message: string
    noteName: string | null
    octave: number | null
    cents: number
    frequency: number | null
    confidence: Confidence
}

// Seuils — relaxed to allow trumpet's natural timbre variations
const MIN_VOLUME_FOR_ATTACK = 0.004
const LOCK_CENTS_THRESHOLD = 8
const LOCK_FRAMES_REQUIRED = 6         // ~100ms at 60fps
const ATTACK_TIMEOUT_FRAMES = 30       // ~500ms
const LOST_TO_IDLE_FRAMES = 45         // ~750ms — give time to recover
const LOST_GRACE_FRAMES = 8            // ~130ms — stay in TRACKING/LOCKED before LOST

function confidenceRank(c: Confidence): number {
    switch (c) {
        case 'high': return 3
        case 'medium': return 2
        case 'low': return 1
        case 'none': return 0
    }
}

export class PitchStateMachine {
    private _state: TunerState = 'IDLE'
    private framesInState = 0
    private lockStableFrames = 0
    private weakFrames = 0              // grace period counter
    private lastNoteName: string | null = null
    private lastOctave: number | null = null
    private lastCents = 0
    private lastFrequency: number | null = null
    private lastConfidence: Confidence = 'none'

    get state(): TunerState {
        return this._state
    }

    private transition(newState: TunerState): void {
        if (this._state !== newState) {
            this._state = newState
            this.framesInState = 0
            this.weakFrames = 0
            if (newState !== 'TRACKING' && newState !== 'LOCKED') {
                this.lockStableFrames = 0
            }
        }
    }

    update(frame: PitchFrame): TunerStateInfo {
        this.framesInState++

        const hasVolume = frame.rmsFiltered >= MIN_VOLUME_FOR_ATTACK
        const hasPitch = frame.smoothedFrequency > 0
        const confRank = confidenceRank(frame.confidence)
        const isGood = confRank >= 2  // medium or high
        const isUsable = confRank >= 1 // low or better (has some frequency)

        switch (this._state) {
            case 'IDLE':
                if (hasVolume && hasPitch && isGood) {
                    this.transition('TRACKING')
                    this.updateNote(frame)
                } else if (hasVolume && hasPitch && isUsable) {
                    this.transition('ATTACK')
                } else if (hasVolume) {
                    this.transition('ATTACK')
                }
                break

            case 'ATTACK':
                if (hasPitch && isGood) {
                    this.transition('TRACKING')
                    this.updateNote(frame)
                } else if (!hasVolume || this.framesInState > ATTACK_TIMEOUT_FRAMES) {
                    this.transition('IDLE')
                }
                break

            case 'TRACKING':
                if (!hasVolume && !hasPitch) {
                    // No signal at all — go to LOST
                    this.transition('LOST')
                } else if (hasPitch && isGood) {
                    // Good data — update normally
                    this.weakFrames = 0
                    this.updateNote(frame)
                    // Check for lock condition
                    if (frame.confidence === 'high' && Math.abs(frame.cents) <= LOCK_CENTS_THRESHOLD) {
                        this.lockStableFrames++
                        if (this.lockStableFrames >= LOCK_FRAMES_REQUIRED) {
                            this.transition('LOCKED')
                            this.updateNote(frame)
                        }
                    } else {
                        this.lockStableFrames = Math.max(0, this.lockStableFrames - 1)
                    }
                } else if (hasPitch && isUsable) {
                    // Low confidence but still have pitch — keep note/octave, update cents only
                    this.weakFrames++
                    this.updateCentsOnly(frame)
                    if (this.weakFrames > LOST_GRACE_FRAMES) {
                        this.transition('LOST')
                    }
                } else {
                    this.weakFrames++
                    if (this.weakFrames > LOST_GRACE_FRAMES) {
                        this.transition('LOST')
                    }
                }
                break

            case 'LOCKED':
                if (!hasVolume && !hasPitch) {
                    this.transition('LOST')
                } else if (hasPitch && isGood) {
                    this.weakFrames = 0
                    this.updateNote(frame)
                } else if (hasPitch && isUsable) {
                    // Grace period — keep showing last good note/octave, only update cents
                    this.weakFrames++
                    this.updateCentsOnly(frame)
                    if (this.weakFrames > LOST_GRACE_FRAMES * 2) {
                        this.transition('TRACKING')
                    }
                } else {
                    this.weakFrames++
                    if (this.weakFrames > LOST_GRACE_FRAMES) {
                        this.transition('LOST')
                    }
                }
                break

            case 'LOST':
                if (hasVolume && hasPitch && isGood) {
                    this.transition('TRACKING')
                    this.updateNote(frame)
                } else if (this.framesInState > LOST_TO_IDLE_FRAMES) {
                    this.transition('IDLE')
                    this.clearNote()
                }
                break
        }

        return this.getStateInfo()
    }

    private updateNote(frame: PitchFrame): void {
        if (frame.smoothedFrequency > 0) {
            this.lastNoteName = frame.noteName
            this.lastOctave = frame.octave
            this.lastCents = frame.cents
            this.lastFrequency = frame.smoothedFrequency
            this.lastConfidence = frame.confidence
        }
    }

    /**
     * Update only cents/frequency/confidence but keep the last reliable note name and octave.
     * Used for low-confidence frames to prevent octave flicker.
     */
    private updateCentsOnly(frame: PitchFrame): void {
        if (frame.smoothedFrequency > 0) {
            this.lastCents = frame.cents
            this.lastFrequency = frame.smoothedFrequency
            this.lastConfidence = frame.confidence
        }
    }

    private clearNote(): void {
        this.lastNoteName = null
        this.lastOctave = null
        this.lastCents = 0
        this.lastFrequency = null
        this.lastConfidence = 'none'
    }

    private getStateInfo(): TunerStateInfo {
        return {
            state: this._state,
            message: this.buildMessage(),
            noteName: this.lastNoteName,
            octave: this.lastOctave,
            cents: this.lastCents,
            frequency: this.lastFrequency,
            confidence: this.lastConfidence,
        }
    }

    private buildMessage(): string {
        const noteLabel = this.lastNoteName && this.lastOctave !== null
            ? `${this.lastNoteName}${this.lastOctave}`
            : null

        switch (this._state) {
            case 'IDLE':
                return 'Jouez une note'

            case 'ATTACK':
                return 'Attaque détectée...'

            case 'TRACKING':
                if (noteLabel) {
                    return `${noteLabel} — Stabilisation...`
                }
                return 'Détection en cours...'

            case 'LOCKED': {
                if (!noteLabel) return 'Accordé'
                const c = this.lastCents
                const abs = Math.abs(c)
                if (abs <= 5) return `${noteLabel} — Accordé ✓`
                const dir = c > 0 ? 'haut' : 'bas'
                const arrow = c > 0 ? '↑' : '↓'
                if (abs <= 10) return `${noteLabel} — ${c > 0 ? '+' : ''}${c}¢ — Très légèrement ${dir} ${arrow}`
                if (abs <= 20) return `${noteLabel} — ${c > 0 ? '+' : ''}${c}¢ — Un peu ${dir} ${arrow}`
                return `${noteLabel} — ${c > 0 ? '+' : ''}${c}¢ — Nettement trop ${dir} ${arrow}`
            }

            case 'LOST':
                return 'Signal perdu'
        }
    }

    reset(): void {
        this._state = 'IDLE'
        this.framesInState = 0
        this.lockStableFrames = 0
        this.weakFrames = 0
        this.clearNote()
    }
}
