export const CHROMATIC_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const ROMANCE_NOTES: Record<string, string> = {
  'C': 'Do',
  'C#': 'Do#',
  'Db': 'Reb',
  'D': 'Re',
  'D#': 'Re#',
  'Eb': 'Mib',
  'E': 'Mi',
  'F': 'Fa',
  'F#': 'Fa#',
  'Gb': 'Solb',
  'G': 'Sol',
  'G#': 'Sol#',
  'Ab': 'Lab',
  'A': 'La',
  'A#': 'La#',
  'Bb': 'Sib',
  'B': 'Si',
};

export const PISTONS: Record<string, string> = {
  'F#3': '111',
  'G3': '101',
  'G#3': '011',
  'Ab3': '011',
  'A3': '110',
  'A#3': '100',
  'B3': '010',
  'Bb3': '100',
  'C4': '000',
  'C#4': '111',
  'Db4': '111',
  'D4': '101',
  'D#4': '011',
  'Eb4': '011',
  'E4': '110',
  'F4': '100',
  'F#4': '010',
  'Gb4': '010',
  'G4': '000',
  'G#4': '011',
  'Ab4': '011',
  'A4': '110',
  'A#4': '100',
  'B4': '010',
  'Bb4': '100',
  'C5': '000',
  'C#5': '110',
  'Db5': '110',
  'D5': '100',
  'D#5': '010',
  'Eb5': '010',
  'E5': '000',
  'F5': '100',
  'F#5': '010',
  'Gb5': '010',
  'G5': '000',
  'G#5': '011',
  'Ab5': '011',
  'A5': '110',
  'A#5': '100',
  'Bb5': '100',
  'B5': '010',
  'C6': '000',
};

const INTERVALS: Record<string, number[]> = {
  '': [0, 4, 7],
  '5': [0, 7],
  sus: [0, 5, 7],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  '+': [0, 4, 8],
  o: [0, 3, 6],
  '-': [0, 3, 7],
  '6': [0, 4, 7, 9],
  '-6': [0, 3, 7, 9],
  '69': [0, 4, 7, 9, 14],
  '-69': [0, 3, 7, 9, 14],
  '7': [0, 4, 7, 10],
  '-7': [0, 3, 7, 10],
  '^7': [0, 4, 7, 11],
  '^': [0, 4, 7, 11],
  o7: [0, 3, 6, 9],
  h: [0, 3, 6, 10],
  h7: [0, 3, 6, 10],
  '+7': [0, 4, 8, 10],
  '-^7': [0, 3, 7, 11],
  '7sus': [0, 5, 7, 10],
  '7sus4': [0, 5, 7, 10],
  '9': [0, 4, 7, 10, 14],
  '-9': [0, 3, 7, 10, 14],
  '^9': [0, 4, 7, 11, 14],
  '9sus': [0, 5, 7, 10, 14],
  '9sus4': [0, 5, 7, 10, 14],
  add9: [0, 4, 7, 14],
  '-add9': [0, 3, 7, 14],
  '11': [0, 4, 7, 10, 14, 17],
  '-11': [0, 3, 7, 10, 14, 17],
  '^11': [0, 4, 7, 11, 14, 18],
  '13': [0, 4, 7, 10, 14, 21],
  '-13': [0, 3, 7, 10, 14, 21],
  '^13': [0, 4, 7, 11, 14, 21],
  '13sus': [0, 5, 7, 10, 14, 21],
  '13sus4': [0, 5, 7, 10, 14, 21],
  alt: [0, 4, 8, 10, 13],
  '7alt': [0, 4, 8, 10, 13],
  '7b5': [0, 4, 6, 10],
  '7#5': [0, 4, 8, 10],
  '7b9': [0, 4, 7, 10, 13],
  '7#9': [0, 4, 7, 10, 15],
  '7b5b9': [0, 4, 6, 10, 13],
  '7b5#9': [0, 4, 6, 10, 15],
  '7#5b9': [0, 4, 8, 10, 13],
  '7#5#9': [0, 4, 8, 10, 15],
  '7b13': [0, 4, 7, 10, 20],
  '7#11': [0, 4, 7, 10, 18],
  '7b9b13': [0, 4, 7, 10, 13, 20],
  '7b9#11': [0, 4, 7, 10, 13, 18],
  '9b5': [0, 4, 6, 10, 14],
  '9#5': [0, 4, 8, 10, 14],
  '9#11': [0, 4, 7, 10, 14, 18],
  '13b9': [0, 4, 7, 10, 13, 21],
  '13#9': [0, 4, 7, 10, 15, 21],
  '13#11': [0, 4, 7, 10, 14, 18, 21],
  '13b9#11': [0, 4, 7, 10, 13, 18, 21],
  '^7#11': [0, 4, 7, 11, 18],
  '^7b5': [0, 4, 6, 11],
  '^9#11': [0, 4, 7, 11, 14, 18],
  '^13#11': [0, 4, 7, 11, 14, 18, 21],
  '-7b5': [0, 3, 6, 10],
  '-7#5': [0, 3, 8, 10],
  '-9b5': [0, 3, 6, 10, 14],
  '-9#5': [0, 3, 8, 10, 14],
  '-11b5': [0, 3, 6, 10, 14, 17],
  '+^7': [0, 4, 8, 11],
  '+9': [0, 4, 8, 10, 14],
};

