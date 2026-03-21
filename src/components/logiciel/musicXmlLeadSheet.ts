import { XMLParser } from 'fast-xml-parser';

import { PISTONS, transposeConcertPitchToBb } from './irealMusicUtils';

export interface ParsedMelodyEvent {
  kind: 'note' | 'rest';
  beat: number;
  durationBeats: number;
  voice: string;
  lyric?: string;
  vexDuration: string;
  dots: number;
  tieStart: boolean;
  tieStop: boolean;
  tupletActualNotes?: number;
  tupletNormalNotes?: number;
  tupletStart?: boolean;
  tupletStop?: boolean;
  concertMidi?: number;
  concertFrequency?: number;
  displayKey?: string;
  vexKey?: string;
  accidental?: string | null;
  fingering?: string;
}

export interface ParsedLeadSheetMeasure {
  index: number;
  number: string;
  width: number | null;
  systemIndex: number;
  beats: number;
  beatType: number;
  divisions: number;
  harmonyHints: string[];
  melody: ParsedMelodyEvent[];
}

export interface ParsedLeadSheet {
  measures: ParsedLeadSheetMeasure[];
  systems: number[];
  melodyTrack: ParsedLeadSheetMeasure[];
  harmonyHints?: string[][];
  sourceTempo?: number | null;
  title?: string;
  beatsPerMeasure: number;
  beatType: number;
}

const COMPRESSED_SCORE_RE = /\.mxl(?:\.\d+)?$/i;

function normalizeServedAssetPath(path: string): string {
  return path
    .replace(/%21/gi, '!')
    .replace(/%26/gi, '&')
    .replace(/%27/gi, "'")
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')
    .replace(/%2C/gi, ',');
}

function getFallbackServedPath(path: string): string | null {
  if (!COMPRESSED_SCORE_RE.test(path)) {
    return null;
  }

  if (!path.startsWith('/Wikifonia.windows-safe/')) {
    return null;
  }

  return path
    .replace('/Wikifonia.windows-safe/', '/Wikifonia.rendered/')
    .replace(/\.mxl(?:\.\d+)?$/i, '.musicxml');
}

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined || value === null) {
    return [];
  }
  return [value];
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function getText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value && typeof value === 'object') {
    const maybeText = (value as Record<string, unknown>)['#text'];
    if (typeof maybeText === 'string') {
      return maybeText.trim();
    }
  }
  return '';
}

function typeToVexDuration(type: string | undefined): string {
  switch ((type ?? '').toLowerCase()) {
    case 'breve':
      return 'w';
    case 'whole':
      return 'w';
    case 'half':
      return 'h';
    case 'quarter':
      return 'q';
    case 'eighth':
      return '8';
    case '16th':
      return '16';
    case '32nd':
      return '32';
    case '64th':
      return '64';
    default:
      return 'q';
  }
}

function isChordTone(note: Record<string, unknown>): boolean {
  return note.chord !== undefined;
}

function isGraceNote(note: Record<string, unknown>): boolean {
  return note.grace !== undefined;
}

function getDots(note: Record<string, unknown>): number {
  return toArray(note.dot).length;
}

function getTieFlags(note: Record<string, unknown>): { tieStart: boolean; tieStop: boolean } {
  const tieNodes = toArray(note.tie);
  const notationTies = toArray((note.notations as Record<string, unknown> | undefined)?.tied);
  const allNodes = [...tieNodes, ...notationTies];

  let tieStart = false;
  let tieStop = false;

  for (const node of allNodes) {
    if (!node || typeof node !== 'object') {
      continue;
    }

    const type = (node as Record<string, unknown>).type;
    if (type === 'start') {
      tieStart = true;
    } else if (type === 'stop') {
      tieStop = true;
    }
  }

  return { tieStart, tieStop };
}

function getTupletInfo(note: Record<string, unknown>): {
  tupletActualNotes?: number;
  tupletNormalNotes?: number;
  tupletStart?: boolean;
  tupletStop?: boolean;
} {
  const timeModification = note['time-modification'] as Record<string, unknown> | undefined;
  const tuplets = toArray((note.notations as Record<string, unknown> | undefined)?.tuplet);
  const tupletActualNotes = timeModification ? asNumber(timeModification['actual-notes'], 0) : 0;
  const tupletNormalNotes = timeModification ? asNumber(timeModification['normal-notes'], 0) : 0;

  return {
    tupletActualNotes: tupletActualNotes || undefined,
    tupletNormalNotes: tupletNormalNotes || undefined,
    tupletStart: tuplets.some((tuplet) => tuplet && typeof tuplet === 'object' && (tuplet as Record<string, unknown>).type === 'start') || undefined,
    tupletStop: tuplets.some((tuplet) => tuplet && typeof tuplet === 'object' && (tuplet as Record<string, unknown>).type === 'stop') || undefined,
  };
}

