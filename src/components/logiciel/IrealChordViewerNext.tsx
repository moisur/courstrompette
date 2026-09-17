"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Pause, Play, Search, SlidersHorizontal, Square } from 'lucide-react';
import Vex from 'vexflow';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import { IRealSong, parseIRealUrl, transposeChord, transposeMeasures } from './iRealParser';
import {
  buildChordBeatSegments,
  CHROMATIC_NOTES,
  getBeatsFromTimeSignature,
  getChordInfo,
  getFingeringText,
  noteFreq,
  prettyNote,
  prettyQuality,
  ROMANCE_NOTES,
} from './irealMusicUtils';
import { loadParsedLeadSheet, transposeLeadSheet, ParsedLeadSheet, ParsedLeadSheetMeasure, ParsedMelodyEvent } from './musicXmlLeadSheet';
import {
  buildIrealSongKey,
  DisplayMode,
  IrealWikifoniaMatch,
  LibrarySong,
  PlaybackMode,
  PlaybackPosition,
  ScoreTrack,
  SheetReference,
  StandaloneWikifoniaEntry,
} from './irealWikifonia';
import WikifoniaVexScore from './WikifoniaVexScore';
import { getTop50Meta, isTop50Song } from './top50Songs';

const VF = Vex.Flow;

type WikifoniaMatchMap = Record<string, IrealWikifoniaMatch>;
type SongMatchFilter = 'top-50' | 'all' | 'with-sheet' | 'without-sheet' | 'standalone';

type RenderedNoteMeta = {
  id: string;
  measureIndex: number;
  startBeat: number;
  endBeat: number;
};

function createDefaultTracks(options?: { hasAccompaniment?: boolean }): ScoreTrack[] {
  const hasAccompaniment = options?.hasAccompaniment ?? true;

  return [
    {
      id: 'melody',
      label: 'Melodie Sib',
      kind: 'melody',
      visible: true,
      audioEnabled: true,
      fingeringEnabled: true,
    },
    {
      id: 'accompaniment',
      label: 'Accompagnement iReal',
      kind: 'accompaniment',
      visible: hasAccompaniment,
      audioEnabled: hasAccompaniment,
      fingeringEnabled: false,
    },
  ];
}

function getPlaybackFlags(
  mode: PlaybackMode,
  options: { hasLeadSheet: boolean; hasAccompaniment: boolean }
) {
  return {
    accompanimentEnabled:
      options.hasAccompaniment && (mode === 'ireal' || mode === 'both' || !options.hasLeadSheet),
    melodyEnabled:
      options.hasLeadSheet && (mode === 'melody' || mode === 'both' || !options.hasAccompaniment),
  };
}

function recolorRenderedNote(node: Element | null, color: string) {
  if (!node) {
    return;
  }

  node.querySelectorAll('*').forEach((child) => {
    if (!child.getAttribute('fill')?.includes('none')) {
      child.setAttribute('fill', color);
    }
    if (!child.getAttribute('stroke')?.includes('none')) {
      child.setAttribute('stroke', color);
    }
  });
}

class UnifiedBackingTrackEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;
  private nextBeatTime = 0;
  private currentBeat = 0;
  private currentMeasure = 0;
  private accompanimentMeasures: string[][] = [];
  private melodyMeasures: ParsedLeadSheetMeasure[] = [];
  private bpm = 120;
  private defaultBeatsPerMeasure = 4;
  private isRunning = false;
  private totalMeasures = 0;
  private accompanimentEnabled = true;
  private melodyEnabled = false;
  private eventQueue: PlaybackPosition[] = [];
  private loopEnabled = false;
  private loopStartMeasure = 0;
  private loopEndMeasure = 0;

  init() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  configure(options: {
    accompanimentMeasures: string[][];
    melodyMeasures?: ParsedLeadSheetMeasure[];
    bpm: number;
    defaultBeatsPerMeasure: number;
    accompanimentEnabled: boolean;
    melodyEnabled: boolean;
    loopEnabled?: boolean;
    loopStartMeasure?: number;
    loopEndMeasure?: number;
  }) {
    this.accompanimentMeasures = options.accompanimentMeasures;
    this.melodyMeasures = options.melodyMeasures ?? [];
    this.bpm = options.bpm;
    this.defaultBeatsPerMeasure = options.defaultBeatsPerMeasure;
    this.accompanimentEnabled = options.accompanimentEnabled;
    this.melodyEnabled = options.melodyEnabled;
    this.totalMeasures = Math.max(this.accompanimentMeasures.length, this.melodyMeasures.length);
    if (options.loopEnabled !== undefined) {
      this.loopEnabled = options.loopEnabled;
    }
    if (options.loopStartMeasure !== undefined) {
      this.loopStartMeasure = options.loopStartMeasure;
    }
    if (options.loopEndMeasure !== undefined) {
      this.loopEndMeasure = options.loopEndMeasure;
    }
  }

  setLoop(enabled: boolean, startMeasure: number, endMeasure: number) {
    this.loopEnabled = enabled;
    this.loopStartMeasure = Math.max(0, startMeasure);
    this.loopEndMeasure = Math.max(startMeasure, endMeasure);
  }

  seekTo(measureIndex: number, beat = 0) {
    this.currentMeasure = Math.max(0, Math.min(measureIndex, (this.totalMeasures || 1) - 1));
    this.currentBeat = Math.max(0, Math.floor(beat));
    this.eventQueue = [];
    if (this.ctx) {
      this.nextBeatTime = this.ctx.currentTime + 0.05;
    }
  }

  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  start(startFromCurrent = false) {
    if (this.totalMeasures === 0) {
      return;
    }

    this.init();
    if (!this.ctx) {
      return;
    }

    this.isRunning = true;
    if (!startFromCurrent) {
      if (this.loopEnabled && (this.currentMeasure < this.loopStartMeasure || this.currentMeasure > this.loopEndMeasure)) {
        this.currentMeasure = this.loopStartMeasure;
      } else if (this.currentMeasure >= this.totalMeasures) {
        this.currentMeasure = 0;
      }
    }
    this.nextBeatTime = this.ctx.currentTime + 0.1;
    this.eventQueue = [];
    this.schedule();
  }

  stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.eventQueue = [];
  }

  getCurrentPosition(): PlaybackPosition | null {
    if (!this.ctx || !this.isRunning) {
      return null;
    }

    const now = this.ctx.currentTime;
    while (this.eventQueue.length > 1 && this.eventQueue[1].time <= now) {
      this.eventQueue.shift();
    }

    const current = this.eventQueue[0];
    if (!current || current.time > now) {
      return null;
    }

    const next = this.eventQueue[1];
    const beatDuration = next ? next.time - current.time : 60 / this.bpm;
    const progress = beatDuration > 0 ? Math.min(0.999, Math.max(0, (now - current.time) / beatDuration)) : 0;

    return {
      measure: current.measure,
      beat: current.beat + progress,
      time: now,
    };
  }

  private getBeatsForMeasure(measureIndex: number): number {
    return this.melodyMeasures[measureIndex]?.beats ?? this.defaultBeatsPerMeasure;
  }

  private advanceBeat() {
    this.currentBeat += 1;
    if (this.currentBeat >= this.getBeatsForMeasure(this.currentMeasure)) {
      this.currentBeat = 0;
      this.currentMeasure += 1;

      if (this.loopEnabled && this.loopEndMeasure >= this.loopStartMeasure) {
        const maxMeasure = Math.min(this.loopEndMeasure, this.totalMeasures - 1);
        const minMeasure = Math.min(this.loopStartMeasure, maxMeasure);
        if (this.currentMeasure > maxMeasure || this.currentMeasure >= this.totalMeasures) {
          this.currentMeasure = minMeasure;
        }
      } else if (this.currentMeasure >= this.totalMeasures) {
        this.currentMeasure = 0;
      }
    }
  }

  private schedule() {
    if (!this.ctx || !this.isRunning) {
      return;
    }

    while (this.nextBeatTime < this.ctx.currentTime + 0.2) {
      this.eventQueue.push({
        time: this.nextBeatTime,
        measure: this.currentMeasure,
        beat: this.currentBeat,
      });

      this.playBeat(this.nextBeatTime);
      this.advanceBeat();
      this.nextBeatTime += 60 / this.bpm;
    }

    this.timerId = window.setTimeout(() => this.schedule(), 25);
  }

  private playBeat(time: number) {
    if (!this.ctx || !this.masterGain) {
      return;
    }

    const beatsPerMeasure = this.getBeatsForMeasure(this.currentMeasure);
    if (this.accompanimentEnabled) {
      this.playAccompanimentBeat(time, beatsPerMeasure);
    }
    if (this.melodyEnabled) {
      this.playMelodyBeat(time);
    }
  }

  private playAccompanimentBeat(time: number, beatsPerMeasure: number) {
    const measure = this.accompanimentMeasures[this.currentMeasure] ?? [];
    const segments = buildChordBeatSegments(measure, beatsPerMeasure);

    this.playDrums(time, beatsPerMeasure);

    const activeSegment =
      segments.find(
        (segment) => this.currentBeat >= segment.startBeat && this.currentBeat < segment.startBeat + segment.duration
      ) ?? segments[0];

    if (!activeSegment) {
      return;
    }

    const chordInfo = getChordInfo(activeSegment.chord);
    if (!chordInfo) {
      return;
    }

    this.playBass(time, chordInfo.root, chordInfo.notes, this.currentBeat - activeSegment.startBeat);
    if (this.currentBeat === activeSegment.startBeat) {
      this.playComp(time, chordInfo.root, chordInfo.notes, activeSegment.duration);
    }
  }

  private calculateTiedDurationBeats(measureIndex: number, event: ParsedMelodyEvent): number {
    let totalBeats = event.durationBeats;
    if (!event.tieStart) {
      return totalBeats;
    }

    const targetKey = event.displayKey;
    let currentMeasureIdx = measureIndex;
    const currentEvents = this.melodyMeasures[currentMeasureIdx]?.melody ?? [];
    let currentEventIdx = currentEvents.indexOf(event);

    while (currentMeasureIdx < this.melodyMeasures.length) {
      const events = this.melodyMeasures[currentMeasureIdx]?.melody ?? [];
      currentEventIdx += 1;

      if (currentEventIdx >= events.length) {
        currentMeasureIdx += 1;
        currentEventIdx = -1;
        continue;
      }

      const nextEvent = events[currentEventIdx];
      if (!nextEvent) continue;

      if (nextEvent.kind === 'note' && nextEvent.tieStop && nextEvent.displayKey === targetKey) {
        totalBeats += nextEvent.durationBeats;
        if (!nextEvent.tieStart) {
          break;
        }
      } else {
        break;
      }
    }

    return totalBeats;
  }

  private playMelodyBeat(time: number) {
    const measure = this.melodyMeasures[this.currentMeasure];
    if (!measure) {
      return;
    }

    const beatDuration = 60 / this.bpm;
    const beatStart = this.currentBeat;
    const beatEnd = beatStart + 1;

    for (const event of measure.melody) {
      if (event.kind !== 'note' || !event.concertFrequency) {
        continue;
      }
      if (event.tieStop) {
        // Skip tied notes so they sustain without re-attacking
        continue;
      }
      if (event.beat < beatStart || event.beat >= beatEnd) {
        continue;
      }

      const startTime = time + (event.beat - beatStart) * beatDuration;
      const combinedDurationBeats = this.calculateTiedDurationBeats(this.currentMeasure, event);
      const noteDuration = Math.max(0.08, combinedDurationBeats * beatDuration * 0.96);
      this.playMelodyNote(startTime, event.concertFrequency, noteDuration);
    }
  }

  private playMelodyNote(time: number, frequency: number, duration: number) {
    if (!this.ctx || !this.masterGain) {
      return;
    }

    const oscillator = this.ctx.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, time);

    const gain = this.ctx.createGain();
    const attack = 0.02;
    const release = Math.min(0.12, duration * 0.12);
    const sustainEnd = time + duration - release;

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.13, time + attack);       // attack
    gain.gain.setValueAtTime(0.13, Math.max(time + attack, sustainEnd)); // sustain
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration); // release

    oscillator.connect(gain).connect(this.masterGain);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.01);
  }

  private playDrums(time: number, beatsPerMeasure: number) {
    if (!this.ctx || !this.masterGain) {
      return;
    }

    const hatSource = this.ctx.createBufferSource();
    const hatBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
    const hatData = hatBuffer.getChannelData(0);
    for (let index = 0; index < hatData.length; index += 1) {
      hatData[index] = Math.random() * 2 - 1;
    }
    hatSource.buffer = hatBuffer;

    const hatFilter = this.ctx.createBiquadFilter();
    hatFilter.type = 'highpass';
    hatFilter.frequency.value = 7000;

    const hatGain = this.ctx.createGain();
    hatGain.gain.setValueAtTime(0.08, time);
    hatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    hatSource.connect(hatFilter).connect(hatGain).connect(this.masterGain);
    hatSource.start(time);
    hatSource.stop(time + 0.05);

    if (this.currentBeat === 0) {
      const kick = this.ctx.createOscillator();
      kick.frequency.setValueAtTime(150, time);
      kick.frequency.exponentialRampToValueAtTime(40, time + 0.1);

      const kickGain = this.ctx.createGain();
      kickGain.gain.setValueAtTime(0.3, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      kick.connect(kickGain).connect(this.masterGain);
      kick.start(time);
      kick.stop(time + 0.15);
    }

    const snareBeat = beatsPerMeasure === 3 ? 1 : 2;
    if (this.currentBeat === snareBeat) {
      const snareSource = this.ctx.createBufferSource();
      const snareBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
      const snareData = snareBuffer.getChannelData(0);
      for (let index = 0; index < snareData.length; index += 1) {
        snareData[index] = Math.random() * 2 - 1;
      }
      snareSource.buffer = snareBuffer;

      const snareFilter = this.ctx.createBiquadFilter();
      snareFilter.type = 'bandpass';
      snareFilter.frequency.value = 3000;

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.12, time);
      snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      snareSource.connect(snareFilter).connect(snareGain).connect(this.masterGain);
      snareSource.start(time);
      snareSource.stop(time + 0.08);
    }
  }

  private playBass(time: number, root: string, notes: string[], noteOffset: number) {
    if (!this.ctx || !this.masterGain) {
      return;
    }

    const beatDuration = 60 / this.bpm;
    const targetFrequency =
      noteOffset > 0 && notes.length > 1 ? noteFreq(notes[noteOffset % notes.length], 2) : noteFreq(root, 2);

    const oscillator = this.ctx.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = targetFrequency;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.setValueAtTime(0.2, time + beatDuration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, time + beatDuration * 0.95);

    oscillator.connect(gain).connect(this.masterGain);
    oscillator.start(time);
    oscillator.stop(time + beatDuration);
  }

  private playComp(time: number, root: string, notes: string[], durationBeats: number) {
    if (!this.ctx || !this.masterGain) {
      return;
    }

    const beatDuration = 60 / this.bpm;
    const duration = beatDuration * durationBeats * 0.8;

    notes.slice(0, 4).forEach((noteName) => {
      const frequency = noteFreq(noteName, 3);
      if (!this.ctx || !this.masterGain) {
        return;
      }

      const oscillator = this.ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      oscillator.connect(gain).connect(this.masterGain);
      oscillator.start(time);
      oscillator.stop(time + duration);
    });
  }
}

