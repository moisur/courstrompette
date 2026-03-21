// iReal Pro URL Parser
// Inspired by pianosnake/ireal-reader (MIT)
// Adapted for client-side ES module usage

export interface IRealSong {
  title: string;
  composer: string;
  style: string;
  key: string;
  bpm: number | null;
  measures: string[][];
  timeSignature: string;
  raw: string;
}

// ── Unscramble ──────────────────────────────────────────────────
function obfusc50(s: string): string {
  const a = s.split('');
  for (let i = 0; i < 5; i++) {
    a[49 - i] = s[i];
    a[i] = s[49 - i];
  }
  for (let i = 10; i < 24; i++) {
    a[49 - i] = s[i];
    a[i] = s[49 - i];
  }
  return a.join('');
}

function unscramble(s: string): string {
  let r = '';
  while (s.length > 50) {
    const p = s.substring(0, 50);
    s = s.substring(50);
    r += s.length < 2 ? p : obfusc50(p);
  }
  return r + s;
}

// ── Chord Parser ────────────────────────────────────────────────
const MUSIC_PREFIX = '1r34LbKcu7';

interface ParseState {
  measures: string[][];
  lastChord: string | null;
  startRepeatLoc: number | null;
  endRepeatLoc: number | null;
  timeSignature: string;
  thirdEndingImminent: boolean;
  dcAlFineImminent: boolean;
  dcAlCodaImminent: boolean;
  dsAlCodaImminent: boolean;
  fineLocation: number | null;
  codaLocation: number | null;
  segnoLocation: number | null;
}

function newState(): ParseState {
  return {
    measures: [],
    lastChord: null,
    startRepeatLoc: null,
    endRepeatLoc: null,
    timeSignature: '44',
    thirdEndingImminent: false,
    dcAlFineImminent: false,
    dcAlCodaImminent: false,
    dsAlCodaImminent: false,
    fineLocation: null,
    codaLocation: null,
    segnoLocation: null,
  };
}

function ensureMeasure(st: ParseState) {
  if (st.measures.length === 0) st.measures.push([]);
}

function createNewMeasure(st: ParseState) {
  if (st.measures.length === 0 || st.measures[st.measures.length - 1].length !== 0) {
    st.measures.push([]);
  }
}

function repeatToEnd(st: ParseState) {
  if (st.startRepeatLoc == null) return;
  const end = st.endRepeatLoc ?? st.measures.length;
  const slice = st.measures.slice(st.startRepeatLoc, end);
  st.measures.push(...slice.map(m => [...m]));
  createNewMeasure(st);
}

function repeatRemaining(st: ParseState) {
  if (st.thirdEndingImminent) {
    repeatToEnd(st);
    st.thirdEndingImminent = false;
  }
  if (st.dcAlFineImminent && st.fineLocation != null) {
    st.measures.push(...st.measures.slice(0, st.fineLocation).map(m => [...m]));
    st.dcAlFineImminent = false;
  }
  if (st.dcAlCodaImminent && st.codaLocation != null) {
    st.measures.push(...st.measures.slice(0, st.codaLocation).map(m => [...m]));
    st.dcAlCodaImminent = false;
  }
  if (st.dsAlCodaImminent && st.segnoLocation != null && st.codaLocation != null) {
    st.measures.push(...st.measures.slice(st.segnoLocation, st.codaLocation).map(m => [...m]));
    st.dsAlCodaImminent = false;
  }
  if (!(st.thirdEndingImminent || st.dcAlFineImminent || st.dcAlCodaImminent || st.dsAlCodaImminent)) {
    createNewMeasure(st);
  }
}

