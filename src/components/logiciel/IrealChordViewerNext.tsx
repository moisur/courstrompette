"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Pause, Play, Search, Square } from 'lucide-react';
import Vex from 'vexflow';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import { IRealSong, parseIRealUrl, transposeMeasures } from './iRealParser';
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
import { loadParsedLeadSheet, ParsedLeadSheet, ParsedLeadSheetMeasure } from './musicXmlLeadSheet';
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

const VF = Vex.Flow;

type WikifoniaMatchMap = Record<string, IrealWikifoniaMatch>;
type SongMatchFilter = 'all' | 'with-sheet' | 'without-sheet' | 'standalone';

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
  }) {
    this.accompanimentMeasures = options.accompanimentMeasures;
    this.melodyMeasures = options.melodyMeasures ?? [];
    this.bpm = options.bpm;
    this.defaultBeatsPerMeasure = options.defaultBeatsPerMeasure;
    this.accompanimentEnabled = options.accompanimentEnabled;
    this.melodyEnabled = options.melodyEnabled;
    this.totalMeasures = Math.max(this.accompanimentMeasures.length, this.melodyMeasures.length);
  }

  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  start() {
    if (this.totalMeasures === 0) {
      return;
    }

    this.init();
    if (!this.ctx) {
      return;
    }

    this.isRunning = true;
    this.currentBeat = 0;
    this.currentMeasure = 0;
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
    this.currentMeasure = 0;
    this.currentBeat = 0;
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
      if (this.currentMeasure >= this.totalMeasures) {
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
      if (event.beat < beatStart || event.beat >= beatEnd) {
        continue;
      }

      const startTime = time + (event.beat - beatStart) * beatDuration;
      const noteDuration = Math.max(0.08, Math.min(event.durationBeats * beatDuration * 0.92, beatDuration * 4));
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
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.11, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    oscillator.connect(gain).connect(this.masterGain);
    oscillator.start(time);
    oscillator.stop(time + duration);
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

  private playComp(time: number, root: string, notes: string[], beats: number) {
    if (!this.ctx || !this.masterGain) {
      return;
    }

    const sustainDuration = Math.max((60 / this.bpm) * beats, 0.2);
    const voicing = notes.length > 0 ? notes.slice(0, 4) : [root];

    voicing.forEach((note, index) => {
      const oscillator = this.ctx!.createOscillator();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = noteFreq(note, 4);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(index === 0 ? 0.045 : 0.03, time + 0.02);
      gain.gain.setValueAtTime(index === 0 ? 0.045 : 0.03, time + sustainDuration * 0.88);
      gain.gain.exponentialRampToValueAtTime(0.001, time + sustainDuration);

      oscillator.connect(gain).connect(this.masterGain!);
      oscillator.start(time);
      oscillator.stop(time + sustainDuration);
    });
  }
}

const VexFlowFullScore: React.FC<{
  measures: string[][];
  beatsPerMeasure: number;
  playbackState: PlaybackPosition | null;
  isPlaying: boolean;
}> = ({ measures, beatsPerMeasure, playbackState, isPlaying }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousHighlightIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!containerRef.current || measures.length === 0) {
      return;
    }

    const container = containerRef.current;
    container.innerHTML = '';

    const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
    const width = Math.max(800, container.parentElement?.clientWidth ?? 800);
    const measuresPerLine = 4;
    const lineCount = Math.ceil(measures.length / measuresPerLine);
    const staveHeight = 150;
    const renderedNotes: RenderedNoteMeta[] = [];

    renderer.resize(width, lineCount * staveHeight + 20);
    const context = renderer.getContext();
    context.setFont('Arial', 10, 400).setBackgroundFillStyle('#FFF');

    const availableWidth = width - 20;
    const measureWidth = availableWidth / measuresPerLine;

    for (let line = 0; line < lineCount; line += 1) {
      const startY = 20 + line * staveHeight;

      for (let offset = 0; offset < measuresPerLine; offset += 1) {
        const measureIndex = line * measuresPerLine + offset;
        if (measureIndex >= measures.length) {
          break;
        }

        const segments = buildChordBeatSegments(measures[measureIndex], beatsPerMeasure);
        const startX = 10 + offset * measureWidth;
        const stave = new VF.Stave(startX, startY, measureWidth);

        if (offset === 0) {
          stave.addClef('treble');
        }
        if (measureIndex === 0) {
          stave.addTimeSignature(`${beatsPerMeasure}/4`);
        }

        stave.setContext(context).draw();

        const tickables: Vex.Flow.StaveNote[] = [];

        for (const segment of segments) {
          const chordInfo = getChordInfo(segment.chord);
          if (!chordInfo) {
            continue;
          }

          for (let beatOffset = 0; beatOffset < segment.duration; beatOffset += 1) {
            const noteIndex = beatOffset % chordInfo.trumpetNotes.length;
            const trumpetNote = chordInfo.trumpetNotes[noteIndex];
            const noteName = trumpetNote.replace(/[0-9]/g, '');
            const octave = trumpetNote.match(/[0-9]/)?.[0] ?? '4';
            const vexKey = `${noteName[0].toLowerCase()}${noteName.length > 1 ? noteName.slice(1) : ''}/${octave}`;
            const note = new VF.StaveNote({
              clef: 'treble',
              keys: [vexKey],
              duration: 'q',
            });

            const accidentalMatch = trumpetNote.match(/^[A-G]([b#])/i);
            if (accidentalMatch) {
              note.addModifier(new VF.Accidental(accidentalMatch[1]), 0);
            }

            const fingering = chordInfo.fingerings[noteIndex];
            if (fingering) {
              note.addModifier(
                new VF.Annotation(getFingeringText(fingering))
                  .setFont('Arial', 10, 'bold')
                  .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM),
                0
              );
            }

            if (beatOffset === 0) {
              note.addModifier(
                new VF.Annotation(chordInfo.chordStr)
                  .setFont('Arial', 13, 'bold')
                  .setVerticalJustification(VF.Annotation.VerticalJustify.TOP),
                0
              );
            }

            const noteId = `chord-score-note-${renderedNotes.length}`;
            renderedNotes.push({
              id: noteId,
              measureIndex,
              startBeat: segment.startBeat + beatOffset,
              endBeat: segment.startBeat + beatOffset + 1,
            });
            tickables.push(note);
          }
        }

        while (tickables.length < beatsPerMeasure) {
          const rest = new VF.StaveNote({ clef: 'treble', keys: ['b/4'], duration: 'qr' });
          const noteId = `chord-score-note-${renderedNotes.length}`;
          renderedNotes.push({
            id: noteId,
            measureIndex,
            startBeat: tickables.length,
            endBeat: tickables.length + 1,
          });
          tickables.push(rest);
        }

        const voice = new VF.Voice({ num_beats: beatsPerMeasure, beat_value: 4 }).setStrict(false);
        voice.addTickables(tickables);
        new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
        voice.draw(context, stave);
      }
    }

    const svg = container.querySelector('svg');
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${width} ${lineCount * staveHeight + 20}`);
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxWidth = '100%';
      svg.style.display = 'block';
      svg.style.backgroundColor = '#ffffff';
    }

    const domNotes = Array.from(container.querySelectorAll('.vf-stavenote'));
    domNotes.forEach((node, index) => {
      const meta = renderedNotes[index];
      if (!meta) {
        return;
      }

      node.setAttribute('id', meta.id);
      node.setAttribute('data-measure-index', String(meta.measureIndex));
      node.setAttribute('data-start-beat', String(meta.startBeat));
      node.setAttribute('data-end-beat', String(meta.endBeat));
      node.querySelectorAll('*').forEach((child) => {
        child.setAttribute('style', 'transition: fill 0.12s ease-out, stroke 0.12s ease-out;');
      });
    });
  }, [beatsPerMeasure, measures]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    previousHighlightIdsRef.current.forEach((noteId) => {
      recolorRenderedNote(containerRef.current?.querySelector(`#${noteId}`) ?? null, '#000000');
    });
    previousHighlightIdsRef.current = [];

    if (!isPlaying || !playbackState) {
      return;
    }

    const activeNodes = Array.from(containerRef.current.querySelectorAll<HTMLElement>('.vf-stavenote')).filter((node) => {
      const measureIndex = Number(node.dataset.measureIndex);
      const startBeat = Number(node.dataset.startBeat);
      const endBeat = Number(node.dataset.endBeat);
      return measureIndex === playbackState.measure && playbackState.beat >= startBeat && playbackState.beat < endBeat;
    });

    activeNodes.forEach((node) => recolorRenderedNote(node, '#F97316'));
    previousHighlightIdsRef.current = activeNodes.map((node) => node.id);

    if (playbackState.beat < 0.2) {
      activeNodes[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isPlaying, playbackState]);

  return (
    <section className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="mb-2 flex items-center justify-between px-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span>Partition VexFlow</span>
        <span>Accords transposes</span>
      </div>
      <div className="relative min-w-[800px]">
        <div ref={containerRef} className="w-full" />
      </div>
    </section>
  );
};

