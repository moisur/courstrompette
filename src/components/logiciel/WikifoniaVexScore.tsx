"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Vex from 'vexflow';

import type { ParsedLeadSheet, ParsedLeadSheetMeasure, ParsedMelodyEvent } from './musicXmlLeadSheet';
import type { PlaybackPosition, ScoreTrack } from './irealWikifonia';
import { buildChordBeatSegments, getChordInfo, getFingeringText } from './irealMusicUtils';

const VF = Vex.Flow;

type RenderedNoteMeta = {
  id: string;
  track: 'melody' | 'accompaniment';
  measureIndex: number;
  startBeat: number;
  endBeat: number;
};

type SystemSlice = {
  start: number;
  end: number;
};

function buildSystems(totalMeasures: number, starts: number[]): SystemSlice[] {
  const uniqueStarts = Array.from(new Set([0, ...starts.filter((start) => start >= 0 && start < totalMeasures)])).sort((a, b) => a - b);
  const normalizedStarts = [...uniqueStarts];

  if (normalizedStarts.length === 0) {
    normalizedStarts.push(0);
  }

  let cursor = normalizedStarts[normalizedStarts.length - 1] ?? 0;
  while (cursor < totalMeasures - 1) {
    cursor += 4;
    normalizedStarts.push(cursor);
  }

  const systems: SystemSlice[] = [];

  for (let index = 0; index < normalizedStarts.length; index += 1) {
    const start = normalizedStarts[index];
    const nextStart = normalizedStarts[index + 1] ?? totalMeasures;
    if (start < totalMeasures) {
      systems.push({ start, end: Math.min(nextStart, totalMeasures) });
    }
  }

  return systems;
}

function getAverageMeasureWidth(leadSheet: ParsedLeadSheet): number {
  const widths = leadSheet.measures.map((measure) => measure.width).filter((width): width is number => typeof width === 'number' && width > 0);
  if (widths.length === 0) {
    return 1;
  }

  return widths.reduce((sum, width) => sum + width, 0) / widths.length;
}

function getMeasureWeights(leadSheet: ParsedLeadSheet, system: SystemSlice): number[] {
  const averageWidth = getAverageMeasureWidth(leadSheet);
  return Array.from({ length: system.end - system.start }, (_, offset) => {
    const width = leadSheet.measures[system.start + offset]?.width;
    return typeof width === 'number' && width > 0 ? width : averageWidth;
  });
}

function beatTypeToVexDuration(beatType: number): string {
  switch (beatType) {
    case 1:
      return 'w';
    case 2:
      return 'h';
    case 8:
      return '8';
    case 16:
      return '16';
    case 32:
      return '32';
    default:
      return 'q';
  }
}

function buildMelodyTuplets(notes: Vex.Flow.StaveNote[], events: ParsedMelodyEvent[]): Vex.Flow.Tuplet[] {
  const tuplets: Vex.Flow.Tuplet[] = [];
  let currentStart = -1;
  let currentActual = 0;
  let currentNormal = 0;

  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    if (event.tupletStart) {
      currentStart = index;
      currentActual = event.tupletActualNotes ?? 3;
      currentNormal = event.tupletNormalNotes ?? 2;
    }

    if (event.tupletStop && currentStart >= 0) {
      const tupletNotes = notes
        .slice(currentStart, index + 1)
        .filter((note) => !note.getDuration().includes('r'));
      if (tupletNotes.length > 1) {
        try {
          tuplets.push(
            new VF.Tuplet(tupletNotes, {
              num_notes: currentActual || tupletNotes.length,
              notes_occupied: currentNormal || 2,
              bracketed: false,
              ratioed: false,
            })
          );
        } catch (error) {
          console.warn('Skipped unsupported tuplet in Wikifonia measure.', error);
        }
      }
      currentStart = -1;
      currentActual = 0;
      currentNormal = 0;
    }
  }

  return tuplets;
}

function attachDots(note: Vex.Flow.StaveNote, count: number) {
  const dotApi = VF.Dot as unknown as {
    buildAndAttach?: (notes: Vex.Flow.StaveNote[], options?: { all?: boolean; index?: number }) => void;
  };

  for (let index = 0; index < count; index += 1) {
    dotApi.buildAndAttach?.([note], { all: true });
  }
}