// Chord regex: A-G followed by optional quality, optional slash bass
const CHORD_RE = /^[A-GW][+\-^dhob#sualt0-9]*(\/[A-G][#b]?)?/;

type Rule = {
  token: string | RegExp;
  op?: (st: ParseState, match?: RegExpMatchArray) => void;
};

const rules: Rule[] = [
  { token: 'XyQ' }, // empty space
  { token: /^\*\w/ }, // section marker (skip)
  {
    token: /^<(.*?)>/,
    op: (st, m) => {
      if (!m) return;
      const t = m[1].toLowerCase();
      if (t === 'd.c. al 3rd ending') st.thirdEndingImminent = true;
      if (t === 'd.c. al fine') st.dcAlFineImminent = true;
      if (t === 'd.c. al coda') st.dcAlCodaImminent = true;
      if (t === 'd.s. al coda') st.dsAlCodaImminent = true;
      if (t === 'fine') st.fineLocation = st.measures.length;
    },
  },
  {
    token: /^T(\d+)/,
    op: (st, m) => { if (m) st.timeSignature = m[1]; },
  },
  {
    token: 'x',
    op: (st) => {
      if (st.measures.length >= 2) {
        st.measures[st.measures.length - 1] = [...st.measures[st.measures.length - 2]];
      }
    },
  },
  {
    token: 'Kcl',
    op: (st) => {
      if (st.measures.length >= 1) {
        st.measures.push([...st.measures[st.measures.length - 1]]);
      }
    },
  },
  {
    token: 'r|XyQ',
    op: (st) => {
      if (st.measures.length >= 3) {
        st.measures[st.measures.length - 1] = [...st.measures[st.measures.length - 3]];
        st.measures.push([...st.measures[st.measures.length - 2]]);
      }
    },
  },
  { token: /^Y+/ },
  { token: 'n', op: (st) => { ensureMeasure(st); st.measures[st.measures.length - 1].push('N.C.'); } },
  { token: 'p' },
  { token: 'U' },
  { token: 'S', op: (st) => { st.segnoLocation = st.measures.length - 1; } },
  { token: 'Q', op: (st) => { st.codaLocation = st.measures.length; } },
  {
    token: '{',
    op: (st) => { createNewMeasure(st); st.startRepeatLoc = st.measures.length - 1; st.endRepeatLoc = null; },
  },
  { token: '}', op: (st) => repeatToEnd(st) },
  { token: 'LZ|', op: (st) => createNewMeasure(st) },
  { token: '|', op: (st) => createNewMeasure(st) },
  { token: 'LZ', op: (st) => createNewMeasure(st) },
  { token: '[', op: (st) => createNewMeasure(st) },
  { token: ']', op: (st) => repeatRemaining(st) },
  {
    token: /^N(\d)/,
    op: (st, m) => {
      if (m && parseInt(m[1]) === 1) {
        st.endRepeatLoc = st.measures.length - 1;
      }
    },
  },
  { token: 'Z', op: (st) => repeatRemaining(st) },
  {
    token: CHORD_RE,
    op: (st, m) => {
      if (!m) return;
      ensureMeasure(st);
      let chord = m[0];
      if (chord.startsWith('W') && st.lastChord) {
        chord = chord.replace('W', st.lastChord);
      } else {
        st.lastChord = chord.split('/')[0];
      }
      st.measures[st.measures.length - 1].push(chord);
    },
  },
];

function parseChords(input: string): { measures: string[][]; timeSignature: string; raw: string } {
  const st = newState();

  function parse(s: string) {
    if (s.length <= 1) return;

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];

      if (typeof rule.token === 'string') {
        if (s.startsWith(rule.token)) {
          if (rule.op) rule.op(st);
          parse(s.substring(rule.token.length).trimStart());
          return;
        }
      } else {
        const match = s.match(rule.token);
        if (match && match.index === 0) {
          if (rule.op) rule.op(st, match);
          parse(s.substring(match[0].length).trimStart());
          return;
        }
      }

      // Last rule and nothing matched — skip one char
      if (i === rules.length - 1) {
        parse(s.substring(1));
      }
    }
  }

  parse(input);
  return {
    measures: st.measures.filter(m => m.length > 0),
    timeSignature: st.timeSignature,
    raw: input,
  };
}

// ── Song Extraction ─────────────────────────────────────────────
function parseMusic(data: string) {
  const parts = data.split(MUSIC_PREFIX);
  if (parts.length < 2) return parseChords(data);
  return parseChords(unscramble(parts[1]));
}