export interface ChordInfo {
  chordStr: string;
  root: string;
  quality: string;
  notes: string[];
  trumpetNotes: string[];
  fingerings: string[];
}

export interface ParsedChordName {
  root: string;
  quality: string;
  bass: string | null;
}

export interface TransposedPitch {
  key: string;
  vexKey: string;
  accidental: string | null;
}

export interface ChordBeatSegment {
  chord: string;
  startBeat: number;
  duration: number;
}

export function getFingeringText(pistonString: string): string {
  if (!pistonString) return '';
  if (pistonString === '000') return '0';
  return pistonString
    .split('')
    .map((piston, index) => (piston === '1' ? (index + 1).toString() : ''))
    .filter(Boolean)
    .join('');
}

export function nIdx(note: string): number {
  const map: Record<string, number> = {
    C: 0,
    'C#': 1,
    Db: 1,
    D: 2,
    'D#': 3,
    Eb: 3,
    E: 4,
    F: 5,
    'F#': 6,
    Gb: 6,
    G: 7,
    'G#': 8,
    Ab: 8,
    A: 9,
    'A#': 10,
    Bb: 10,
    B: 11,
  };

  return map[note] ?? 0;
}

export function noteAt(index: number, flat: boolean): string {
  const normalizedIndex = ((index % 12) + 12) % 12;
  return flat ? CHROMATIC_NOTES[normalizedIndex] : CHROMATIC_SHARP[normalizedIndex];
}

export function noteFreq(note: string, octave: number): number {
  const index = nIdx(note);
  return 440 * Math.pow(2, (index - 9 + (octave - 4) * 12) / 12);
}

export function prettyQuality(quality: string): string {
  return quality
    .replace('^7', 'M7')
    .replace('^9', 'M9')
    .replace('^11', 'M11')
    .replace('^13', 'M13')
    .replace('^', 'M')
    .replace('-', 'm')
    .replace('h7', 'o/7')
    .replace('h', 'o/')
    .replace('o7', 'deg7')
    .replace('o', 'deg');
}

export function prettyNote(note: string): string {
  return note.replace(/b/g, 'b').replace(/#/g, '#');
}

export function parseChordName(chord: string): ParsedChordName {
  if (!chord || chord === 'N.C.') {
    return { root: '', quality: '', bass: null };
  }

  const slashIndex = chord.indexOf('/');
  let main = chord;
  let bass: string | null = null;

  if (slashIndex > 0) {
    main = chord.substring(0, slashIndex);
    bass = chord.substring(slashIndex + 1);
  }

  let rootLength = 1;
  if (main.length > 1 && (main[1] === '#' || main[1] === 'b')) {
    rootLength = 2;
  }

  return {
    root: main.substring(0, rootLength),
    quality: main.substring(rootLength),
    bass,
  };
}

export function findIntervals(quality: string): number[] {
  if (INTERVALS[quality]) {
    return INTERVALS[quality];
  }

  const fallbacks = [quality, quality.replace('sus4', 'sus'), quality.replace(/(\d+)$/, '')];
  for (const fallback of fallbacks) {
    if (INTERVALS[fallback]) {
      return INTERVALS[fallback];
    }
  }

  return INTERVALS[''];
}

export function getChordInfo(chord: string): ChordInfo | null {
  const { root, quality } = parseChordName(chord);
  if (!root) {
    return null;
  }

  const rootIndex = nIdx(root);
  const isFlat = root.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root);
  const intervals = findIntervals(quality);
  const notes = intervals.map((interval) => noteAt(rootIndex + interval, isFlat));
  const trumpetNotes: string[] = [];
  const fingerings: string[] = [];
  const baseMidi = 60 + (rootIndex > 7 ? rootIndex - 12 : rootIndex);

  for (const interval of intervals) {
    const concertMidi = baseMidi + interval;
    const trumpetMidi = concertMidi + 2;
    const octave = Math.floor(trumpetMidi / 12) - 1;
    const noteIndex = ((trumpetMidi % 12) + 12) % 12;
    const transposedRootIndex = (rootIndex + 2) % 12;
    const sharpKeys = [2, 9, 4, 11, 6];
    const useFlatSpelling = !sharpKeys.includes(transposedRootIndex);
    const sharpKey = `${noteAt(noteIndex, false)}${octave}`;
    const flatKey = `${noteAt(noteIndex, true)}${octave}`;
    const displayKey = useFlatSpelling ? flatKey : sharpKey;

    trumpetNotes.push(displayKey);

    let fingering = '';
    if (useFlatSpelling && PISTONS[flatKey]) {
      fingering = PISTONS[flatKey];
    } else if (!useFlatSpelling && PISTONS[sharpKey]) {
      fingering = PISTONS[sharpKey];
    } else {
      fingering = PISTONS[flatKey] || PISTONS[sharpKey] || '';
    }

    fingerings.push(fingering);
  }

  return { chordStr: chord, root, quality, notes, trumpetNotes, fingerings };
}