function getLyric(note: Record<string, unknown>): string | undefined {
  const lyric = toArray(note.lyric)[0];
  if (!lyric || typeof lyric !== 'object') {
    return undefined;
  }

  const text = getText((lyric as Record<string, unknown>).text);
  return text || undefined;
}

function parseHarmonyNode(harmony: Record<string, unknown>): string {
  const root = harmony.root as Record<string, unknown> | undefined;
  const kind = harmony.kind as Record<string, unknown> | string | undefined;
  const step = getText(root?.['root-step']);
  const alter = asNumber(root?.['root-alter'], 0);
  const kindText = typeof kind === 'object' ? getText(kind.text) || getText(kind['#text']) : getText(kind);
  const accidental = alter === 1 ? '#' : alter === -1 ? 'b' : '';
  return `${step}${accidental}${kindText ? ` ${kindText}` : ''}`.trim();
}

function getMeasureTempo(measure: Record<string, unknown>): number | null {
  for (const direction of toArray(measure.direction)) {
    if (!direction || typeof direction !== 'object') {
      continue;
    }

    const directionObject = direction as Record<string, unknown>;
    const sound = directionObject.sound;

    if (sound && typeof sound === 'object') {
      const tempo = asNumber((sound as Record<string, unknown>).tempo, Number.NaN);
      if (Number.isFinite(tempo)) {
        return tempo;
      }
    }
  }

  return null;
}

function extractMeasures(part: Record<string, unknown>): Record<string, unknown>[] {
  return toArray(part.measure).filter((measure): measure is Record<string, unknown> => Boolean(measure) && typeof measure === 'object');
}