function createFallbackMelodyNotes(
  beats: number,
  beatType: number,
  measureIndex: number,
  noteIndexStart: number,
): { notes: Vex.Flow.StaveNote[]; renderedNotes: RenderedNoteMeta[] } {
  const duration = `${beatTypeToVexDuration(beatType)}r`;
  const notes: Vex.Flow.StaveNote[] = [];
  const renderedNotes: RenderedNoteMeta[] = [];

  for (let beat = 0; beat < beats; beat += 1) {
    const note = new VF.StaveNote({
      clef: 'treble',
      keys: ['b/4'],
      duration,
    });

    const noteId = `score-note-${noteIndexStart + renderedNotes.length}`;
    renderedNotes.push({
      id: noteId,
      track: 'melody',
      measureIndex,
      startBeat: beat,
      endBeat: beat + 1,
    });
    (note as unknown as { __renderId: string }).__renderId = noteId;
    notes.push(note);
  }

  return { notes, renderedNotes };
}

function createMelodyVoiceData(
  measure: ParsedLeadSheetMeasure | undefined,
  measureIndex: number,
  showFingerings: boolean,
  noteIndexStart: number,
  tieRegistry: Map<string, Vex.Flow.StaveNote>,
) {
  const events = measure?.melody ?? [];
  const notes: Vex.Flow.StaveNote[] = [];
  const renderedNotes: RenderedNoteMeta[] = [];
  const ties: Vex.Flow.StaveTie[] = [];

  for (const event of events) {
    const duration = `${event.vexDuration}${event.kind === 'rest' ? 'r' : ''}`;
    const keys = event.kind === 'rest' ? ['b/4'] : [event.vexKey ?? 'c/4'];
    const note = new VF.StaveNote({
      clef: 'treble',
      keys,
      duration,
      auto_stem: true,
    });

    if (event.kind === 'note' && event.accidental) {
      note.addModifier(new VF.Accidental(event.accidental), 0);
    }

    if (event.dots > 0) {
      attachDots(note, event.dots);
    }

    if (showFingerings && event.kind === 'note' && event.fingering) {
      note.addModifier(
        new VF.Annotation(getFingeringText(event.fingering))
          .setFont('Arial', 9, 'bold')
          .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM),
        0
      );
    }

    const noteId = `score-note-${noteIndexStart + renderedNotes.length}`;
    renderedNotes.push({
      id: noteId,
      track: 'melody',
      measureIndex,
      startBeat: event.beat,
      endBeat: event.beat + Math.max(event.durationBeats, 0.01),
    });
    (note as unknown as { __renderId: string }).__renderId = noteId;
    notes.push(note);

    if (event.kind !== 'note' || !event.displayKey) {
      continue;
    }

    const tieKey = `${event.displayKey}:${event.voice}`;
    if (event.tieStop && tieRegistry.has(tieKey)) {
      ties.push(
        new VF.StaveTie({
          first_note: tieRegistry.get(tieKey)!,
          last_note: note,
          first_indices: [0],
          last_indices: [0],
        })
      );
    }

    if (event.tieStart) {
      tieRegistry.set(tieKey, note);
    } else if (!event.tieStop) {
      tieRegistry.delete(tieKey);
    } else if (!event.tieStart) {
      tieRegistry.delete(tieKey);
    }
  }

  return {
    notes,
    tuplets: buildMelodyTuplets(notes, events),
    renderedNotes,
    ties,
  };
}