export function transposeConcertPitchToBb(step: string, alter: number, octave: number): TransposedPitch {
  const concertKey = `${step.toUpperCase()}${alter === 1 ? '#' : alter === -1 ? 'b' : ''}`;
  const midi = 12 * (octave + 1) + nIdx(concertKey);
  const transposedMidi = midi + 2;
  const transposedOctave = Math.floor(transposedMidi / 12) - 1;
  const transposedIndex = ((transposedMidi % 12) + 12) % 12;
  const sharpKeys = [2, 9, 4, 11, 6];
  const useFlatSpelling = !sharpKeys.includes(transposedIndex);
  const noteName = noteAt(transposedIndex, useFlatSpelling);

  return {
    key: `${noteName}${transposedOctave}`,
    vexKey: `${noteName[0].toLowerCase()}${noteName.length > 1 ? noteName.slice(1) : ''}/${transposedOctave}`,
    accidental: noteName.length > 1 ? noteName[1] : null,
  };
}

export function getBeatsFromTimeSignature(timeSignature: string, fallback = 4): number {
  const normalized = timeSignature.trim();
  if (/^\d+$/.test(normalized)) {
    const numerator = Number(normalized.slice(0, normalized.length / 2 || 1));
    if (Number.isFinite(numerator) && numerator > 0) {
      return numerator;
    }
  }

  const slashMatch = normalized.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (slashMatch) {
    const numerator = Number(slashMatch[1]);
    if (Number.isFinite(numerator) && numerator > 0) {
      return numerator;
    }
  }

  return fallback;
}

function buildEvenDurations(chordCount: number, beatsPerMeasure: number): number[] {
  const durations: number[] = [];
  let remainingBeats = beatsPerMeasure;

  for (let index = 0; index < chordCount; index += 1) {
    const remainingChords = chordCount - index;
    const duration = Math.max(1, Math.round(remainingBeats / remainingChords));
    durations.push(duration);
    remainingBeats -= duration;
  }

  if (durations.length > 0) {
    durations[durations.length - 1] += remainingBeats;
  }

  return durations;
}

export function buildChordBeatSegments(measure: string[], beatsPerMeasure: number): ChordBeatSegment[] {
  if (!Array.isArray(measure) || measure.length === 0 || beatsPerMeasure <= 0) {
    return [];
  }

  let durations: number[];
  if (beatsPerMeasure === 4) {
    if (measure.length === 1) durations = [4];
    else if (measure.length === 2) durations = [2, 2];
    else if (measure.length === 3) durations = [1, 1, 2];
    else if (measure.length >= 4) durations = [1, 1, 1, 1];
    else durations = buildEvenDurations(measure.length, beatsPerMeasure);
  } else if (beatsPerMeasure === 3) {
    if (measure.length === 1) durations = [3];
    else if (measure.length === 2) durations = [2, 1];
    else if (measure.length >= 3) durations = [1, 1, 1];
    else durations = buildEvenDurations(measure.length, beatsPerMeasure);
  } else {
    durations = buildEvenDurations(Math.min(measure.length, beatsPerMeasure), beatsPerMeasure);
  }

  const limitedMeasure = measure.slice(0, durations.length);
  const segments: ChordBeatSegment[] = [];
  let startBeat = 0;

  for (let index = 0; index < limitedMeasure.length; index += 1) {
    const duration = durations[index];
    if (duration <= 0) {
      continue;
    }

    segments.push({
      chord: limitedMeasure[index],
      startBeat,
      duration,
    });
    startBeat += duration;
  }

  return segments;
}