function pickPrimaryVoice(measures: Record<string, unknown>[]): string {
  const voiceCounts = new Map<string, number>();

  for (const measure of measures) {
    for (const note of toArray(measure.note)) {
      if (!note || typeof note !== 'object') {
        continue;
      }

      const noteObject = note as Record<string, unknown>;
      if (!noteObject.pitch) {
        continue;
      }

      const voice = getText(noteObject.voice) || '1';
      voiceCounts.set(voice, (voiceCounts.get(voice) ?? 0) + 1);
    }
  }

  return [...voiceCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '1';
}

export async function loadMusicXmlText(path: string): Promise<string> {
  const requestedPath = normalizeServedAssetPath(path);
  let response = await fetch(requestedPath, { cache: 'no-store' });

  if (!response.ok && response.status === 404) {
    const fallbackPath = getFallbackServedPath(requestedPath);
    if (fallbackPath) {
      const fallbackResponse = await fetch(fallbackPath, { cache: 'no-store' });
      if (fallbackResponse.ok) {
        response = fallbackResponse;
      }
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

export function parseMusicXmlLeadSheet(xmlContent: string): ParsedLeadSheet {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: true,
    trimValues: true,
  });
  const document = parser.parse(xmlContent) as Record<string, unknown>;
  const score = document['score-partwise'] as Record<string, unknown> | undefined;

  if (!score) {
    throw new Error('Invalid MusicXML document.');
  }

  const parts = toArray(score.part).filter((part): part is Record<string, unknown> => Boolean(part) && typeof part === 'object');
  if (parts.length === 0) {
    throw new Error('No part found in MusicXML.');
  }

  const firstPart = parts[0];
  const measures = extractMeasures(firstPart);
  const primaryVoice = pickPrimaryVoice(measures);
  const title = getText(score['movement-title']);

  let currentDivisions = 1;
  let currentBeats = 4;
  let currentBeatType = 4;
  let sourceTempo: number | null = null;
  let currentSystemIndex = -1;
  let fallbackSystemCounter = 0;
  const systems: number[] = [];
  const parsedMeasures: ParsedLeadSheetMeasure[] = [];

  for (const [index, measure] of measures.entries()) {
    const measureAttributes = measure.attributes as Record<string, unknown> | undefined;
    if (measureAttributes) {
      currentDivisions = asNumber(measureAttributes.divisions, currentDivisions);

      const time = measureAttributes.time as Record<string, unknown> | undefined;
      if (time) {
        currentBeats = asNumber(time.beats, currentBeats);
        currentBeatType = asNumber(time['beat-type'], currentBeatType);
      }
    }

    const print = measure.print as Record<string, unknown> | undefined;
    const isSystemStart =
      index === 0 ||
      Boolean(print?.['system-layout']) ||
      print?.['new-system'] === 'yes' ||
      (index > 0 && fallbackSystemCounter >= 4);

    if (isSystemStart) {
      currentSystemIndex += 1;
      systems.push(index);
      fallbackSystemCounter = 0;
    }
    fallbackSystemCounter += 1;

    if (sourceTempo === null) {
      sourceTempo = getMeasureTempo(measure);
    }

    const width = typeof measure.width === 'number' ? measure.width : asNumber(measure.width, Number.NaN);
    const harmonyHints = toArray(measure.harmony)
      .filter((harmony): harmony is Record<string, unknown> => Boolean(harmony) && typeof harmony === 'object')
      .map(parseHarmonyNode)
      .filter(Boolean);

    const melody: ParsedMelodyEvent[] = [];
    let beatCursor = 0;

    for (const note of toArray(measure.note)) {
      if (!note || typeof note !== 'object') {
        continue;
      }

      const noteObject = note as Record<string, unknown>;
      const voice = getText(noteObject.voice) || '1';
      const durationDivisions = asNumber(noteObject.duration, 0);
      const durationBeats = currentDivisions > 0 ? durationDivisions / currentDivisions : 0;

      if (voice !== primaryVoice) {
        continue;
      }

      // v1 keeps a single monophonic melody line. Extra chord tones and grace notes
      // are ignored so the beat cursor stays aligned with the lead voice.
      if (isChordTone(noteObject) || isGraceNote(noteObject)) {
        continue;
      }

      if (durationBeats <= 0) {
        continue;
      }

      const tieFlags = getTieFlags(noteObject);
      const tupletInfo = getTupletInfo(noteObject);
      const eventBase = {
        beat: beatCursor,
        durationBeats,
        voice,
        vexDuration: typeToVexDuration(getText(noteObject.type)),
        dots: getDots(noteObject),
        lyric: getLyric(noteObject),
        tieStart: tieFlags.tieStart,
        tieStop: tieFlags.tieStop,
        ...tupletInfo,
      };

      if (noteObject.rest !== undefined) {
        melody.push({
          kind: 'rest',
          ...eventBase,
        });
        beatCursor += durationBeats;
        continue;
      }

      const pitch = noteObject.pitch as Record<string, unknown> | undefined;
      if (!pitch) {
        beatCursor += durationBeats;
        continue;
      }

      const step = getText(pitch.step);
      const alter = asNumber(pitch.alter, 0);
      const octave = asNumber(pitch.octave, 4);
      const transposedPitch = transposeConcertPitchToBb(step, alter, octave);
      const concertMidi = 12 * (octave + 1) + (alter + ({
        C: 0,
        D: 2,
        E: 4,
        F: 5,
        G: 7,
        A: 9,
        B: 11,
      }[step.toUpperCase()] ?? 0));

      melody.push({
        kind: 'note',
        ...eventBase,
        concertMidi,
        concertFrequency: 440 * Math.pow(2, (concertMidi - 69) / 12),
        displayKey: transposedPitch.key,
        vexKey: transposedPitch.vexKey,
        accidental: transposedPitch.accidental,
        fingering: PISTONS[transposedPitch.key] || '',
      });
      beatCursor += durationBeats;
    }

    parsedMeasures.push({
      index,
      number: String(measure.number ?? index + 1),
      width: Number.isFinite(width) ? width : null,
      systemIndex: currentSystemIndex,
      beats: currentBeats,
      beatType: currentBeatType,
      divisions: currentDivisions,
      harmonyHints,
      melody,
    });
  }

  return {
    measures: parsedMeasures,
    systems,
    melodyTrack: parsedMeasures,
    harmonyHints: parsedMeasures.map((measure) => measure.harmonyHints),
    sourceTempo,
    title,
    beatsPerMeasure: parsedMeasures[0]?.beats ?? currentBeats,
    beatType: parsedMeasures[0]?.beatType ?? currentBeatType,
  };
}

export async function loadParsedLeadSheet(path: string): Promise<ParsedLeadSheet> {
  const xmlText = await loadMusicXmlText(path);
  return parseMusicXmlLeadSheet(xmlText);
}