function makeSong(data: string): IRealSong | null {
  const parts = data.split(/=+/).filter(x => x !== '');
  let title = '', composer = '', style = '', key = '', bpm: number | null = null;
  let musicRaw = '';

  if (parts.length >= 7) {
    if (parts.length === 7) {
      [title, composer, , style, key, musicRaw] = [parts[0], parts[1], parts[2], parts[2], parts[3], parts[4]];
      bpm = parts[5] ? parseInt(parts[5]) : null;
    } else if (parts.length === 8 && parts[4].startsWith(MUSIC_PREFIX)) {
      [title, composer, style, key] = parts;
      musicRaw = parts[4];
      bpm = parts[6] ? parseInt(parts[6]) : null;
    } else if (parts.length === 8 && parts[5]?.startsWith(MUSIC_PREFIX)) {
      [title, composer, style, key] = parts;
      musicRaw = parts[5];
      bpm = parts[6] ? parseInt(parts[6]) : null;
    } else if (parts.length >= 9) {
      [title, composer, style, key] = parts;
      musicRaw = parts[5];
      bpm = parts[7] ? parseInt(parts[7]) : null;
    }
  }

  // Fallback: find the part that starts with MUSIC_PREFIX
  if (!musicRaw) {
    musicRaw = parts.find(p => p.includes(MUSIC_PREFIX)) || '';
  }

  if (!musicRaw || !title) return null;

  const parsed = parseMusic(musicRaw);
  return {
    title: decodeURIComponent(title).replace(/\+/g, ' '),
    composer: decodeURIComponent(composer).replace(/\+/g, ' '),
    style: decodeURIComponent(style).replace(/\+/g, ' '),
    key,
    bpm: bpm && !isNaN(bpm) ? bpm : null,
    measures: parsed.measures,
    timeSignature: parsed.timeSignature,
    raw: parsed.raw,
  };
}

// ── Public API ──────────────────────────────────────────────────
export function parseIRealUrl(data: string): IRealSong[] {
  const protocolMatch = data.match(/.*?irealb:\/\/([^"]*)/);
  if (!protocolMatch) return [];

  const decoded = decodeURIComponent(protocolMatch[1]);
  const songParts = decoded.split('===');

  // Last part may be playlist name
  if (songParts.length > 1) songParts.pop();

  return songParts.map(makeSong).filter((s): s is IRealSong => s !== null);
}

// ── Transposition ───────────────────────────────────────────────
const CHROMATIC = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteIndex(note: string): number {
  const map: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  };
  return map[note] ?? -1;
}

export function transposeChord(chord: string, semitones: number): string {
  if (chord === 'N.C.' || !chord) return chord;

  // Handle slash chords
  const slashIdx = chord.indexOf('/');
  if (slashIdx > 0) {
    const root = chord.substring(0, slashIdx);
    const bass = chord.substring(slashIdx + 1);
    return transposeChord(root, semitones) + '/' + transposeSingleNote(bass, semitones);
  }

  // Extract root note (1 or 2 chars)
  let rootLen = 1;
  if (chord.length > 1 && (chord[1] === '#' || chord[1] === 'b')) rootLen = 2;
  const root = chord.substring(0, rootLen);
  const quality = chord.substring(rootLen);

  const idx = noteIndex(root);
  if (idx < 0) return chord;

  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  // Use flats for keys that typically use flats
  const useFlats = root.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root);
  const newRoot = useFlats ? CHROMATIC[newIdx] : CHROMATIC_SHARP[newIdx];

  return newRoot + quality;
}

function transposeSingleNote(note: string, semitones: number): string {
  let rootLen = 1;
  if (note.length > 1 && (note[1] === '#' || note[1] === 'b')) rootLen = 2;
  const root = note.substring(0, rootLen);
  const rest = note.substring(rootLen);
  const idx = noteIndex(root);
  if (idx < 0) return note;
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  const useFlats = root.includes('b');
  return (useFlats ? CHROMATIC[newIdx] : CHROMATIC_SHARP[newIdx]) + rest;
}

export function transposeMeasures(measures: string[][], semitones: number): string[][] {
  if (semitones === 0) return measures;
  return measures.map(m => m.map(chord => transposeChord(chord, semitones)));
}