const ChordCell: React.FC<{ chord: string }> = ({ chord }) => {
  const info = useMemo(() => getChordInfo(chord), [chord]);

  if (!chord || chord === 'N.C.') {
    return (
      <span className="flex flex-1 items-center justify-center text-sm font-semibold italic text-slate-400">
        N.C.
      </span>
    );
  }

  if (!info) {
    return <span className="flex flex-1 items-center justify-center font-bold text-slate-500">{chord}</span>;
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-1.5 py-1">
      <div className="flex items-baseline justify-center whitespace-nowrap font-bold leading-none">
        <span className="text-lg tracking-tight text-slate-800">{prettyNote(info.root)}</span>
        <span className="text-xs font-black tracking-tight text-orange-500">{prettyQuality(info.quality)}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-[3px]">
        {info.trumpetNotes.map((note, index) => {
          const fingering = info.fingerings[index];
          const noteName = note.replace(/[0-9]/g, '');

          return (
            <div key={`${note}-${index}`} className="flex flex-col items-center gap-[3px]">
              <div className="flex min-w-[22px] flex-col items-center justify-center rounded bg-orange-50 px-1.5 py-1 shadow-sm">
                <div className="text-[10px] font-black leading-none text-orange-600">{prettyNote(noteName)}</div>
                <div className="relative z-10 mt-[2px] text-[6px] font-bold uppercase leading-none tracking-tighter text-orange-600/60">
                  {ROMANCE_NOTES[noteName]}
                </div>
              </div>
              <div className="flex gap-[1px]">
                {fingering
                  ? fingering.split('').map((piston, pistonIndex) => (
                      <div
                        key={`${note}-${index}-${pistonIndex}`}
                        className={cn(
                          'flex h-[11px] w-[11px] items-center justify-center rounded-full text-[6px] font-black leading-none',
                          piston === '1' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-300'
                        )}
                      >
                        {pistonIndex + 1}
                      </div>
                    ))
                  : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChordGrid: React.FC<{ measures: string[][]; activeMeasure: number }> = ({ measures, activeMeasure }) => {
  const measuresPerRow = typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 4;
  const rows: string[][][] = [];

  for (let index = 0; index < measures.length; index += measuresPerRow) {
    rows.push(measures.slice(index, index + measuresPerRow));
  }

  return (
    <div className="relative space-y-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
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

              return (
                <div
                  key={`measure-${globalIndex}`}
                  className={cn(
                    'relative flex min-h-[96px] flex-row items-center justify-around p-2 transition-colors duration-200 md:p-3',
                    isActive ? 'bg-orange-50/50' : 'bg-white'
                  )}
                >
                  {isActive ? <div className="pointer-events-none absolute inset-0 z-10 ring-2 ring-inset ring-orange-400" /> : null}

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
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pistes</p>
          <p className="mt-1 text-xs text-slate-500">Affichage, audio actif et pistons par piste.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {tracks.map((track) => {
          const isMelody = track.kind === 'melody';
          const disabled = isMelody && !hasLeadSheet;

          return (
            <div
              key={track.id}
              className={cn(
                'rounded-xl border p-3',
                disabled ? 'border-slate-100 bg-slate-50' : 'border-slate-200 bg-slate-50/60'
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{track.label}</h3>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {track.audioEnabled ? 'Audio actif' : 'Audio muet'}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider',
                    track.audioEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {track.audioEnabled ? 'On' : 'Off'}
                </span>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-700">Visible</div>
                    <div className="text-[11px] text-slate-500">Affiche cette piste dans la partition VexFlow.</div>
                  </div>
                  <Switch
                    checked={track.visible}
                    disabled={disabled}
                    onCheckedChange={(checked) => onToggleVisible(track.id, checked)}
                  />
                </label>

                <label className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-700">Pistons</div>
                    <div className="text-[11px] text-slate-500">Affiche les doigtes directement sous la piste.</div>
                  </div>
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
    </section>
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
                typeof item.wikifoniaLabel === 'string' &&
                item.matchType === 'exact-normalized-title'
              ) {
                nextMatches[buildIrealSongKey(item.irealTitle, item.irealComposer)] = item as IrealWikifoniaMatch;
              }
            });

            return nextMatches;
          }),
        fetch('/api/wikifonia-standalone', { cache: 'no-store' })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Failed to load standalone manifest (${response.status})`);
            }
            return response.json();
          })
          .then((payload) => {
            if (!Array.isArray(payload)) {
              return [] as StandaloneWikifoniaEntry[];
            }

            return payload.filter(
              (item): item is StandaloneWikifoniaEntry =>
                Boolean(item) &&
                typeof item.id === 'string' &&
                typeof item.title === 'string' &&
                typeof item.composer === 'string' &&
                typeof item.wikifoniaPath === 'string' &&
                typeof item.wikifoniaLabel === 'string' &&
                item.matchType === 'standalone-rendered-score'
            );
          }),
      ]);

      if (cancelled) {
        return;
      }

      if (songsResult.status === 'fulfilled') {
        setSongs(songsResult.value);
      } else {
        console.error('Failed to load iReal songs:', songsResult.reason);
      }

      if (matchesResult.status === 'fulfilled') {
        setWikifoniaMatches(matchesResult.value);
      } else {
        console.error('Failed to load Wikifonia matches:', matchesResult.reason);
      }

      if (standaloneResult.status === 'fulfilled') {
        setStandaloneSheets(standaloneResult.value);
      } else {
        console.error('Failed to load standalone Wikifonia scores:', standaloneResult.reason);
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
      .then((sheet) => {
        if (cancelled) {
          return;
        }
        setLeadSheet(sheet);
        setIsSheetLoading(false);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        console.error('Failed to load Wikifonia lead sheet:', error);
        setLeadSheet(null);
        setSheetError(error instanceof Error ? error.message : 'Impossible de parser cette partition.');
        setIsSheetLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedMatch]);

  const hasLeadSheet = Boolean(leadSheet && !sheetError);

  useEffect(() => {
    if (!selectedEntry || hasManualTempoOverride) {
      return;
    }
    setPlaybackBpm(Math.round(leadSheet?.sourceTempo ?? selectedSong?.bpm ?? 120));
  }, [hasManualTempoOverride, leadSheet?.sourceTempo, selectedEntry, selectedSong?.bpm]);

  useEffect(() => {
    setTracks((previousTracks) => {
      const flags = getPlaybackFlags(playbackMode, { hasLeadSheet, hasAccompaniment });
      return previousTracks.map((track) => ({
        ...track,
        audioEnabled: track.kind === 'melody' ? flags.melodyEnabled : flags.accompanimentEnabled,
      }));
    });
  }, [hasAccompaniment, hasLeadSheet, playbackMode]);

  useEffect(() => {
    if (!selectedEntry) {
      return;
    }

    if (!hasAccompaniment && displayMode !== 'sheet') {
      setDisplayMode('sheet');
      return;
    }

    if (!selectedMatch && displayMode !== 'chords') {
      setDisplayMode('chords');
      return;
    }

    if (displayMode === 'split' && (!selectedMatch || !hasAccompaniment)) {
      setDisplayMode(hasAccompaniment ? 'chords' : 'sheet');
    }
  }, [displayMode, hasAccompaniment, selectedEntry, selectedMatch]);

  useEffect(() => {
    if (!selectedEntry) {
      return;
    }

    if (!hasAccompaniment && playbackMode !== 'melody') {
      setPlaybackMode('melody');
      return;
    }

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

  const defaultBeatsPerMeasure = useMemo(() => {
    if (leadSheet?.beatsPerMeasure) {
      return leadSheet.beatsPerMeasure;
    }
    return getBeatsFromTimeSignature(selectedSong?.timeSignature ?? '44', 4);
  }, [leadSheet?.beatsPerMeasure, selectedSong?.timeSignature]);

  useEffect(() => {
    if (!engineRef.current) {
      return;
    }

    const flags = getPlaybackFlags(playbackMode, { hasLeadSheet, hasAccompaniment });
    engineRef.current.configure({
      accompanimentMeasures: transposedMeasures,
      melodyMeasures: leadSheet?.melodyTrack,
      bpm: playbackBpm,
      defaultBeatsPerMeasure,
      accompanimentEnabled: flags.accompanimentEnabled,
      melodyEnabled: flags.melodyEnabled,
    });
  }, [
    defaultBeatsPerMeasure,
    hasAccompaniment,
    hasLeadSheet,
    leadSheet?.melodyTrack,
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

    baseFilteredEntries.forEach((entry) => {
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
      withSheet,
      withoutSheet: baseFilteredEntries.filter((entry) => entry.source === 'ireal' && !entry.sheet).length,
      standalone,
    };
  }, [baseFilteredEntries]);

  const filteredEntries = useMemo(() => {
    let list = baseFilteredEntries;

    if (matchFilter === 'with-sheet') {
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
    setDisplayMode(hasEntryAccompaniment ? 'chords' : 'sheet');
    setPlaybackMode(hasEntryAccompaniment ? (songHasMatch ? 'both' : 'ireal') : 'melody');
    setTracks(createDefaultTracks({ hasAccompaniment: hasEntryAccompaniment }));
    setPlaybackBpm(Math.round(entry.song?.bpm ?? 120));
    setHasManualTempoOverride(false);
    setIsPlaying(false);
    setPlaybackState(null);
    engineRef.current?.stop();
  }, []);

  const handleStop = useCallback(() => {
    engineRef.current?.stop();
    setIsPlaying(false);
    setPlaybackState(null);
  }, []);

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

    engineRef.current.start();
    setIsPlaying(true);
  }, [hasAccompaniment, hasLeadSheet, isPlaying, selectedEntry]);

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
      <div className="space-y-4 pb-52 md:pb-44">
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

          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {selectedSong ? 'Tonalite' : 'Source'}
            </div>
            {selectedSong ? (
              <select
                value={transpose}
                onChange={(event) => {
                  setTranspose(Number(event.target.value));
                  handleStop();
                }}
                className="mt-1 cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-black text-slate-800 outline-none"
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={`plus-${index}`} value={index}>
                    {index === 0 ? selectedSong.key : `+${index} (${CHROMATIC_NOTES[index]})`}
                  </option>
                ))}
                {Array.from({ length: 11 }, (_, index) => {
                  const value = -index - 1;
                  const note = CHROMATIC_NOTES[((value % 12) + 12) % 12];
                  return (
                    <option key={`minus-${index}`} value={value}>
                      {`${value} (${note})`}
                    </option>
                  );
                })}
              </select>
            ) : (
              <div className="mt-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-black text-slate-800">
                {selectedEntry.keyLabel}
              </div>
            )}
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mode d&apos;affichage</div>
            <div className="flex flex-wrap gap-1">
              {[
                { value: 'chords' as DisplayMode, label: 'Accords', disabled: !hasAccompaniment },
                { value: 'sheet' as DisplayMode, label: 'Partition VexFlow', disabled: !canUseSheetModes },
                { value: 'split' as DisplayMode, label: 'Les deux', disabled: !canUseSheetModes || !hasAccompaniment },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => setDisplayMode(option.value)}
                  className={cn(
                    'rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider transition-colors',
                    displayMode === option.value
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                    option.disabled && 'cursor-not-allowed bg-slate-100 text-slate-300 hover:bg-slate-100'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {!canUseSheetModes ? (
            <p className="mt-2 text-xs text-slate-500">
              Aucune partition Wikifonia n&apos;est associee a ce morceau dans ce premier jet.
            </p>
          ) : !hasAccompaniment ? (
            <p className="mt-2 text-xs text-slate-500">
              Cette entree provient uniquement de Wikifonia, avec lecture et affichage en mode melodie seule.
            </p>
          ) : null}
        </section>

        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] px-4">
          <div className="pointer-events-auto mx-auto max-w-6xl overflow-x-auto pb-2">
            <section className="min-w-[720px] w-full rounded-2xl border border-slate-700/70 bg-gradient-to-r from-slate-900 to-slate-800 p-4 shadow-2xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={togglePlayback}
                className={cn(
                  'h-12 w-12 rounded-xl border-none',
                  isPlaying
                    ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:bg-amber-600'
                    : 'bg-orange-500 hover:bg-orange-600'
                )}
              >
                {isPlaying ? <Pause className="fill-white" /> : <Play className="ml-1 fill-white" />}
              </Button>
              <Button
                variant="outline"
                onClick={handleStop}
                className="h-12 w-12 rounded-xl border-slate-600 bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-red-400"
              >
                <Square className="h-4 w-4 fill-current" />
              </Button>
            </div>

            <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(220px,260px)_1fr]">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tempo</span>
                  <span className="font-mono text-sm font-bold text-orange-400">{playbackBpm} BPM</span>
                </div>
                <Slider
                  value={[playbackBpm]}
                  min={40}
                  max={280}
                  onValueChange={(values) => {
                    setHasManualTempoOverride(true);
                    setPlaybackBpm(values[0]);
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lecture</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {playbackMode === 'ireal' ? 'iReal seul' : playbackMode === 'melody' ? 'Melodie seule' : 'Les deux'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'ireal' as PlaybackMode, label: 'iReal seul', disabled: !hasAccompaniment },
                    { value: 'melody' as PlaybackMode, label: 'Melodie seule', disabled: !melodyPlayable },
                    { value: 'both' as PlaybackMode, label: 'Les deux', disabled: !melodyPlayable || !hasAccompaniment },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => setPlaybackMode(option.value)}
                      className={cn(
                        'rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider transition-colors',
                        playbackMode === option.value
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                          : 'bg-slate-700 text-slate-200 hover:bg-slate-600',
                        option.disabled && 'cursor-not-allowed bg-slate-800 text-slate-500 hover:bg-slate-800'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
            </section>
          </div>
        </div>

        {canUseSheetModes ? (
          <TrackControls
            tracks={hasAccompaniment ? tracks : tracks.filter((track) => track.kind === 'melody')}
            hasLeadSheet={hasLeadSheet}
            onToggleVisible={(trackId, visible) => updateTrack(trackId, { visible })}
            onToggleFingerings={(trackId, fingeringEnabled) => updateTrack(trackId, { fingeringEnabled })}
          />
        ) : null}

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
                Pistons
              </span>
            </div>

            <VexFlowFullScore
              measures={transposedMeasures}
              beatsPerMeasure={defaultBeatsPerMeasure}
              playbackState={playbackState}
              isPlaying={isPlaying}
            />

            <ChordGrid measures={transposedMeasures} activeMeasure={activeMeasure} />
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
          ) : leadSheet ? (
            <WikifoniaVexScore
              leadSheet={leadSheet}
              accompanimentMeasures={transposedMeasures}
              defaultBeatsPerMeasure={defaultBeatsPerMeasure}
              tracks={tracks}
              playbackState={playbackState}
              isPlaying={isPlaying}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 shadow-sm">
              Partition indisponible pour le moment.
            </div>
          )
        ) : null}
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
                    ? option.value === 'with-sheet'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                      : option.value === 'without-sheet'
                        ? 'bg-slate-700 text-white shadow-lg shadow-slate-200'
                        : option.value === 'standalone'
                          ? 'bg-sky-500 text-white shadow-lg shadow-sky-200'
                          : 'bg-orange-500 text-white shadow-lg shadow-orange-200'
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
        {filteredEntries.slice(0, activeLetter ? undefined : 150).map((entry, index) => (
          <div key={entry.id}>
            <button
              onClick={() => handleSelectEntry(entry)}
              className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-left transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-bold text-slate-800">{entry.title}</div>
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
                  <div className="mt-0.5 flex flex-wrap gap-2 text-[10px] text-slate-400">
                    <span>{entry.composer}</span>
                    <span>{entry.style}</span>
                  </div>
                </div>

                <div className="flex h-6 items-center rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-500">
                  {entry.keyLabel}
                </div>
              </div>
            </button>
          </div>
        ))}

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