const ChordCell: React.FC<{ chord: string }> = ({ chord }) => {
  const chordInfo = useMemo(() => getChordInfo(chord), [chord]);

  if (!chordInfo) {
    return <span className="text-lg font-bold font-serif text-slate-700">{chord}</span>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-1">
      <div className="flex items-baseline font-serif">
        <span className="text-2xl font-black text-slate-900">{chordInfo.root}</span>
        {chordInfo.quality ? (
          <span className="ml-0.5 text-sm font-bold text-slate-600">
            {prettyQuality(chordInfo.quality)}
          </span>
        ) : null}
      </div>

      <div className="mt-1 flex items-center gap-0.5">
        {chordInfo.notes.map((note, index) => {
          const fingering = getFingeringText(note);

          return (
            <div
              key={`${note}-${index}`}
              className="flex flex-col items-center rounded bg-slate-100 px-1 py-0.5"
              title={`Note ${prettyNote(note)}: Pistons ${fingering}`}
            >
              <span className="text-[9px] font-bold text-slate-600">{prettyNote(note)}</span>
              <span className="text-[8px] font-black font-mono text-orange-600">{fingering}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChordGrid: React.FC<{
  measures: string[][];
  activeMeasure: number;
  onSelectMeasure?: (measureIndex: number) => void;
  loopEnabled?: boolean;
  loopStart?: number;
  loopEnd?: number;
}> = ({ measures, activeMeasure, onSelectMeasure, loopEnabled = false, loopStart = 0, loopEnd = 0 }) => {
  const measuresPerRow = typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 4;
  const rows: string[][][] = [];

  for (let index = 0; index < measures.length; index += measuresPerRow) {
    rows.push(measures.slice(index, index + measuresPerRow));
  }

  return (
    <div className="relative space-y-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {rows.map((row, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex w-full divide-x divide-slate-200 border-b border-slate-200 last:border-b-0"
        >
          <div className="flex w-6 shrink-0 items-center justify-center bg-slate-50 text-[9px] font-bold font-mono text-slate-400 md:w-8">
            {rowIndex * measuresPerRow + 1}
          </div>

          <div className="grid flex-1 divide-x divide-slate-200" style={{ gridTemplateColumns: `repeat(${measuresPerRow}, 1fr)` }}>
            {row.map((measure, measureOffset) => {
              const globalIndex = rowIndex * measuresPerRow + measureOffset;
              const isActive = globalIndex === activeMeasure;
              const isLooped = loopEnabled && globalIndex >= loopStart && globalIndex <= loopEnd;

              return (
                <div
                  key={`measure-${globalIndex}`}
                  onClick={() => onSelectMeasure?.(globalIndex)}
                  title={`Mesure ${globalIndex + 1} (Cliquer pour demarrer ici)`}
                  className={cn(
                    'relative flex min-h-[96px] flex-row items-center justify-around p-2 transition-colors duration-200 md:p-3 cursor-pointer hover:bg-amber-50/60',
                    isActive ? 'bg-orange-50/50' : isLooped ? 'bg-amber-50/30' : 'bg-white'
                  )}
                >
                  {isActive ? <div className="pointer-events-none absolute inset-0 z-10 ring-2 ring-inset ring-orange-400" /> : null}
                  {isLooped && !isActive ? <div className="pointer-events-none absolute inset-0 z-0 border border-amber-300/60 bg-amber-50/20" /> : null}

                  {loopEnabled && globalIndex === loopStart ? (
                    <span className="absolute left-1 top-1 z-20 rounded bg-amber-500 px-1 py-0.5 text-[8px] font-black text-white shadow-xs">A</span>
                  ) : null}
                  {loopEnabled && globalIndex === loopEnd ? (
                    <span className="absolute right-1 top-1 z-20 rounded bg-amber-500 px-1 py-0.5 text-[8px] font-black text-white shadow-xs">B</span>
                  ) : null}

                  {measure.length === 0 ? (
                    <span className="text-xl font-bold font-serif text-slate-300">%</span>
                  ) : (
                    measure.map((chord, chordIndex) => (
                      <React.Fragment key={`${globalIndex}-${chordIndex}`}>
                        {chordIndex > 0 ? <div className="my-2 w-px self-stretch bg-slate-100" /> : null}
                        <ChordCell chord={chord} />
                      </React.Fragment>
                    ))
                  )}
                </div>
              );
            })}

            {row.length < measuresPerRow
              ? Array.from({ length: measuresPerRow - row.length }).map((_, index) => (
                  <div key={`empty-${rowIndex}-${index}`} className="min-h-[96px] bg-slate-50/20 p-3" />
                ))
              : null}
          </div>
        </div>
      ))}
    </div>
  );
};

function TrackControls({
  tracks,
  hasLeadSheet,
  onToggleVisible,
  onToggleFingerings,
}: {
  tracks: ScoreTrack[];
  hasLeadSheet: boolean;
  onToggleVisible: (trackId: string, value: boolean) => void;
  onToggleFingerings: (trackId: string, value: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-orange-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Affichage & Pistons
          </p>
        </div>
        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[9px] font-extrabold text-orange-700">
          {tracks.filter((t) => t.visible).length} piste(s) active(s)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tracks.map((track) => {
          const isMelody = track.kind === 'melody';
          const disabled = isMelody && !hasLeadSheet;

          return (
            <div
              key={track.id}
              className={cn(
                'rounded-xl border p-3 space-y-2.5 transition-all',
                disabled ? 'border-slate-100 bg-slate-50/50 opacity-60' : 'border-slate-200 bg-slate-50/70'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">{track.label}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[9px] font-black uppercase',
                    track.audioEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {track.audioEnabled ? 'Audio' : 'Muet'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs hover:border-orange-200 transition-colors">
                  <span>Afficher partition</span>
                  <Switch
                    checked={track.visible}
                    disabled={disabled}
                    onCheckedChange={(checked) => onToggleVisible(track.id, checked)}
                  />
                </label>

                <label className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs hover:border-orange-200 transition-colors">
                  <span>Pistons / Doigtés</span>
                  <Switch
                    checked={track.fingeringEnabled}
                    disabled={disabled}
                    onCheckedChange={(checked) => onToggleFingerings(track.id, checked)}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function IrealChordViewerNext() {
  const [songs, setSongs] = useState<IRealSong[]>([]);
  const [standaloneSheets, setStandaloneSheets] = useState<StandaloneWikifoniaEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [wikifoniaMatches, setWikifoniaMatches] = useState<WikifoniaMatchMap>({});
  const [leadSheet, setLeadSheet] = useState<ParsedLeadSheet | null>(null);
  const [isSheetLoading, setIsSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [selectedComposer, setSelectedComposer] = useState<string | null>(null);
  const [matchFilter, setMatchFilter] = useState<SongMatchFilter>('all');
  const [transpose, setTranspose] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('chords');
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('ireal');
  const [tracks, setTracks] = useState<ScoreTrack[]>(createDefaultTracks());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackPosition | null>(null);
  const [playbackBpm, setPlaybackBpm] = useState(120);
  const [volume, setVolume] = useState(0.4);
  const [hasManualTempoOverride, setHasManualTempoOverride] = useState(false);

  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(0);

  const engineRef = useRef<UnifiedBackingTrackEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const activeMeasure = playbackState ? playbackState.measure : -1;
  const matchedSongKeys = useMemo(() => new Set(Object.keys(wikifoniaMatches)), [wikifoniaMatches]);
  const librarySongs = useMemo<LibrarySong[]>(() => {
    const irealSongs: LibrarySong[] = songs.map((song) => {
      const songKey = buildIrealSongKey(song.title, song.composer);
      return {
        id: `ireal:${songKey}`,
        title: song.title,
        composer: song.composer,
        style: song.style,
        keyLabel: song.key,
        song,
        sheet: wikifoniaMatches[songKey] ?? null,
        source: 'ireal',
      };
    });

    const standaloneSongs: LibrarySong[] = standaloneSheets.map((sheet) => ({
      id: `sheet:${sheet.id}`,
      title: sheet.title,
      composer: sheet.composer,
      style: 'Wikifonia',
      keyLabel: 'VexFlow',
      song: null,
      sheet,
      source: 'standalone',
    }));

    return [...irealSongs, ...standaloneSongs];
  }, [songs, standaloneSheets, wikifoniaMatches]);

  const selectedEntry = useMemo(
    () => librarySongs.find((entry) => entry.id === selectedEntryId) ?? null,
    [librarySongs, selectedEntryId]
  );
  const selectedSong = selectedEntry?.song ?? null;
  const selectedMatch: SheetReference | null = selectedEntry?.sheet ?? null;
  const hasAccompaniment = Boolean(selectedSong);

  useEffect(() => {
    engineRef.current = new UnifiedBackingTrackEngine();
    return () => {
      engineRef.current?.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedEntry || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
        return;
      }
      if (event.code === 'Space') {
        event.preventDefault();
        setIsPlaying((previous) => !previous);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntry]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [songsResult, matchesResult, standaloneResult] = await Promise.allSettled([
        fetch('/irealtexte.txt', { cache: 'no-store' })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Failed to load iReal data (${response.status})`);
            }
            return response.text();
          })
          .then((text) => parseIRealUrl(text)),
        fetch('/ireal-wikifonia-matches.json', { cache: 'no-store' })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Failed to load match manifest (${response.status})`);
            }
            return response.json();
          })
          .then((payload) => {
            const nextMatches: WikifoniaMatchMap = {};
            if (!Array.isArray(payload)) {
              return nextMatches;
            }

            payload.forEach((item) => {
              if (
                item &&
                typeof item.irealTitle === 'string' &&
                typeof item.irealComposer === 'string' &&
                typeof item.wikifoniaPath === 'string' &&
                typeof item.wikifoniaLabel === 'string'
              ) {
                const key = buildIrealSongKey(item.irealTitle, item.irealComposer);
                nextMatches[key] = {
                  irealTitle: item.irealTitle,
                  irealComposer: item.irealComposer,
                  matchType: 'exact-normalized-title',
                  wikifoniaPath: item.wikifoniaPath,
                  wikifoniaLabel: item.wikifoniaLabel,
                  hasChords: typeof item.hasChords === 'boolean' ? item.hasChords : undefined,
                };
              }
            });

            return nextMatches;
          }),
        fetch('/api/wikifonia-standalone', { cache: 'no-store' })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Failed to load standalone sheets (${response.status})`);
            }
            return response.json();
          })
          .then((payload) => (Array.isArray(payload) ? (payload as StandaloneWikifoniaEntry[]) : [])),
      ]);

      if (cancelled) {
        return;
      }

      if (songsResult.status === 'fulfilled') {
        setSongs(songsResult.value);
      }
      if (matchesResult.status === 'fulfilled') {
        setWikifoniaMatches(matchesResult.value);
      }
      if (standaloneResult.status === 'fulfilled') {
        setStandaloneSheets(standaloneResult.value);
      }

      setIsLoading(false);
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!selectedMatch) {
      setLeadSheet(null);
      setSheetError(null);
      setIsSheetLoading(false);
      return;
    }

    setIsSheetLoading(true);
    setSheetError(null);

    loadParsedLeadSheet(selectedMatch.wikifoniaPath)
      .then((parsed) => {
        if (cancelled) {
          return;
        }
        setLeadSheet(parsed);
        if (!hasManualTempoOverride && parsed.sourceTempo) {
          setPlaybackBpm(Math.round(parsed.sourceTempo));
        }
        setIsSheetLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        console.error('Error loading Wikifonia lead sheet:', error);
        setLeadSheet(null);
        setSheetError(error instanceof Error ? error.message : 'Unknown error');
        setIsSheetLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hasManualTempoOverride, selectedMatch]);

  const hasLeadSheet = Boolean(leadSheet);

  useEffect(() => {
    if (!selectedMatch && playbackMode !== 'ireal') {
      setPlaybackMode('ireal');
    }
  }, [hasAccompaniment, playbackMode, selectedEntry, selectedMatch]);

  const transposedMeasures = useMemo(() => {
    if (!selectedSong) {
      return [];
    }
    return transposeMeasures(selectedSong.measures, transpose);
  }, [selectedSong, transpose]);

  // Partition VexFlow transposée au même demi-ton que les accords iReal
  const transposedLeadSheet = useMemo(() => {
    if (!leadSheet) return null;
    return transposeLeadSheet(leadSheet, transpose);
  }, [leadSheet, transpose]);

  const defaultBeatsPerMeasure = useMemo(() => {
    if (leadSheet?.beatsPerMeasure) {
      return leadSheet.beatsPerMeasure;
    }
    return getBeatsFromTimeSignature(selectedSong?.timeSignature ?? '44', 4);
  }, [leadSheet?.beatsPerMeasure, selectedSong?.timeSignature]);

  const totalMeasuresCount = useMemo(() => {
    return Math.max(transposedMeasures.length, leadSheet?.measures.length ?? 0);
  }, [transposedMeasures.length, leadSheet?.measures.length]);

  useEffect(() => {
    if (totalMeasuresCount > 0 && loopEnd >= totalMeasuresCount) {
      setLoopEnd(Math.max(0, totalMeasuresCount - 1));
    }
  }, [totalMeasuresCount, loopEnd]);

  useEffect(() => {
    if (!engineRef.current) {
      return;
    }

    const flags = getPlaybackFlags(playbackMode, { hasLeadSheet, hasAccompaniment });
    engineRef.current.configure({
      accompanimentMeasures: transposedMeasures,
      melodyMeasures: transposedLeadSheet?.melodyTrack,
      bpm: playbackBpm,
      defaultBeatsPerMeasure,
      accompanimentEnabled: flags.accompanimentEnabled,
      melodyEnabled: flags.melodyEnabled,
      loopEnabled,
      loopStartMeasure: loopStart,
      loopEndMeasure: loopEnd,
    });
  }, [
    defaultBeatsPerMeasure,
    hasAccompaniment,
    hasLeadSheet,
    transposedLeadSheet?.melodyTrack,
    loopEnabled,
    loopStart,
    loopEnd,
    playbackBpm,
    playbackMode,
    transposedMeasures,
  ]);

  useEffect(() => {
    engineRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    function updateLoop() {
      if (isPlaying && engineRef.current) {
        const position = engineRef.current.getCurrentPosition();
        if (position) {
          setPlaybackState((previous) =>
            previous?.measure !== position.measure || Math.abs((previous?.beat ?? -1) - position.beat) > 0.05
              ? position
              : previous
          );
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    }

    if (isPlaying) {
      updateLoop();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setPlaybackState(null);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const composers = useMemo(() => {
    const values = librarySongs
      .map((entry) => entry.composer)
      .filter((composer) => composer && composer.trim() !== '' && composer !== 'Unknown' && composer !== 'Traditional');
    return Array.from(new Set(values)).sort();
  }, [librarySongs]);

  const totalSheetCount = useMemo(() => {
    return (
      songs.reduce((count, song) => {
        return count + (matchedSongKeys.has(buildIrealSongKey(song.title, song.composer)) ? 1 : 0);
      }, 0) + standaloneSheets.length
    );
  }, [matchedSongKeys, songs, standaloneSheets.length]);

  const baseFilteredEntries = useMemo(() => {
    let list = librarySongs;

    if (selectedComposer) {
      list = list.filter((entry) => entry.composer === selectedComposer);
    }

    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase();
      list = list.filter(
        (entry) =>
          entry.title.toLowerCase().includes(normalizedQuery) ||
          entry.composer.toLowerCase().includes(normalizedQuery)
      );
    } else if (activeLetter && !selectedComposer) {
      if (activeLetter === '#') {
        list = list.filter((entry) => !/^[A-Za-z]/.test(entry.title));
      } else {
        list = list.filter((entry) => entry.title.toUpperCase().startsWith(activeLetter));
      }
    }

    return list;
  }, [activeLetter, librarySongs, searchQuery, selectedComposer]);

  const filterCounts = useMemo(() => {
    let withSheet = 0;
    let standalone = 0;
    const top50Ranks = new Set<number>();

    baseFilteredEntries.forEach((entry) => {
      const meta = getTop50Meta(entry);
      if (meta) {
        top50Ranks.add(meta.rank);
      }
      if (entry.source === 'standalone') {
        standalone += 1;
        withSheet += 1;
        return;
      }

      if (entry.sheet) {
        withSheet += 1;
      }
    });

    return {
      all: baseFilteredEntries.length,
      top50: top50Ranks.size,
      withSheet,
      withoutSheet: baseFilteredEntries.filter((entry) => entry.source === 'ireal' && !entry.sheet).length,
      standalone,
    };
  }, [baseFilteredEntries]);

  const filteredEntries = useMemo(() => {
    let list = baseFilteredEntries;

    if (matchFilter === 'top-50') {
      const top50List = list.filter((entry) => isTop50Song(entry));
      // Dédoublonnage strict par rang #1..#50 pour garantir 50 morceaux uniques
      const uniqueByRank = new Map<number, LibrarySong>();
      for (const entry of top50List) {
        const meta = getTop50Meta(entry);
        if (meta && !uniqueByRank.has(meta.rank)) {
          uniqueByRank.set(meta.rank, entry);
        }
      }

      return Array.from(uniqueByRank.values()).sort((left, right) => {
        const metaLeft = getTop50Meta(left);
        const metaRight = getTop50Meta(right);
        const rankLeft = metaLeft ? metaLeft.rank : 999;
        const rankRight = metaRight ? metaRight.rank : 999;
        return rankLeft - rankRight;
      });
    } else if (matchFilter === 'with-sheet') {
      list = list.filter((entry) => (entry.source === 'ireal' && Boolean(entry.sheet)) || entry.source === 'standalone');
    } else if (matchFilter === 'without-sheet') {
      list = list.filter((entry) => entry.source === 'ireal' && !entry.sheet);
    } else if (matchFilter === 'standalone') {
      list = list.filter((entry) => entry.source === 'standalone');
    }

    return [...list].sort((left, right) => {
      const titleCompare = left.title.localeCompare(right.title);
      if (titleCompare !== 0) {
        return titleCompare;
      }

      return left.composer.localeCompare(right.composer);
    });
  }, [baseFilteredEntries, matchFilter]);

  const handleSelectEntry = useCallback((entry: LibrarySong) => {
    const songHasMatch = Boolean(entry.sheet);
    const hasEntryAccompaniment = Boolean(entry.song);

    setSelectedEntryId(entry.id);
    setTranspose(0);
    // Si le morceau possède une partition (Wikifonia match ou standalone), afficher directement la partition VexFlow
    setDisplayMode(songHasMatch || entry.source === 'standalone' ? 'sheet' : 'chords');
    setPlaybackMode(hasEntryAccompaniment ? (songHasMatch ? 'both' : 'ireal') : 'melody');
    setTracks(createDefaultTracks({ hasAccompaniment: hasEntryAccompaniment }));
    setPlaybackBpm(Math.round(entry.song?.bpm ?? 120));
    setHasManualTempoOverride(false);
    setIsPlaying(false);
    setPlaybackState(null);
    setLoopEnabled(false);
    setLoopStart(0);
    setLoopEnd(0);
    engineRef.current?.stop();
  }, []);

  const handleStop = useCallback(() => {
    engineRef.current?.stop();
    setIsPlaying(false);
    setPlaybackState(null);
  }, []);

  const handleSelectMeasure = useCallback(
    (measureIndex: number, beat = 0) => {
      setPlaybackState({ measure: measureIndex, beat, time: performance.now() });
      engineRef.current?.seekTo(measureIndex, beat);
      if (isPlaying && engineRef.current) {
        engineRef.current.start(true);
      }
    },
    [isPlaying]
  );

  const togglePlayback = useCallback(() => {
    if (!selectedEntry || !engineRef.current || (!hasAccompaniment && !hasLeadSheet)) {
      return;
    }

    if (isPlaying) {
      engineRef.current.stop();
      setIsPlaying(false);
      setPlaybackState(null);
      return;
    }

    engineRef.current.start(Boolean(playbackState && playbackState.measure > 0));
    setIsPlaying(true);
  }, [hasAccompaniment, hasLeadSheet, isPlaying, playbackState, selectedEntry]);

  const updateTrack = useCallback((trackId: string, patch: Partial<ScoreTrack>) => {
    setTracks((previousTracks) =>
      previousTracks.map((track) => (track.id === trackId ? { ...track, ...patch } : track))
    );
  }, []);

  const melodyPlayable = hasLeadSheet;
  const canUseSheetModes = Boolean(selectedMatch);
  const showChordViews = hasAccompaniment && (displayMode === 'chords' || displayMode === 'split');
  const showSheetView = canUseSheetModes && (displayMode === 'sheet' || displayMode === 'split');

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (selectedEntry) {
    return (
      <div className="space-y-4 pl-14 sm:pl-16 pr-1 sm:pr-2 w-full">
        <div className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              handleStop();
              setSelectedEntryId(null);
            }}
            className="rounded-full bg-white shadow-sm hover:text-orange-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <h2 className="text-xl font-black text-slate-800">{selectedEntry.title}</h2>
            <div className="mt-1 flex gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <span>{selectedEntry.composer}</span>
              <span className="text-orange-500">{selectedEntry.style}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <span
                className={cn(
                  'rounded-full px-2.5 py-1',
                  selectedEntry.source === 'standalone'
                    ? 'bg-sky-100 text-sky-700'
                    : canUseSheetModes
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-500'
                )}
              >
                {selectedEntry.source === 'standalone'
                  ? 'Partition seule'
                  : canUseSheetModes
                    ? 'Partition'
                    : 'Pas de partition'}
              </span>
              {selectedMatch ? <span className="text-slate-400">{selectedMatch.wikifoniaLabel}</span> : null}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Tonalité
            </div>
            {(selectedSong || canUseSheetModes) ? (
              <div className="flex items-center gap-1.5">
                {selectedSong ? (
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-black text-slate-800 shadow-sm">
                    {transposeChord(selectedSong.key, transpose)}
                  </span>
                ) : (
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 shadow-sm">
                    Partition
                  </span>
                )}
                {transpose !== 0 ? (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-700">
                    {transpose > 0 ? `+${transpose}` : transpose}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Sélecteur mode d'affichage */}
        {(hasAccompaniment || canUseSheetModes) ? (
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mode d'affichage</p>
            {canUseSheetModes && !hasAccompaniment ? (
              <p className="text-xs text-slate-500">
                Cette entrée provient uniquement de Wikifonia, avec lecture et affichage en mode mélodie seule.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: 'chords' as DisplayMode, label: 'Accords', available: hasAccompaniment },
                  { value: 'sheet' as DisplayMode, label: 'Partition VexFlow', available: canUseSheetModes },
                  { value: 'split' as DisplayMode, label: 'Les deux', available: hasAccompaniment && canUseSheetModes },
                ]
                  .filter((opt) => opt.available)
                  .map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDisplayMode(opt.value)}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-colors',
                        displayMode === opt.value
                          ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        ) : null}

        <TrackControls
          tracks={tracks}
          hasLeadSheet={hasLeadSheet}
          onToggleVisible={(id, val) => updateTrack(id, { visible: val })}
          onToggleFingerings={(id, val) => updateTrack(id, { fingeringEnabled: val })}
        />

        {showChordViews ? (
          <>
            <div className="mt-4 flex items-center gap-4 border-b border-slate-100 px-2 pb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1">
                <span className="mr-1 rounded border border-orange-100 bg-orange-50 px-1.5 py-0.5 text-orange-500 shadow-sm">Do/C</span>
                Notes (transposees en Sib)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-800" />
                <span className="h-2.5 w-2.5 rounded-full border-slate-300 bg-slate-200" />
                Pistons (Cliquer sur une mesure pour s'y rendre)
              </span>
            </div>

            <ChordGrid
              measures={transposedMeasures}
              activeMeasure={activeMeasure}
              onSelectMeasure={handleSelectMeasure}
              loopEnabled={loopEnabled}
              loopStart={loopStart}
              loopEnd={loopEnd}
            />
          </>
        ) : null}

        {showSheetView ? (
          isSheetLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent" />
              <p className="mt-3 text-sm font-semibold text-slate-600">Chargement de la partition Wikifonia...</p>
            </div>
          ) : sheetError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Partition Wikifonia</div>
              <p className="mt-2 font-semibold">Impossible de charger cette partition.</p>
              <p className="mt-1 text-red-600">{sheetError}</p>
            </div>
          ) : transposedLeadSheet ? (
            <WikifoniaVexScore
              leadSheet={transposedLeadSheet}
              accompanimentMeasures={transposedMeasures}
              defaultBeatsPerMeasure={defaultBeatsPerMeasure}
              tracks={tracks}
              playbackState={playbackState}
              isPlaying={isPlaying}
              onSelectMeasure={handleSelectMeasure}
              loopEnabled={loopEnabled}
              loopStart={loopStart}
              loopEnd={loopEnd}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 shadow-sm">
              Partition indisponible pour le moment.
            </div>
          )
        ) : null}

        {/* Barre de controle verticale fixee a gauche */}
        <div className="fixed left-3 top-1/2 z-50 -translate-y-1/2 flex flex-col items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/95 px-2 py-3 shadow-2xl backdrop-blur-md">

          {/* Play / Stop */}
          <Button
            size="icon"
            onClick={togglePlayback}
            className={cn(
              'h-11 w-11 rounded-full shadow-md transition-transform active:scale-95',
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
            )}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={handleStop}
            className="h-8 w-8 rounded-full border-slate-200 bg-white hover:bg-slate-100"
            title="Arreter / Reinitialiser"
          >
            <Square className="h-3.5 w-3.5 text-slate-700" />
          </Button>

          <div className="my-0.5 h-px w-full bg-slate-100" />

          {/* Tempo */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">BPM</span>
            <span className="text-sm font-black text-slate-800 tabular-nums">{playbackBpm}</span>
            <input
              type="range"
              min={40}
              max={240}
              step={1}
              value={playbackBpm}
              onChange={(e) => {
                setPlaybackBpm(Number(e.target.value));
                setHasManualTempoOverride(true);
              }}
              className="h-20 w-2 cursor-pointer appearance-none rounded-full bg-slate-200 accent-orange-500"
              style={{ writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties}
              title={`Tempo: ${playbackBpm} BPM`}
            />
          </div>

          <div className="my-0.5 h-px w-full bg-slate-100" />

          {/* Transposition */}
          {(selectedSong || canUseSheetModes) ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Ton</span>
              <button
                type="button"
                onClick={() => { setTranspose((p) => Math.min(5, p + 1)); handleStop(); }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-orange-100 hover:text-orange-700 text-xs font-black"
                title="+1 demi-ton"
              >
                +
              </button>
              <span
                className={cn(
                  'rounded px-1 py-0.5 text-[10px] font-black tabular-nums',
                  transpose !== 0 ? 'bg-amber-100 text-amber-700' : 'text-slate-500'
                )}
              >
                {transpose > 0 ? `+${transpose}` : transpose}
              </span>
              <button
                type="button"
                onClick={() => { setTranspose((p) => Math.max(-5, p - 1)); handleStop(); }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-orange-100 hover:text-orange-700 text-xs font-black"
                title="-1 demi-ton"
              >
                -
              </button>
            </div>
          ) : null}

          <div className="my-0.5 h-px w-full bg-slate-100" />

          {/* Boucle A-B */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Loop</span>
            <Switch
              id="loop-toggle-bar"
              checked={loopEnabled}
              onCheckedChange={(checked) => {
                setLoopEnabled(checked);
                if (checked && totalMeasuresCount > 0 && loopEnd === 0) {
                  setLoopEnd(Math.max(0, totalMeasuresCount - 1));
                }
              }}
            />
            {loopEnabled ? (
              <>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] font-black text-amber-600">A</span>
                  <select
                    value={loopStart}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setLoopStart(val);
                      if (val > loopEnd) setLoopEnd(val);
                    }}
                    className="w-12 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px] font-bold text-slate-800 outline-none text-center"
                  >
                    {Array.from({ length: totalMeasuresCount || 1 }, (_, i) => (
                      <option key={`ls-${i}`} value={i}>M{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] font-black text-amber-600">B</span>
                  <select
                    value={loopEnd}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setLoopEnd(val);
                      if (val < loopStart) setLoopStart(val);
                    }}
                    className="w-12 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px] font-bold text-slate-800 outline-none text-center"
                  >
                    {Array.from({ length: totalMeasuresCount || 1 }, (_, i) => (
                      <option key={`le-${i}`} value={i}>M{i + 1}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <Input
            placeholder="Rechercher par titre ou compositeur..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setActiveLetter(null);
            }}
            className="border-slate-200 bg-slate-50 pl-9"
          />
        </div>

        <select
          value={selectedComposer ?? ''}
          onChange={(event) => {
            setSelectedComposer(event.target.value || null);
            setActiveLetter(null);
            setSearchQuery('');
          }}
          className="max-w-[140px] truncate rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Tous les artistes</option>
          {composers.map((composer) => (
            <option key={composer} value={composer}>
              {composer}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Filtres Wikifonia</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-700">
                {filterCounts.withSheet} entree{filterCounts.withSheet > 1 ? 's' : ''} avec partition
              </span>
              <span>
                {totalSheetCount}/{librarySongs.length} entrees ont une partition VexFlow
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {[
              { value: 'top-50' as SongMatchFilter, label: '⭐ Top 50 Incontournables', count: filterCounts.top50 },
              { value: 'all' as SongMatchFilter, label: 'Tous', count: filterCounts.all },
              { value: 'with-sheet' as SongMatchFilter, label: 'Avec partition', count: filterCounts.withSheet },
              { value: 'without-sheet' as SongMatchFilter, label: 'Sans partition', count: filterCounts.withoutSheet },
              { value: 'standalone' as SongMatchFilter, label: 'Partitions seules', count: filterCounts.standalone },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMatchFilter(option.value)}
                className={cn(
                  'rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider transition-colors',
                  matchFilter === option.value
                    ? option.value === 'top-50'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200 ring-2 ring-amber-300'
                      : option.value === 'with-sheet'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                        : option.value === 'without-sheet'
                          ? 'bg-slate-700 text-white shadow-lg shadow-slate-200'
                          : option.value === 'standalone'
                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-200'
                            : 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                    : option.value === 'top-50'
                      ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold'
                      : option.value === 'with-sheet'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : option.value === 'standalone'
                          ? 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                )}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {!searchQuery && !selectedComposer ? (
        <div className="flex flex-wrap justify-center gap-1 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveLetter(null)}
            className={cn(
              'rounded-md px-2 py-1 text-[10px] font-bold transition-colors',
              !activeLetter ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            TOUT
          </button>
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
            <button
              key={letter}
              onClick={() => setActiveLetter(letter)}
              className={cn(
                'rounded-md px-2 py-1 text-[10px] font-bold transition-colors',
                activeLetter === letter ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'
              )}
            >
              {letter}
            </button>
          ))}
          <button
            onClick={() => setActiveLetter('#')}
            className={cn(
              'rounded-md px-2 py-1 text-[10px] font-bold transition-colors',
              activeLetter === '#' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            #
          </button>
        </div>
      ) : null}

      <div className="max-h-[60vh] space-y-1.5 overflow-y-auto pr-1">
        {filteredEntries.slice(0, activeLetter || matchFilter === 'top-50' ? undefined : 150).map((entry) => {
          const top50Meta = getTop50Meta(entry);
          return (
            <div key={entry.id}>
              <button
                onClick={() => handleSelectEntry(entry)}
                className={cn(
                  'w-full rounded-xl border px-4 py-3 text-left transition-all hover:shadow-sm active:scale-[0.98]',
                  top50Meta && matchFilter === 'top-50'
                    ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300 hover:bg-amber-50/50'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {top50Meta && matchFilter === 'top-50' ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 font-black text-xs text-white shadow-xs">
                        #{top50Meta.rank}
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-bold text-slate-800 truncate">{entry.title}</div>
                        {top50Meta ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-800">
                            ⭐ {top50Meta.category}
                          </span>
                        ) : null}
                        {entry.source === 'standalone' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-sky-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                            Partition seule
                          </span>
                        ) : entry.sheet ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Partition
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        <span>{entry.composer}</span>
                        <span>•</span>
                        <span className="text-slate-500">{top50Meta ? top50Meta.desc : entry.style}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex h-6 shrink-0 items-center rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-500">
                    {entry.keyLabel}
                  </div>
                </div>
              </button>
            </div>
          );
        })}

        {filteredEntries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Aucun morceau pour ce filtre.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default IrealChordViewerNext;