function createAccompanimentVoiceData(
  measures: string[][],
  measureIndex: number,
  beatsPerMeasure: number,
  beatType: number,
  showFingerings: boolean,
  renderedNotes: RenderedNoteMeta[],
) {
  const measure = measures[measureIndex] ?? [];
  const segments = buildChordBeatSegments(measure, beatsPerMeasure);
  const notes: Vex.Flow.StaveNote[] = [];
  const baseDuration = beatTypeToVexDuration(beatType);

  for (const segment of segments) {
    const chordInfo = getChordInfo(segment.chord);
    if (!chordInfo) {
      continue;
    }

    for (let beatIndex = 0; beatIndex < segment.duration; beatIndex += 1) {
      const noteIndex = beatIndex % chordInfo.trumpetNotes.length;
      const transposedNote = chordInfo.trumpetNotes[noteIndex];
      const noteName = transposedNote.replace(/[0-9]/g, '');
      const octave = transposedNote.match(/[0-9]/)?.[0] ?? '4';
      const vexKey = `${noteName[0].toLowerCase()}${noteName.length > 1 ? noteName.slice(1) : ''}/${octave}`;
      const note = new VF.StaveNote({
        clef: 'treble',
        keys: [vexKey],
        duration: baseDuration,
      });

      const accidentalMatch = transposedNote.match(/^[A-G]([b#])/i);
      if (accidentalMatch) {
        note.addModifier(new VF.Accidental(accidentalMatch[1]), 0);
      }

      if (showFingerings && chordInfo.fingerings[noteIndex]) {
        note.addModifier(
          new VF.Annotation(getFingeringText(chordInfo.fingerings[noteIndex]))
            .setFont('Arial', 8, 'bold')
            .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM),
          0
        );
      }

      if (beatIndex === 0) {
        note.addModifier(
          new VF.Annotation(chordInfo.chordStr)
            .setFont('Arial', 12, 'bold')
            .setVerticalJustification(VF.Annotation.VerticalJustify.TOP),
          0
        );
      }

      const noteId = `score-note-${renderedNotes.length}`;
      renderedNotes.push({
        id: noteId,
        track: 'accompaniment',
        measureIndex,
        startBeat: segment.startBeat + beatIndex,
        endBeat: segment.startBeat + beatIndex + 1,
      });
      (note as unknown as { __renderId: string }).__renderId = noteId;
      notes.push(note);
    }
  }

  while (notes.length < beatsPerMeasure) {
    const rest = new VF.StaveNote({ clef: 'treble', keys: ['b/4'], duration: `${baseDuration}r` });
    const noteId = `score-note-${renderedNotes.length}`;
    renderedNotes.push({
      id: noteId,
      track: 'accompaniment',
      measureIndex,
      startBeat: notes.length,
      endBeat: notes.length + 1,
    });
    (rest as unknown as { __renderId: string }).__renderId = noteId;
    notes.push(rest);
  }

  return notes;
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

interface WikifoniaVexScoreProps {
  leadSheet: ParsedLeadSheet;
  accompanimentMeasures: string[][];
  defaultBeatsPerMeasure?: number;
  tracks: ScoreTrack[];
  playbackState: PlaybackPosition | null;
  isPlaying: boolean;
  onSelectMeasure?: (measureIndex: number, startBeat?: number) => void;
  loopEnabled?: boolean;
  loopStart?: number;
  loopEnd?: number;
}

export default function WikifoniaVexScore({
  leadSheet,
  accompanimentMeasures,
  defaultBeatsPerMeasure = 4,
  tracks,
  playbackState,
  isPlaying,
  onSelectMeasure,
  loopEnabled = false,
  loopStart = 0,
  loopEnd = 0,
}: WikifoniaVexScoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousHighlightIdsRef = useRef<string[]>([]);

  const melodyTrack = useMemo(
    () => tracks.find((track) => track.kind === 'melody') ?? null,
    [tracks]
  );
  const accompanimentTrack = useMemo(
    () => tracks.find((track) => track.kind === 'accompaniment') ?? null,
    [tracks]
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const container = containerRef.current;
    container.innerHTML = '';

    const totalMeasures = Math.max(leadSheet.measures.length, accompanimentMeasures.length);
    if (totalMeasures === 0) {
      return;
    }

    const systems = buildSystems(totalMeasures, leadSheet.systems);
    const visibleTracks = tracks.filter((track) => track.visible);
    const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
    const width = Math.max(980, container.parentElement?.clientWidth ?? 980);
    const systemHeight = visibleTracks.length > 1 ? 260 : 150;
    const headerHeight = 28;
    const outerPadding = 12;
    const totalHeight = headerHeight + outerPadding + systems.length * systemHeight;

    renderer.resize(width, totalHeight);

    const context = renderer.getContext();
    context.setFont('Arial', 10, 400).setBackgroundFillStyle('#FFFFFF');

    const renderedNotes: RenderedNoteMeta[] = [];
    const melodyTies: Vex.Flow.StaveTie[] = [];
    const melodyTieRegistry = new Map<string, Vex.Flow.StaveNote>();

    systems.forEach((system, systemIndex) => {
      const systemTop = headerHeight + outerPadding + systemIndex * systemHeight;
      const topTrackY = systemTop + 18;
      const bottomTrackY = visibleTracks.length > 1 ? topTrackY + 110 : topTrackY;
      const availableWidth = width - outerPadding * 2 - 16;
      const weights = getMeasureWeights(leadSheet, system);
      const totalWeight = weights.reduce((sum, measureWidth) => sum + measureWidth, 0) || 1;

      if (melodyTrack?.visible) {
        context.fillText(melodyTrack.label, outerPadding, topTrackY - 6);
      }
      if (accompanimentTrack?.visible) {
        context.fillText(accompanimentTrack.label, outerPadding, bottomTrackY - 6);
      }

      let currentX = outerPadding + 8;
      let firstMelodyStave: Vex.Flow.Stave | null = null;
      let firstAccompanimentStave: Vex.Flow.Stave | null = null;
      let lastMelodyStave: Vex.Flow.Stave | null = null;
      let lastAccompanimentStave: Vex.Flow.Stave | null = null;

      for (let measureIndex = system.start; measureIndex < system.end; measureIndex += 1) {
        const widthWeight = weights[measureIndex - system.start] ?? 1;
        const measureWidth = Math.max(90, (availableWidth * widthWeight) / totalWeight);
        const leadMeasure = leadSheet.measures[measureIndex];
        const beats = leadMeasure?.beats ?? defaultBeatsPerMeasure ?? leadSheet.beatsPerMeasure;
        const beatType = leadMeasure?.beatType ?? leadSheet.beatType;

        if (loopEnabled && measureIndex >= loopStart && measureIndex <= loopEnd) {
          try {
            const svgGroup = (context as unknown as { openGroup: (cls?: string) => SVGElement; closeGroup: () => void }).openGroup?.('vf-loop-highlight');
            const rectY = topTrackY - 12;
            const rectHeight = visibleTracks.length > 1 ? bottomTrackY - topTrackY + 80 : 85;
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', String(currentX));
            rect.setAttribute('y', String(rectY));
            rect.setAttribute('width', String(measureWidth));
            rect.setAttribute('height', String(rectHeight));
            rect.setAttribute('fill', 'rgba(245, 158, 11, 0.12)');
            rect.setAttribute('stroke', 'rgba(245, 158, 11, 0.4)');
            rect.setAttribute('stroke-width', '1.5');
            rect.setAttribute('rx', '4');

            if (svgGroup) {
              svgGroup.appendChild(rect);

              if (measureIndex === loopStart || measureIndex === loopEnd) {
                const isStart = measureIndex === loopStart;
                const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                const badgeX = isStart ? currentX + 6 : currentX + measureWidth - 14;
                badgeText.setAttribute('x', String(badgeX));
                badgeText.setAttribute('y', String(rectY + 12));
                badgeText.setAttribute('fill', '#d97706');
                badgeText.setAttribute('font-size', '11px');
                badgeText.setAttribute('font-weight', '900');
                badgeText.setAttribute('font-family', 'sans-serif');
                badgeText.textContent = isStart ? 'A' : 'B';
                svgGroup.appendChild(badgeText);
              }
              (context as unknown as { closeGroup: () => void }).closeGroup?.();
            }
          } catch {
            // ignore if SVG group creation fails
          }
        }

        if (melodyTrack?.visible) {
          const melodyStave = new VF.Stave(currentX, topTrackY, measureWidth);
          if (measureIndex === 0 || systemIndex === 0) {
            if (measureIndex === 0) {
              melodyStave.addClef('treble').addTimeSignature(`${beats}/${beatType}`);
            } else {
              melodyStave.addClef('treble');
            }
          }
          melodyStave.setContext(context).draw();

          const tieRegistrySnapshot = new Map(melodyTieRegistry);
          const melodyVoiceData = createMelodyVoiceData(
            leadMeasure,
            measureIndex,
            Boolean(melodyTrack.fingeringEnabled),
            renderedNotes.length,
            melodyTieRegistry,
          );

          try {
            if (melodyVoiceData.notes.length > 0) {
              const melodyVoice = new VF.Voice({ num_beats: beats, beat_value: beatType }).setStrict(false);
              melodyVoice.addTickables(melodyVoiceData.notes);
              new VF.Formatter().joinVoices([melodyVoice]).formatToStave([melodyVoice], melodyStave);

              const beamableNotes = melodyVoiceData.notes.filter(
                (note) => /^(8|16|32|64)/.test(note.getDuration()) && !note.getDuration().includes('r')
              );
              let beams: Vex.Flow.Beam[] = [];
              if (beamableNotes.length >= 2) {
                try {
                  beams = VF.Beam.generateBeams(beamableNotes);
                } catch (error) {
                  console.warn(`Skipped unsupported beams in Wikifonia measure ${measureIndex + 1}.`, error);
                }
              }

              melodyVoice.draw(context, melodyStave);
              renderedNotes.push(...melodyVoiceData.renderedNotes);
              melodyTies.push(...melodyVoiceData.ties);

              beams.forEach((beam) => {
                try {
                  beam.setContext(context).draw();
                } catch (error) {
                  console.warn(`Skipped beam draw in Wikifonia measure ${measureIndex + 1}.`, error);
                }
              });

              melodyVoiceData.tuplets.forEach((tuplet) => {
                try {
                  tuplet.setContext(context).draw();
                } catch (error) {
                  console.warn(`Skipped unsupported tuplet draw in Wikifonia measure ${measureIndex + 1}.`, error);
                }
              });
            }
          } catch (error) {
            console.warn(`Fell back to rests for Wikifonia melody measure ${measureIndex + 1}.`, error);
            melodyTieRegistry.clear();
            tieRegistrySnapshot.forEach((value, key) => melodyTieRegistry.set(key, value));
            const fallbackMelody = createFallbackMelodyNotes(
              beats,
              beatType,
              measureIndex,
              renderedNotes.length,
            );
            const fallbackVoice = new VF.Voice({ num_beats: beats, beat_value: beatType }).setStrict(false);
            fallbackVoice.addTickables(fallbackMelody.notes);
            new VF.Formatter().joinVoices([fallbackVoice]).formatToStave([fallbackVoice], melodyStave);
            fallbackVoice.draw(context, melodyStave);
            renderedNotes.push(...fallbackMelody.renderedNotes);
          }

          if (!firstMelodyStave) {
            firstMelodyStave = melodyStave;
          }
          lastMelodyStave = melodyStave;
        }

        if (accompanimentTrack?.visible) {
          const accompanimentY = melodyTrack?.visible ? bottomTrackY : topTrackY;
          const accompanimentStave = new VF.Stave(currentX, accompanimentY, measureWidth);
          if (!melodyTrack?.visible && (measureIndex === 0 || systemIndex === 0)) {
            if (measureIndex === 0) {
              accompanimentStave.addClef('treble').addTimeSignature(`${beats}/${beatType}`);
            } else {
              accompanimentStave.addClef('treble');
            }
          }
          accompanimentStave.setContext(context).draw();

          const accompanimentNotes = createAccompanimentVoiceData(
            accompanimentMeasures,
            measureIndex,
            beats,
            beatType,
            Boolean(accompanimentTrack.fingeringEnabled),
            renderedNotes,
          );
          const accompanimentVoice = new VF.Voice({ num_beats: beats, beat_value: beatType }).setStrict(false);
          accompanimentVoice.addTickables(accompanimentNotes);
          new VF.Formatter().joinVoices([accompanimentVoice]).formatToStave([accompanimentVoice], accompanimentStave);
          accompanimentVoice.draw(context, accompanimentStave);

          if (!firstAccompanimentStave) {
            firstAccompanimentStave = accompanimentStave;
          }
          lastAccompanimentStave = accompanimentStave;
        }

        currentX += measureWidth;
      }

      if (firstMelodyStave && firstAccompanimentStave) {
        new VF.StaveConnector(firstMelodyStave, firstAccompanimentStave)
          .setType(VF.StaveConnector.type.SINGLE_LEFT)
          .setContext(context)
          .draw();
      }

      if (lastMelodyStave && lastAccompanimentStave) {
        new VF.StaveConnector(lastMelodyStave, lastAccompanimentStave)
          .setType(VF.StaveConnector.type.SINGLE_RIGHT)
          .setContext(context)
          .draw();
      }
    });

    melodyTies.forEach((tie) => {
      try {
        tie.setContext(context).draw();
      } catch (error) {
        console.warn('Skipped unsupported tie in Wikifonia score.', error);
      }
    });

    const svg = container.querySelector('svg');
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${width} ${totalHeight}`);
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
      node.setAttribute('data-score-track', meta.track);
      node.setAttribute('data-measure-index', String(meta.measureIndex));
      node.setAttribute('data-start-beat', String(meta.startBeat));
      node.setAttribute('data-end-beat', String(meta.endBeat));
      node.querySelectorAll('*').forEach((child) => {
        child.setAttribute('style', 'transition: fill 0.12s ease-out, stroke 0.12s ease-out;');
      });
    });
  }, [
    accompanimentMeasures,
    accompanimentTrack?.fingeringEnabled,
    accompanimentTrack?.label,
    accompanimentTrack?.visible,
    defaultBeatsPerMeasure,
    leadSheet,
    loopEnabled,
    loopEnd,
    loopStart,
    melodyTrack?.fingeringEnabled,
    melodyTrack?.label,
    melodyTrack?.visible,
    tracks,
  ]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    for (const noteId of previousHighlightIdsRef.current) {
      recolorRenderedNote(containerRef.current.querySelector(`#${noteId}`), '#000000');
    }
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

    for (const node of activeNodes) {
      recolorRenderedNote(node, '#F97316');
    }

    previousHighlightIdsRef.current = activeNodes.map((node) => node.id);
    if (playbackState.beat === 0) {
      activeNodes[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isPlaying, playbackState]);

  const handleScoreClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onSelectMeasure) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const staveNote = target?.closest('.vf-stavenote') as HTMLElement | null;

    if (staveNote && staveNote.dataset.measureIndex !== undefined) {
      const measureIndex = Number(staveNote.dataset.measureIndex);
      const startBeat = Number(staveNote.dataset.startBeat ?? 0);
      onSelectMeasure(measureIndex, startBeat);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const allNotes = Array.from(containerRef.current.querySelectorAll<HTMLElement>('.vf-stavenote'));
    let minDistance = Infinity;
    let closestMeasure = -1;
    let closestBeat = 0;

    for (const noteNode of allNotes) {
      const bbox = noteNode.getBoundingClientRect();
      const noteX = bbox.left + bbox.width / 2 - rect.left;
      const noteY = bbox.top + bbox.height / 2 - rect.top;

      const dist = Math.hypot(clickX - noteX, clickY - noteY);
      if (dist < minDistance) {
        minDistance = dist;
        closestMeasure = Number(noteNode.dataset.measureIndex ?? 0);
        closestBeat = Number(noteNode.dataset.startBeat ?? 0);
      }
    }

    if (closestMeasure >= 0 && minDistance < 180) {
      onSelectMeasure(closestMeasure, closestBeat);
    }
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const toggleFullscreen = () => {
    if (!sectionRef.current) return;
    if (!document.fullscreenElement) {
      sectionRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all",
        isFullscreen && "fixed inset-0 z-[100] rounded-none border-none p-4 overflow-y-auto max-h-screen bg-white"
      )}
    >
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Partition VexFlow (Cliquer sur une mesure pour s'y rendre)
            </p>
            <h3 className="text-sm font-bold text-slate-800">
              {leadSheet.title || 'Partition alignee'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {loopEnabled ? (
              <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 animate-pulse">
                🔁 Boucle active: Mesures {loopStart + 1} à {loopEnd + 1}
              </span>
            ) : null}
            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Melodie Sib + accompagnement
            </span>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 hover:border-orange-300 transition-colors shadow-xs"
              title={isFullscreen ? "Quitter le plein écran" : "Afficher la partition en plein écran"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5 text-orange-600" />
                  <span>Quitter Plein Écran</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5 text-orange-600" />
                  <span>Plein Écran</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto px-4 py-4">
        <div
          ref={containerRef}
          onClick={handleScoreClick}
          className="min-w-[980px] cursor-pointer hover:opacity-[0.99] transition-opacity"
          title="Cliquer pour démarrer la lecture depuis cette mesure"
        />
      </div>
    </section>
  );
}
