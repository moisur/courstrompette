"use client"
import { SOULFUL_BOP_PHRASES } from './soulfulBopPhrases';
import IrealChordViewer from './IrealChordViewer';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Pause, Play, Save, Volume2, VolumeX, FileMusic, Activity, LayoutDashboard, Settings2, Music2, Rocket, Gauge, Flag, Zap, Repeat, Target, BookOpen } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import * as Vex from 'vexflow';
import { Midi } from '@tonejs/midi';

const VF = Vex.Flow;

// Type definitions
interface Piston {
  [note: string]: string;
}

interface NoteName {
  [note: string]: string;
}

interface ScalePattern {
  [scale: string]: number[];
}

interface ExerciseNote {
  key: string;
  duration: string;
  newLine?: boolean;
}

interface ExercisePattern {
  [exercise: string]: (scale?: string[]) => string[] | ExerciseNote[];
}

type TheoryMode = 'gamme' | 'accord';

interface Favorite {
  rootNote: string;
  scaleType: string;
  theoryMode?: TheoryMode;
  exerciseCategory: 'generator' | 'repertoire' | 'bop' | 'midi';
  exerciseType: string;
  tempo: number;
  volume: number;
  startNote: string;
  endNote: string;
  upDown: boolean;
  timestamp: number;
}

// Constants
const PISTONS: Piston = {
  "F#3": "111", "G3": "101", "G#3": "011", "Ab3": "011", "A3": "110", "A#3": "100", "B3": "010", "Bb3": "100",
  "C4": "000", "C#4": "111", "D4": "101", "D#4": "011", "Eb4": "011", "E4": "110",
  "F4": "100", "F#4": "010", "G4": "000", "G#4": "011", "Ab4": "011", "A4": "110",
  "A#4": "100", "B4": "010", "Bb4": "100", "C5": "000", "C#5": "110", "D5": "100",
  "D#5": "010", "E5": "000", "F5": "100", "F#5": "010", "G5": "000",
  "G#5": "011", "A5": "110", "A#5": "100", "B5": "010", "C6": "000"
};

const NOTE_NAMES: NoteName = {
  'C': 'do', 'C#': 'do#', 'D': 'ré', 'D#': 'ré#',
  'E': 'mi', 'F': 'fa', 'F#': 'fa#', 'G': 'sol',
  'G#': 'sol#', 'A': 'la', 'A#': 'la#', 'B': 'si', 'Bb': 'si♭', 'Eb': 'mi♭', 'Ab': 'la♭'
};

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BEAT_VALUES: { [duration: string]: number } = { 'w': 4, 'h': 2, 'q': 1, '8': 0.5, '16': 0.25 };

const SCALE_PATTERNS: ScalePattern = {
  'Majeure': [0, 2, 4, 5, 7, 9, 11, 12],
  'Mineure naturelle': [0, 2, 3, 5, 7, 8, 10, 12],
  'Mineure harmonique': [0, 2, 3, 5, 7, 8, 11, 12],
  'Mineure mélodique': [0, 2, 3, 5, 7, 9, 11, 12],
  'Majeur 7': [0, 4, 7, 11],
  'Majeur 9': [0, 4, 7, 11, 14],
  'Dominant 7': [0, 4, 7, 10],
  'Dominant 9': [0, 4, 7, 10, 14],
  'Mineur 7': [0, 3, 7, 10],
  'Mineur 9': [0, 3, 7, 10, 14],
  'Mineur 7 (b9)': [0, 3, 7, 10, 13],
  'Diminué': [0, 3, 6, 9],
  'Demi-diminué (m7b5)': [0, 3, 6, 10],
};

const SCALE_TYPE_OPTIONS = ['Majeure', 'Mineure naturelle', 'Mineure harmonique', 'Mineure mÃ©lodique'] as const;
const CHORD_TYPE_OPTIONS = ['Majeur 7', 'Majeur 9', 'Dominant 7', 'Dominant 9', 'Mineur 7', 'Mineur 9', 'Mineur 7 (b9)', 'DiminuÃ©', 'Demi-diminuÃ© (m7b5)'] as const;

Object.assign(SCALE_PATTERNS, {
  'Blues': [0, 3, 5, 6, 7, 10, 12],
  'Pentatonique majeure': [0, 2, 4, 7, 9, 12],
  'Pentatonique mineure': [0, 3, 5, 7, 10, 12],
  'Majeur': [0, 4, 7],
  'Mineur': [0, 3, 7],
  'Majeur 6': [0, 4, 7, 9],
  'Mineur 6': [0, 3, 7, 9],
  'Augmente': [0, 4, 8],
  'Sus2': [0, 2, 7],
  'Sus4': [0, 5, 7],
  '7sus4': [0, 5, 7, 10],
});

const GAMME_TYPE_OPTIONS = [
  'Majeure',
  'Mineure naturelle',
  'Mineure harmonique',
  'Mineure mÃƒÂ©lodique',
  'Blues',
  'Pentatonique majeure',
  'Pentatonique mineure',
  'Majeur 7',
  'Majeur 9',
  'Dominant 7',
  'Dominant 9',
  'Mineur 7',
  'Mineur 9',
  'Mineur 7 (b9)',
  'DiminuÃƒÂ©',
  'Demi-diminuÃƒÂ© (m7b5)',
] as const;

const ACCORD_TYPE_OPTIONS = [
  'Majeur',
  'Mineur',
  'Majeur 6',
  'Mineur 6',
  'Sus2',
  'Sus4',
  '7sus4',
  'Augmente',
  'Majeur-Majeur 7',
  'Majeur 9',
  'Majeur-Mineur 7',
  'Dominant 9',
  'Mineur-Mineur 7',
  'Mineur-Majeur 7',
  'Mineur 9',
  'Mineur 7 (b9)',
  'DiminuÃƒÂ©',
  'Demi-diminuÃƒÂ© (m7b5)',
] as const;

const isScaleOption = (value: string) => GAMME_TYPE_OPTIONS.includes(value as typeof GAMME_TYPE_OPTIONS[number]);
const isChordOption = (value: string) => ACCORD_TYPE_OPTIONS.includes(value as typeof ACCORD_TYPE_OPTIONS[number]);
const getTheoryModeForScaleType = (value: string): TheoryMode => isChordOption(value) ? 'accord' : 'gamme';
const UNIFIED_THEORY_TYPE_OPTIONS = [
  'Majeure',
  'Mineure naturelle',
  'Mineure harmonique',
  'Mineure mélodique',
  'Blues',
  'Pentatonique majeure',
  'Pentatonique mineure',
  'Majeur',
  'Mineur',
  'Majeur 6',
  'Mineur 6',
  'Sus2',
  'Sus4',
  '7sus4',
  'Augmente',
  'Majeur 7',
  'Majeur 9',
  'Dominant 7',
  'Dominant 9',
  'Mineur 7',
  'Mineur 9',
  'Mineur 7 (b9)',
  'Diminué',
  'Demi-diminué (m7b5)',
] as const;
const LEGACY_ACCORD_DEFAULT_TYPES = new Set([
  'Majeur',
  'Mineur',
  'Majeur 6',
  'Mineur 6',
  'Sus2',
  'Sus4',
  '7sus4',
  'Augmente',
]);
const THEORY_TYPE_ALIASES: Record<string, string> = {
  'Mineure mÃ©lodique': 'Mineure mélodique',
  'Mineure mÃƒÂ©lodique': 'Mineure mélodique',
  'Mineure mÃƒÆ’Ã‚Â©lodique': 'Mineure mélodique',
  'DiminuÃ©': 'Diminué',
  'DiminuÃƒÂ©': 'Diminué',
  'DiminuÃƒÆ’Ã‚Â©': 'Diminué',
  'Demi-diminuÃ© (m7b5)': 'Demi-diminué (m7b5)',
  'Demi-diminuÃƒÂ© (m7b5)': 'Demi-diminué (m7b5)',
  'Demi-diminuÃƒÆ’Ã‚Â© (m7b5)': 'Demi-diminué (m7b5)',
};
const EXTRA_THEORY_TYPE_ALIASES: Record<string, string> = {
  'Majeur 7': 'Majeur-Majeur 7',
  'Dominant 7': 'Majeur-Mineur 7',
  'Mineur 7': 'Mineur-Mineur 7',
  'Majeur majeur 7': 'Majeur-Majeur 7',
  'Majeur mineur 7': 'Majeur-Mineur 7',
  'Mineur mineur 7': 'Mineur-Mineur 7',
  'Mineur majeur 7': 'Mineur-Majeur 7',
};
const normalizeTheoryType = (value: string) => EXTRA_THEORY_TYPE_ALIASES[THEORY_TYPE_ALIASES[value] || value] || THEORY_TYPE_ALIASES[value] || value;
const THEORY_TYPE_LABELS: Record<string, string> = {
  'Majeure': 'Maj',
  'Mineure naturelle': 'm nat',
  'Mineure harmonique': 'm harm',
  'Mineure mélodique': 'm mel',
  'Blues': 'Blues',
  'Pentatonique majeure': 'Penta Maj',
  'Pentatonique mineure': 'Penta m',
  'Majeur': 'Maj',
  'Mineur': 'm',
  'Majeur 6': 'Maj6',
  'Mineur 6': 'm6',
  'Sus2': 'sus2',
  'Sus4': 'sus4',
  '7sus4': '7sus4',
  'Augmente': 'aug',
  'Majeur-Majeur 7': 'Maj7',
  'Majeur 9': 'Maj9',
  'Majeur-Mineur 7': '7',
  'Dominant 9': '9',
  'Mineur-Mineur 7': 'm7',
  'Mineur-Majeur 7': 'mMaj7',
  'Mineur 9': 'm9',
  'Mineur 7 (b9)': 'm7(b9)',
  'Diminué': 'dim',
  'Demi-diminué (m7b5)': 'm7b5',
};
const getTheoryTypeLabel = (value: string) => THEORY_TYPE_LABELS[normalizeTheoryType(value)] || normalizeTheoryType(value);
const MODE_SCALE_PATTERNS: ScalePattern = {
  'Majeure': [0, 2, 4, 5, 7, 9, 11, 12],
  'Mineure naturelle': [0, 2, 3, 5, 7, 8, 10, 12],
  'Mineure harmonique': [0, 2, 3, 5, 7, 8, 11, 12],
  'Mineure mélodique': [0, 2, 3, 5, 7, 9, 11, 12],
  'Blues': [0, 3, 5, 6, 7, 10, 12],
  'Pentatonique majeure': [0, 2, 4, 7, 9, 12],
  'Pentatonique mineure': [0, 3, 5, 7, 10, 12],
  'Majeur': [0, 2, 4, 5, 7, 9, 11, 12],
  'Mineur': [0, 2, 3, 5, 7, 8, 10, 12],
  'Majeur 6': [0, 2, 4, 5, 7, 9, 11, 12],
  'Mineur 6': [0, 2, 3, 5, 7, 9, 10, 12],
  'Sus2': [0, 2, 4, 7, 9, 12],
  'Sus4': [0, 2, 5, 7, 9, 10, 12],
  '7sus4': [0, 2, 5, 7, 9, 10, 12],
  'Augmente': [0, 2, 4, 6, 8, 10, 12],
  'Majeur 7': [0, 2, 4, 5, 7, 9, 11, 12],
  'Majeur-Majeur 7': [0, 2, 4, 5, 7, 9, 11, 12],
  'Majeur 9': [0, 2, 4, 5, 7, 9, 11, 12],
  'Majeur-Mineur 7': [0, 2, 4, 5, 7, 9, 10, 12],
  'Dominant 7': [0, 2, 4, 5, 7, 9, 10, 12],
  'Dominant 9': [0, 2, 4, 5, 7, 9, 10, 12],
  'Mineur 7': [0, 2, 3, 5, 7, 9, 10, 12],
  'Mineur-Mineur 7': [0, 2, 3, 5, 7, 9, 10, 12],
  'Mineur-Majeur 7': [0, 2, 3, 5, 7, 9, 11, 12],
  'Mineur 9': [0, 2, 3, 5, 7, 9, 10, 12],
  'Mineur 7 (b9)': [0, 1, 3, 5, 7, 8, 10, 12],
  'Diminué': [0, 2, 3, 5, 6, 8, 9, 11, 12],
  'Demi-diminué (m7b5)': [0, 1, 3, 5, 6, 8, 10, 12],
};
const MODE_CHORD_PATTERNS: ScalePattern = {
  'Majeure': [0, 4, 7, 11],
  'Mineure naturelle': [0, 3, 7, 10],
  'Mineure harmonique': [0, 3, 7, 11],
  'Mineure mélodique': [0, 3, 7, 11],
  'Blues': [0, 3, 7, 10],
  'Pentatonique majeure': [0, 4, 7, 9],
  'Pentatonique mineure': [0, 3, 7, 10],
  'Majeur': [0, 4, 7],
  'Mineur': [0, 3, 7],
  'Majeur 6': [0, 4, 7, 9],
  'Mineur 6': [0, 3, 7, 9],
  'Sus2': [0, 2, 7],
  'Sus4': [0, 5, 7],
  '7sus4': [0, 5, 7, 10],
  'Augmente': [0, 4, 8],
  'Majeur 7': [0, 4, 7, 11],
  'Majeur-Majeur 7': [0, 4, 7, 11],
  'Majeur 9': [0, 4, 7, 11, 14],
  'Majeur-Mineur 7': [0, 4, 7, 10],
  'Dominant 7': [0, 4, 7, 10],
  'Dominant 9': [0, 4, 7, 10, 14],
  'Mineur 7': [0, 3, 7, 10],
  'Mineur-Mineur 7': [0, 3, 7, 10],
  'Mineur-Majeur 7': [0, 3, 7, 11],
  'Mineur 9': [0, 3, 7, 10, 14],
  'Mineur 7 (b9)': [0, 3, 7, 10, 13],
  'Diminué': [0, 3, 6, 9],
  'Demi-diminué (m7b5)': [0, 3, 6, 10],
};
const getLegacyTheoryModeForScaleType = (value: string): TheoryMode => (
  LEGACY_ACCORD_DEFAULT_TYPES.has(normalizeTheoryType(value)) ? 'accord' : 'gamme'
);
const getIntervalsForMode = (scaleType: string, theoryMode: TheoryMode) => {
  const normalizedScaleType = normalizeTheoryType(scaleType);
  return (
  theoryMode === 'accord'
    ? (MODE_CHORD_PATTERNS[normalizedScaleType] || MODE_CHORD_PATTERNS['Majeure'])
    : (MODE_SCALE_PATTERNS[normalizedScaleType] || MODE_SCALE_PATTERNS['Majeure'])
  );
};
const RANGE_OCTAVES = [2, 3, 4, 5, 6];
const RANGE_NOTE_OPTIONS = RANGE_OCTAVES.flatMap((octave) => CHROMATIC_NOTES.map((note) => `${note}${octave}`));
const formatRangeNoteLabel = (note: string) => {
  const noteBase = note.replace(/[0-9]/g, '');
  const octave = note.match(/[0-9]/)?.[0] || '';
  return `${NOTE_NAMES[noteBase] || noteBase}${octave}`;
};

// Helpers for exercise generation
const normalizeNote = (n: string) => {
  const map: { [key: string]: string } = { 'Ab': 'G#', 'Bb': 'A#', 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#' };
  return map[n] || n;
};

const getNoteBelow = (note: string) => {
  const noteBase = normalizeNote(note.replace(/[0-9]/, ''));
  const octave = parseInt(note.match(/[0-9]/)?.[0] || '4', 10);
  let idx = CHROMATIC_NOTES.indexOf(noteBase);
  idx--;
  if (idx < 0) {
    idx = 11;
    return `${CHROMATIC_NOTES[idx]}${octave - 1}`;
  }
  return `${CHROMATIC_NOTES[idx]}${octave}`;
};

const getNoteAbove = (note: string) => {
  const noteBase = normalizeNote(note.replace(/[0-9]/, ''));
  const octave = parseInt(note.match(/[0-9]/)?.[0] || '4', 10);
  let idx = CHROMATIC_NOTES.indexOf(noteBase);
  idx++;
  if (idx > 11) {
    idx = 0;
    return `${CHROMATIC_NOTES[idx]}${octave + 1}`;
  }
  return `${CHROMATIC_NOTES[idx]}${octave}`;
};

const getNoteByInterval = (note: string, semitones: number) => {
  const noteBase = normalizeNote(note.replace(/[0-9]/, ''));
  const octave = parseInt(note.match(/[0-9]/)?.[0] || '4', 10);
  const idx = CHROMATIC_NOTES.indexOf(noteBase);
  const newIdx = idx + semitones;
  const octShift = Math.floor(newIdx / 12);
  const modIdx = ((newIdx % 12) + 12) % 12;
  return `${CHROMATIC_NOTES[modIdx]}${octave + octShift}`;
};

const noteToMidi = (note: string): number => {
  const cleanNote = note.replace('/r', '');
  const noteBase = normalizeNote(cleanNote.replace(/[0-9]/, ''));
  const octave = parseInt(cleanNote.match(/[0-9]/)?.[0] || '4', 10);
  const idx = CHROMATIC_NOTES.indexOf(noteBase);
  return (octave + 1) * 12 + idx;
};

const getScaleForRoot = (root: string) => {
  const rootBase = normalizeNote(root.replace(/[0-9]/, ''));
  const rootIdx = CHROMATIC_NOTES.indexOf(rootBase);
  const rootOctave = parseInt(root.match(/[0-9]/)?.[0] || '4', 10);
  return SCALE_PATTERNS['Majeure'].map(interval => {
    const idx = (rootIdx + interval) % 12;
    const oct = rootOctave + Math.floor((rootIdx + interval) / 12);
    return `${CHROMATIC_NOTES[idx]}${oct}`;
  });
};

const applyRhythmToPhrase = (phrase: string[]): ExerciseNote[] => [
  { key: phrase[0], duration: 'h' }, { key: phrase[1], duration: 'q' }, { key: phrase[2], duration: 'q' },
  { key: phrase[3], duration: 'h' }, { key: phrase[4], duration: 'q' }, { key: phrase[5], duration: 'q' },
  { key: phrase[6], duration: 'w' },
];

const EXERCISE_PATTERNS: ExercisePattern = {
  'Gamme simple': (scale) => scale!,
  'Tierces': (scale) => {
    const result = [];
    for (let i = 0; i < scale!.length - 2; i++) { result.push(scale![i], scale![i + 2]); }
    return result;
  },
  'Quartes': (scale) => {
    const result = [];
    for (let i = 0; i < scale!.length - 3; i++) { result.push(scale![i], scale![i + 3]); }
    return result;
  },
  'Quintes': (scale) => {
    const result = [];
    for (let i = 0; i < scale!.length - 4; i++) { result.push(scale![i], scale![i + 4]); }
    return result;
  },
  'Arpège': (scale) => [scale![0], scale![2], scale![4], scale![7]],
  'Arpège avec septième': (scale) => [scale![0], scale![2], scale![4], scale![6], scale![7]],
  'Enclosure (Jazz)': (scale) => {
    // Classique : ½ ton au-dessus → ½ ton en-dessous → note cible
    const result: ExerciseNote[] = [];
    scale!.forEach(target => {
      result.push({ key: getNoteAbove(target), duration: '8' });
      result.push({ key: getNoteBelow(target), duration: '8' });
      result.push({ key: target, duration: 'q' });
    });
    return result;
  },
  'Enclosure inversée': (scale) => {
    // Inversée : ½ ton en-dessous → ½ ton au-dessus → note cible
    const result: ExerciseNote[] = [];
    scale!.forEach(target => {
      result.push({ key: getNoteBelow(target), duration: '8' });
      result.push({ key: getNoteAbove(target), duration: '8' });
      result.push({ key: target, duration: 'q' });
    });
    return result;
  },
  'Enclosure double chromatique': (scale) => {
    // Double chromatique : 2 ½ tons au-dessus → 1 au-dessus → 1 en-dessous → cible
    const result: ExerciseNote[] = [];
    scale!.forEach(target => {
      result.push({ key: getNoteByInterval(target, 2), duration: '8' });
      result.push({ key: getNoteAbove(target), duration: '8' });
      result.push({ key: getNoteBelow(target), duration: '8' });
      result.push({ key: target, duration: '8' });
    });
    return result;
  },
  'Enclosure diatonique': (scale) => {
    // Diatonique : note diatonique au-dessus → note diatonique en-dessous → cible
    // Utilise les notes de la gamme plutôt que des ½ tons chromatiques
    const result: ExerciseNote[] = [];
    scale!.forEach((target, i) => {
      const above = i + 1 < scale!.length ? scale![i + 1] : getNoteAbove(target);
      const below = i > 0 ? scale![i - 1] : getNoteBelow(target);
      result.push({ key: above, duration: '8' });
      result.push({ key: below, duration: '8' });
      result.push({ key: target, duration: 'q' });
    });
    return result;
  },
  'Enclosure 4 notes': (scale) => {
    // 4 notes : au-dessus → cible → en-dessous → cible (résolution double)
    const result: ExerciseNote[] = [];
    scale!.forEach(target => {
      result.push({ key: getNoteAbove(target), duration: '8' });
      result.push({ key: target, duration: '8' });
      result.push({ key: getNoteBelow(target), duration: '8' });
      result.push({ key: target, duration: '8' });
    });
    return result;
  },
  'Enclosure sur 1-3-5-7': (scale) => {
    // Enclosures ciblant uniquement les notes d'accord (1, 3, 5, 7)
    // Plus musical pour l'improvisation jazz
    const targets = [scale![0], scale![2], scale![4], scale![6]]; // 1, 3, 5, 7
    const result: ExerciseNote[] = [];
    targets.forEach(target => {
      result.push({ key: getNoteAbove(target), duration: '8' });
      result.push({ key: getNoteBelow(target), duration: '8' });
      result.push({ key: target, duration: 'h' }); // Tenir plus longtemps sur les notes d'accord
    });
    return result;
  },
  'Flexibilité - Niveau 1': () => {
    const phrases = [
      ['C4', 'G4', 'C5', 'E5', 'C5', 'G4', 'C4'],
      ['B3', 'F#4', 'B4', 'D#5', 'B4', 'F#4', 'B3'],
      ['Bb3', 'F4', 'Bb4', 'D5', 'Bb4', 'F4', 'Bb3'],
      ['A3', 'E4', 'A4', 'C#5', 'A4', 'E4', 'A3'],
      ['Ab3', 'Eb4', 'Ab4', 'C5', 'Ab4', 'Eb4', 'Ab3'],
      ['G3', 'D4', 'G4', 'B4', 'G4', 'D4', 'G3'],
      ['F#3', 'C#4', 'F#4', 'A#4', 'F#4', 'C#4', 'F#3']
    ];
    return phrases.flatMap(applyRhythmToPhrase);
  },
  'Clarke II (Single Tonalité)': (scale) => {
    // scale contient déjà les 8 notes de la tonalité choisie dans l'UI
    const s = scale!;
    const leadingTone = getNoteBelow(s[0]);

    // On mappe EXACTEMENT ta séquence textuelle
    const pattern = [
      // do re mi do | re mi fa re | mi fa sol mi
      s[0], s[1], s[2], s[0], s[1], s[2], s[3], s[1], s[2], s[3], s[4], s[2],
      // do re mi do | re mi fa re (répétition de ta phrase)
      s[0], s[1], s[2], s[0], s[1], s[2], s[3], s[1],
      // si do re si
      leadingTone, s[0], s[1], leadingTone,
      // do mi re do | re fa mi re | do
      s[0], s[2], s[1], s[0], s[1], s[3], s[2], s[1], s[0]
    ];

    return pattern.map(key => ({
      key,
      duration: key === s[0] && pattern.indexOf(key) === pattern.length - 1 ? 'w' : '8'
    }));
  },
  'Arpèges (Plage)': (scale) => scale!,
  'Clarke Second Study': () => {
    // 1. La plage chromatique complète demandée
    const roots = [
      "G3", "Ab3", "A3", "Bb3", "B3",
      "C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4",
      "C5"
    ];

    const allNotes: ExerciseNote[] = [];

    roots.forEach((root) => {
      const s = getScaleForRoot(root);
      const leadingTone = getNoteBelow(s[0]);

      // Ton pattern exact (8 groupes de 4 notes)
      const pattern = [
        s[0], s[1], s[2], s[0], s[1], s[2], s[3], s[1], s[2], s[3], s[4], s[2],
        s[0], s[1], s[2], s[0], s[1], s[2], s[3], s[1],
        leadingTone, s[0], s[1], leadingTone,
        s[0], s[2], s[1], s[0], s[1], s[3], s[2], s[1]
      ];

      // Ajout des croches (8th notes)
      pattern.forEach(k => {
        allNotes.push({ key: k, duration: '8' });
      });

      // LA DERNIÈRE NOTE : Ronde (4 temps)
      // On ajoute 'newLine: true' pour déclencher le saut de ligne dans la vue
      allNotes.push({
        key: s[0],
        duration: 'w',
        newLine: true
      });

      // Plus de soupir (rest) ici, on passe directement à la tonalité suivante
    });

    return allNotes;
  },
  'Clarke Étude III': (scale) => {
    // The signature Clarke 3 pattern from the image
    // Pattern: 1-2-1-7 (x2), then 1-3-2-1, 2-3-2-1...
    // We need 1 octave + leading tone
    if (scale!.length < 8) return scale!;

    const notes: ExerciseNote[] = [];
    const s = scale!;

    // We need the leading tone below the root
    const rootBase = s[0].replace(/[0-9]/, '');
    const rootOctave = parseInt(s[0].match(/[0-9]/)?.[0] || '4', 10);
    const rootIdx = CHROMATIC_NOTES.indexOf(rootBase);
    const leadingIdx = (rootIdx - 1 + 12) % 12;
    const leadingOctave = rootOctave + Math.floor((rootIdx - 1) / 12);
    const leadingTone = `${CHROMATIC_NOTES[leadingIdx]}${leadingOctave}`;

    // Bar 1: 1-2-1-7 | 1-2-1-7
    [s[0], s[1], s[0], leadingTone, s[0], s[1], s[0], leadingTone].forEach(k => notes.push({ key: k, duration: '16' }));
    // Bar 2: 1-3-2-1 | 2-3-2-1
    [s[0], s[2], s[1], s[0], s[1], s[2], s[1], s[0]].forEach(k => notes.push({ key: k, duration: '16' }));

    // Continue moving up the scale: 3rd degree
    // Bar 3: 3-4-3-2 | 3-4-3-2
    [s[2], s[3], s[2], s[1], s[2], s[3], s[2], s[1]].forEach(k => notes.push({ key: k, duration: '16' }));
    // Bar 4: 3-5-4-3 | 4-5-4-3
    [s[2], s[4], s[3], s[2], s[3], s[4], s[3], s[2]].forEach(k => notes.push({ key: k, duration: '16' }));

    // Bar 5: 5-6-5-4 | 5-6-5-4 
    [s[4], s[5], s[4], s[3], s[4], s[5], s[4], s[3]].forEach(k => notes.push({ key: k, duration: '16' }));
    // Bar 6: 5-7-6-5 | 6-7-6-5
    [s[4], s[6], s[5], s[4], s[5], s[6], s[5], s[4]].forEach(k => notes.push({ key: k, duration: '16' }));

    // Bar 7: 7-8-7-6 | 7-8-7-6
    [s[6], s[7], s[6], s[5], s[6], s[7], s[6], s[5]].forEach(k => notes.push({ key: k, duration: '16' }));
    // Final tonic
    notes.push({ key: s[7], duration: 'w' });

    return notes;
  },
};

const GENERATOR_EXERCISES = Object.keys(EXERCISE_PATTERNS);
const ROOT_ANCHORED_EXERCISES = new Set([
  'ArpÃ¨ge avec septiÃ¨me',
  'Enclosure sur 1-3-5-7',
  'Clarke II (Single TonalitÃ©)',
  'Clarke Ã‰tude III',
]);
const FIXED_DIRECTION_EXERCISES = new Set([
  'FlexibilitÃ© - Niveau 1',
  'Clarke II (Single TonalitÃ©)',
  'Clarke Second Study',
  'Clarke Ã‰tude III',
]);
const NOTE_KEY_REGEX = /^[A-G](?:#|b)?\d(?:\/r)?$/;

const getNotesInSelectedRange = (rootNote: string, scaleType: string, theoryMode: TheoryMode, startNote: string, endNote: string) => {
  const startMidi = Math.min(noteToMidi(startNote), noteToMidi(endNote));
  const endMidi = Math.max(noteToMidi(startNote), noteToMidi(endNote));
  const rootIdx = CHROMATIC_NOTES.indexOf(normalizeNote(rootNote));
  const intervalPitchClasses = new Set(
    getIntervalsForMode(scaleType, theoryMode).map((interval) => ((interval % 12) + 12) % 12)
  );
  const notes: string[] = [];

  for (let midi = startMidi; midi <= endMidi; midi++) {
    const relativeMidi = (midi - rootIdx + 120) % 12;
    if (intervalPitchClasses.has(relativeMidi)) {
      const noteIdx = midi % 12;
      const noteOct = Math.floor(midi / 12) - 1;
      notes.push(`${CHROMATIC_NOTES[noteIdx]}${noteOct}`);
    }
  }

  return notes;
};

const getExpandedIntervals = (scaleType: string, theoryMode: TheoryMode, minimumLength = 8) => {
  const baseIntervals = [...getIntervalsForMode(scaleType, theoryMode)];
  const expanded = baseIntervals.includes(12) ? [...baseIntervals] : [...baseIntervals, 12];
  const cycle = expanded.slice(1);
  let octaveOffset = 12;

  while (expanded.length < minimumLength && cycle.length > 0) {
    cycle.forEach((interval) => {
      if (expanded.length < minimumLength) {
        expanded.push(interval + octaveOffset);
      }
    });
    octaveOffset += 12;
  }

  return expanded;
};

const getAutoRangeForRoot = (rootNote: string) => {
  const normalizedRoot = normalizeNote(rootNote);
  const rootIdx = CHROMATIC_NOTES.indexOf(normalizedRoot);
  const startOctave = rootIdx >= 0 && rootIdx <= CHROMATIC_NOTES.indexOf('F') ? 4 : 3;

  return {
    startNote: `${normalizedRoot}${startOctave}`,
    endNote: `${normalizedRoot}${startOctave + 2}`,
  };
};

const getAnchoredScaleNotes = (rootNote: string, scaleType: string, theoryMode: TheoryMode, startNote: string, endNote: string) => {
  const startMidi = Math.min(noteToMidi(startNote), noteToMidi(endNote));
  const endMidi = Math.max(noteToMidi(startNote), noteToMidi(endNote));
  const rootIdx = CHROMATIC_NOTES.indexOf(normalizeNote(rootNote));
  let rootMidi: number | null = null;

  for (let midi = startMidi; midi <= endMidi; midi++) {
    if (midi % 12 === rootIdx) {
      rootMidi = midi;
      break;
    }
  }

  if (rootMidi === null) {
    rootMidi = startMidi;
    while (rootMidi % 12 !== rootIdx) rootMidi++;
  }

  return getExpandedIntervals(scaleType, theoryMode).map((interval) => {
    const midi = rootMidi! + interval;
    const noteIdx = midi % 12;
    const noteOct = Math.floor(midi / 12) - 1;
    return `${CHROMATIC_NOTES[noteIdx]}${noteOct}`;
  });
};

const normalizeGeneratedNotes = (generated?: string[] | ExerciseNote[]): ExerciseNote[] => {
  if (!generated) return [];

  return generated
    .map((item) => typeof item === 'string' ? { key: item, duration: '8' } : item)
    .filter((item): item is ExerciseNote =>
      !!item &&
      typeof item.key === 'string' &&
      NOTE_KEY_REGEX.test(item.key) &&
      typeof item.duration === 'string'
    );
};

const appendReturnTrip = (notes: ExerciseNote[]) => {
  if (notes.length < 2) return notes;

  return [
    ...notes,
    ...notes
      .slice(0, -1)
      .reverse()
      .map((note) => ({ ...note, newLine: undefined })),
  ];
};

const REPERTOIRE_SONGS: { [key: string]: ExerciseNote[] } = {
  'Star Wars (Thème)': [
    { key: 'G4', duration: 'h' }, { key: 'D5', duration: 'h' }, { key: 'C5', duration: '8' }, { key: 'B4', duration: '8' }, { key: 'A4', duration: '8' }, { key: 'G5', duration: 'h' },
    { key: 'D5', duration: 'h' }, { key: 'C5', duration: '8' }, { key: 'B4', duration: '8' }, { key: 'A4', duration: '8' }, { key: 'G5', duration: 'h' },
    { key: 'D5', duration: 'h' }, { key: 'C5', duration: '8' }, { key: 'B4', duration: '8' }, { key: 'C5', duration: '8' }, { key: 'A4', duration: 'h' },
    { key: 'G4', duration: '8' }, { key: 'G4', duration: '8' }, { key: 'A4', duration: 'q' }, { key: 'A4', duration: 'q' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: 'h' },
    { key: 'G4', duration: '8' }, { key: 'G4', duration: '8' }, { key: 'A4', duration: 'q' }, { key: 'A4', duration: 'q' }, { key: 'F4', duration: '8' }, { key: 'E4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'D4', duration: 'h' },
  ],
  'Pirates des Caraïbes': [
    { key: 'A3', duration: '8' }, { key: 'C4', duration: '8' }, { key: 'D4', duration: 'q' }, { key: 'D4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'E4', duration: '8' },
    { key: 'F4', duration: 'q' }, { key: 'F4', duration: '8' }, { key: 'F4', duration: '8' }, { key: 'G4', duration: '8' }, { key: 'E4', duration: 'q' }, { key: 'E4', duration: '8' },
    { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' }, { key: 'D4', duration: 'h' },
    { key: 'A3', duration: '8' }, { key: 'C4', duration: '8' }, { key: 'D4', duration: 'q' }, { key: 'D4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'F4', duration: '8' },
    { key: 'G4', duration: 'q' }, { key: 'G4', duration: '8' }, { key: 'G4', duration: '8' }, { key: 'A4', duration: '8' }, { key: 'Bb4', duration: 'q' }, { key: 'Bb4', duration: '8' },
    { key: 'A4', duration: '8' }, { key: 'G4', duration: '8' }, { key: 'A4', duration: 'h' },
  ],
  'Tetris (Thème)': [
    { key: 'E4', duration: 'q' }, { key: 'B3', duration: '8' }, { key: 'C4', duration: '8' }, { key: 'D4', duration: 'q' }, { key: 'C4', duration: '8' }, { key: 'B3', duration: '8' },
    { key: 'A3', duration: 'q' }, { key: 'A3', duration: '8' }, { key: 'C4', duration: '8' }, { key: 'E4', duration: 'q' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
    { key: 'B3', duration: 'q' }, { key: 'C4', duration: '8' }, { key: 'D4', duration: 'q' }, { key: 'E4', duration: 'q' }, { key: 'C4', duration: 'q' }, { key: 'A3', duration: 'q' }, { key: 'A3', duration: 'q' },
    { key: 'D4', duration: 'q' }, { key: 'F4', duration: '8' }, { key: 'A4', duration: 'q' }, { key: 'G4', duration: '8' }, { key: 'F4', duration: '8' },
    { key: 'E4', duration: 'q' }, { key: 'C4', duration: '8' }, { key: 'E4', duration: 'q' }, { key: 'D4', duration: '8' }, { key: 'C4', duration: '8' },
    { key: 'B3', duration: 'q' }, { key: 'B3', duration: '8' }, { key: 'C4', duration: '8' }, { key: 'D4', duration: 'q' }, { key: 'E4', duration: 'q' }, { key: 'C4', duration: 'q' }, { key: 'A3', duration: 'q' }, { key: 'A3', duration: 'q' },
  ],
  'Beat It (Riff)': [
    { key: 'E3', duration: 'q' }, { key: 'G3', duration: 'q' }, { key: 'B3', duration: 'q' }, { key: 'E4', duration: 'q' }, { key: 'D4', duration: 'h' },
    { key: 'E3', duration: 'q' }, { key: 'G3', duration: 'q' }, { key: 'B3', duration: 'q' }, { key: 'E4', duration: 'q' }, { key: 'D4', duration: 'h' },
    { key: 'D4', duration: '8' }, { key: 'D4', duration: '8' }, { key: 'B3', duration: 'h' }, { key: 'A3', duration: 'h' },
    { key: 'E3', duration: 'q' }, { key: 'G3', duration: 'q' }, { key: 'B3', duration: 'q' }, { key: 'E4', duration: 'q' }, { key: 'D4', duration: 'h' },
  ],
  'When the Saints': [
    { key: 'C4', duration: 'q' }, { key: 'E4', duration: 'q' }, { key: 'F4', duration: 'q' }, { key: 'G4', duration: 'w' },
    { key: 'C4', duration: 'q' }, { key: 'E4', duration: 'q' }, { key: 'F4', duration: 'q' }, { key: 'G4', duration: 'w' },
    { key: 'C4', duration: 'q' }, { key: 'E4', duration: 'q' }, { key: 'F4', duration: 'q' }, { key: 'G4', duration: 'h' },
    { key: 'E4', duration: 'h' }, { key: 'C4', duration: 'h' }, { key: 'E4', duration: 'h' }, { key: 'D4', duration: 'w' },
    { key: 'E4', duration: 'h' }, { key: 'E4', duration: 'h' }, { key: 'D4', duration: 'h' }, { key: 'C4', duration: 'h' },
    { key: 'C4', duration: 'h' }, { key: 'E4', duration: 'h' }, { key: 'G4', duration: 'h' }, { key: 'G4', duration: 'h' }, { key: 'G4', duration: 'h' }, { key: 'F4', duration: 'w' },
  ],
  'I Just Called to Say I Love You': [
    { key: 'C#4', duration: '8' }, { key: 'C#4', duration: '8' }, { key: 'B3', duration: '16' }, { key: 'C#4', duration: 'q' }, { key: 'B3', duration: '8' },
    { key: 'A#3', duration: '8' }, { key: 'G#3', duration: '8' }, { key: 'F#3', duration: 'h' },
    { key: 'C#4', duration: '8' }, { key: 'C#4', duration: '8' }, { key: 'B3', duration: '16' }, { key: 'C#4', duration: 'q' }, { key: 'B3', duration: '8' },
    { key: 'A#3', duration: '8' }, { key: 'C#4', duration: '8' }, { key: 'B3', duration: 'h' },
  ],
  'Il Silenzio': [
    { key: 'C4', duration: 'h' }, { key: 'G4', duration: 'q' }, { key: 'C5', duration: 'w' },
    { key: 'C4', duration: 'h' }, { key: 'G4', duration: 'q' }, { key: 'C5', duration: 'w' },
    { key: 'C4', duration: 'q' }, { key: 'G4', duration: 'q' }, { key: 'C5', duration: 'h' },
    { key: 'G4', duration: 'q' }, { key: 'E4', duration: 'q' }, { key: 'C4', duration: 'w' },
  ],
  "Concerto d'Aranjuez": [
    { key: 'E4', duration: 'h' }, { key: 'F#4', duration: 'q' }, { key: 'G4', duration: 'h' },
    { key: 'F#4', duration: 'q' }, { key: 'E4', duration: 'q' }, { key: 'D4', duration: 'q' },
    { key: 'C#4', duration: 'h' }, { key: 'D4', duration: 'q' }, { key: 'E4', duration: 'w' },
  ]
};

const SONGS_EXERCISES = [...Object.keys(EXERCISE_PATTERNS), ...Object.keys(REPERTOIRE_SONGS), ...Object.keys(SOULFUL_BOP_PHRASES)];

const MIDI_FILES = [
  "Fur Elise.mid"
];

const INSTRUMENTS: { [key: string]: number } = {
  'Trompette (Sib)': -2,
  'Saxophone Alto (Mib)': -9,
  'Instrument en Do': 0,
};

const getFingeringText = (pistonString: string): string => {
  if (!pistonString) return '';
  if (pistonString === '000') return '0';
  return pistonString.split('').map((p, i) => (p === '1' ? (i + 1).toString() : '')).filter(Boolean).join('');
};

const NotationView: React.FC<{ notes: ExerciseNote[]; activeNoteIndex: number; exerciseType: string; showFingerings: boolean }> = ({ notes, activeNoteIndex, exerciseType, showFingerings }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousHighlightRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || notes.length === 0) return;
    containerRef.current.innerHTML = '';

    const VF = Vex.Flow;

    // --- 0. CONFIGURATION ---
    const isClarke = exerciseType.includes("Clarke");
    const isClarkeEtude3 = exerciseType === 'Clarke Étude III';
    // Pour l'Étude 3 (que des doubles croches), on force 2 mesures par ligne max
    const measuresPerLine = isClarkeEtude3 ? 2 : isClarke ? 5 : 2;
    // On augmente drastiquement la largeur totale pour l'Étude 3
    const totalWidth = isClarkeEtude3 ? 2400 : isClarke ? 1600 : 900;

    // 1. PRÉPARATION DES DONNÉES
    type NoteWithIndex = ExerciseNote & { originalIndex?: number };
    const measures: NoteWithIndex[][] = [];
    let currentMeasureNotes: NoteWithIndex[] = [];
    let currentMeasureBeats = 0;

    notes.forEach((note, i) => {
      const noteWithIdx = { ...note, originalIndex: i };
      const noteBeats = BEAT_VALUES[note.duration] || 0;
      if (currentMeasureBeats + noteBeats > 4.01) {
        if (currentMeasureNotes.length > 0) measures.push(currentMeasureNotes);
        currentMeasureNotes = [noteWithIdx];
        currentMeasureBeats = noteBeats;
      } else {
        currentMeasureNotes.push(noteWithIdx);
        currentMeasureBeats += noteBeats;
        if (currentMeasureBeats > 3.99) {
          measures.push(currentMeasureNotes);
          currentMeasureNotes = [];
          currentMeasureBeats = 0;
        }
      }
    });
    if (currentMeasureNotes.length > 0) {
      let remaining = 4.0 - currentMeasureBeats;
      while (remaining >= 0.24) {
        if (remaining >= 0.99) { currentMeasureNotes.push({ key: 'B4/r', duration: 'q' }); remaining -= 1.0; }
        else if (remaining >= 0.49) { currentMeasureNotes.push({ key: 'B4/r', duration: '8' }); remaining -= 0.5; }
        else { currentMeasureNotes.push({ key: 'B4/r', duration: '16' }); remaining -= 0.25; }
      }
      measures.push(currentMeasureNotes);
    }

    // 2. RENDU
    const staveHeight = 160;
    const padding = 10;
    const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
    renderer.resize(totalWidth, 10);
    const context = renderer.getContext();
    context.setFont('Arial', 10, 400);

    let currentY = padding;
    let currentX = padding;
    const standardMeasureWidth = (totalWidth - padding * 2) / measuresPerLine;
    let measuresOnLine = 0;
    const allVexFlowNotes: any[] = [];

    for (let i = 0; i < measures.length; i++) {
      const measureNotes = measures[i];
      const forceNewLine = i > 0 && measures[i - 1].some(n => n.newLine);
      if (i !== 0 && (measuresOnLine >= measuresPerLine || forceNewLine)) {
        currentX = padding; currentY += staveHeight; measuresOnLine = 0;
      }
      const stave = new VF.Stave(currentX, currentY, standardMeasureWidth);
      if (i === 0) stave.addClef('treble').addTimeSignature('4/4');
      else if (measuresOnLine === 0) stave.addClef('treble');
      stave.setContext(context).draw();

      const vexNotes = measureNotes.map((note) => {
        const noteKey = note.key; if (!noteKey) return null;
        const noteName = noteKey.replace(/[0-9]/, '');
        const octave = noteKey.match(/[0-9]/)?.[0] || '4';
        const baseNote = noteName[0]?.toLowerCase(); if (!baseNote) return null;
        const accidental = noteName.substring(1);
        const isRest = note.key.includes('/r');
        const vexNote = new VF.StaveNote({
          clef: "treble", keys: [isRest ? 'b/4' : `${baseNote}/${octave}`],
          duration: isRest ? `${note.duration}r` : note.duration, auto_stem: true
        });
        if (accidental && !isRest) vexNote.addModifier(new VF.Accidental(accidental), 0);
        if (showFingerings) {
          const fingering = isRest ? null : PISTONS[note.key];
          if (fingering) {
            vexNote.addModifier(new VF.Annotation(getFingeringText(fingering)).setFont('Arial', 8, 'bold').setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM), 0);
          }
        }
        (vexNote as any).originalIndex = note.originalIndex;
        return vexNote;
      }).filter((n): n is Vex.Flow.StaveNote => n !== null);

      allVexFlowNotes.push(...vexNotes);
      const voice = new VF.Voice({ num_beats: measureNotes.reduce((acc, n) => acc + BEAT_VALUES[n.duration], 0), beat_value: 4 }).setStrict(false).addTickables(vexNotes);
      const startX = (i === 0) ? 90 : (measuresOnLine === 0 ? 50 : 10);
      new VF.Formatter().joinVoices([voice]).format([voice], standardMeasureWidth - startX - 20);

      const beamableNotes = vexNotes.filter(vn => !vn.getDuration().includes('r') && vn.getDuration() !== 'w');
      if (beamableNotes.length >= 2) {
        const beams = VF.Beam.generateBeams(beamableNotes, { groups: [new VF.Fraction(1, 4)] });
        voice.draw(context, stave);
        beams.forEach(b => b.setContext(context).draw());
      } else { voice.draw(context, stave); }

      currentX += standardMeasureWidth;
      measuresOnLine++;
    }

    const finalHeight = currentY + staveHeight + padding;
    renderer.resize(totalWidth, finalHeight);

    // --- LA MAGIE DU RESPONSIVE ---
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      // 1. On définit la "boîte de vue" (coordonnées internes)
      svg.setAttribute('viewBox', `0 0 ${totalWidth} ${finalHeight}`);

      // 2. On retire les dimensions fixes pour laisser le CSS gérer
      svg.removeAttribute('width');
      svg.removeAttribute('height');

      // 3. Style pour s'adapter à la largeur du parent
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxWidth = '100%';
      svg.style.display = 'block';
      svg.style.backgroundColor = '#ffffff';
    }

    const domNotes = containerRef.current.querySelectorAll('.vf-stavenote');
    domNotes.forEach((el, i) => {
      const vexNoteObj = allVexFlowNotes[i];
      if (vexNoteObj && typeof vexNoteObj.originalIndex === 'number') {
        el.id = `vf-note-${vexNoteObj.originalIndex}`;
        el.querySelectorAll('*').forEach((child: any) => { child.style.transition = 'fill 0.1s ease-out'; });
      }
    });
  }, [notes, exerciseType, showFingerings]);

  // EFFECT 2: SURLIGNAGE (inchangé)
  useEffect(() => {
    if (!containerRef.current) return;
    const orange = '#fb8c00'; const black = '#000000';
    if (previousHighlightRef.current) {
      const prev = containerRef.current.querySelector(`#${previousHighlightRef.current}`);
      if (prev) prev.querySelectorAll('*').forEach((c: any) => { c.setAttribute('fill', black); c.setAttribute('stroke', black); });
    }
    const target = containerRef.current.querySelector(`#vf-note-${activeNoteIndex}`);
    if (target) {
      target.querySelectorAll('*').forEach((c: any) => { c.setAttribute('fill', orange); c.setAttribute('stroke', orange); });
      previousHighlightRef.current = `vf-note-${activeNoteIndex}`;
    }
  }, [activeNoteIndex]);

  const exerciseCategory = 'generator';
  const exerciseOptions = exerciseCategory === 'generator'
    ? GENERATOR_EXERCISES
    : exerciseCategory === 'repertoire'
      ? Object.keys(REPERTOIRE_SONGS)
      : exerciseCategory === 'bop'
        ? Object.keys(SOULFUL_BOP_PHRASES)
        : MIDI_FILES;
  const exerciseLabel = exerciseCategory === 'generator'
    ? '2. Motif / Ã‰cart'
    : exerciseCategory === 'repertoire'
      ? 'Morceau du RÃ©pertoire'
      : exerciseCategory === 'bop'
        ? 'Phrase Jazz / Bop'
        : 'Fichier MIDI';

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white shadow-sm p-4 overflow-hidden">
      <div ref={containerRef} className="w-full" />
    </div>
  );
};

const Metronome: React.FC<{ tempo: number; setTempo: (t: number) => void; isPlaying: boolean; setIsPlaying: (p: boolean) => void; }> = ({ tempo, setTempo, isPlaying, setIsPlaying }) => {
  return (
    <div className="flex items-center gap-4">
      <Button onClick={() => setIsPlaying(!isPlaying)} className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600">
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </Button>
      <input type="range" min="40" max="208" value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className="w-32" />
      <span className="text-sm">{tempo} BPM</span>
    </div>
  );
};

const TrumpetPiston: React.FC<{ pressed: boolean }> = ({ pressed }) => (
  <div className={`w-8 h-16 rounded-full border-2 ${pressed ? 'bg-blue-500 border-blue-600' : 'bg-white border-gray-300'} shadow-md`} />
);

const Note: React.FC<{ note: ExerciseNote; isActive: boolean }> = ({ note, isActive }) => {
  const fingering = PISTONS[note.key] || '000';
  const baseName = note.key.replace(/[0-9]/g, '');
  const octave = note.key.match(/[0-9]/)?.[0] || '4';
  const solfegeName = (NOTE_NAMES[baseName] || baseName) + octave;

  return (
    <div className={`flex flex-col items-center p-2 ${isActive ? 'bg-blue-100 rounded-lg' : ''}`}>
      <div className="text-lg font-bold mb-2">{solfegeName}</div>
      <div className="flex gap-2">
        {fingering.split('').map((pressed, idx) => <TrumpetPiston key={idx} pressed={pressed === '1'} />)}
      </div>
    </div>
  );
};

const ToneGenerator: React.FC<{ note: ExerciseNote; isPlaying: boolean; volume: number; selectedInstrument: string }> = ({ note, isPlaying, volume, selectedInstrument }) => {
  return null;
};

const ScalePractice: React.FC = () => {
  const initialAutoRange = getAutoRangeForRoot('C');
  const [activeTab, setActiveTab] = useState<'exercises' | 'ireal'>('exercises');
  const [rootNote, setRootNote] = useState('C');
  const [scaleType, setScaleType] = useState('Majeure');
  const [theoryMode, setTheoryMode] = useState<TheoryMode>('gamme');
  const [exerciseCategory, setExerciseCategory] = useState<'generator' | 'repertoire' | 'bop' | 'midi'>('generator');
  const [exerciseType, setExerciseType] = useState('Gamme simple');
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [tempo, setTempo] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.1);
  const [isMuted, setIsMuted] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState('Trompette (Sib)');
  const [showFingerings, setShowFingerings] = useState(true);
  const [selectedMidi, setSelectedMidi] = useState<string>('');
  const [midiNotes, setMidiNotes] = useState<ExerciseNote[]>([]);
  const [midiTranspose, setMidiTranspose] = useState(0);
  const [isMidiLoading, setIsMidiLoading] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<{ name: string, index: number }[]>([]);
  const [selectedMidiTrack, setSelectedMidiTrack] = useState(0);

  // Metronome Counters
  const [displayBeat, setDisplayBeat] = useState(1);
  const [displayMeasure, setDisplayMeasure] = useState(1);
  const beatsPerMeasure = 4;

  const [startNote, setStartNote] = useState(initialAutoRange.startNote);
  const [endNote, setEndNote] = useState(initialAutoRange.endNote);
  const [upDown, setUpDown] = useState(true);

  // Acceleration Mode State
  const [accelConfig, setAccelConfig] = useState({
    active: false,
    start: 60,
    end: 120,
    step: 5,
    interval: 2 // measures
  });
  const [isAccelDialogOpen, setIsAccelDialogOpen] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const schedulerRef = useRef<{ nextNoteTime: number; noteIndex: number } | null>(null);
  const currentOscillatorRef = useRef<OscillatorNode | null>(null);
  const currentGainRef = useRef<GainNode | null>(null);

  // 1. Les Refs pour les valeurs qui changent souvent
  const tempoRef = useRef(tempo);
  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);
  const accelConfigRef = useRef(accelConfig);
  const startNoteRef = useRef(startNote);
  const endNoteRef = useRef(endNote);
  const upDownRef = useRef(upDown);

  // 2. Synchronisation systématique des refs avec l'état UI
  useEffect(() => { tempoRef.current = tempo; }, [tempo]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { accelConfigRef.current = accelConfig; }, [accelConfig]);
  useEffect(() => { startNoteRef.current = startNote; }, [startNote]);
  useEffect(() => { endNoteRef.current = endNote; }, [endNote]);
  useEffect(() => { upDownRef.current = upDown; }, [upDown]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scalesFavorites');
      if (saved) setFavorites(JSON.parse(saved));
    }
  }, []);

  const handleRootNoteSelect = useCallback((nextRootNote: string) => {
    const autoRange = getAutoRangeForRoot(nextRootNote);
    setRootNote(nextRootNote);
    setStartNote(autoRange.startNote);
    setEndNote(autoRange.endNote);
    setUpDown(true);
  }, []);

  const handleTheoryModeSelect = useCallback((nextTheoryMode: TheoryMode) => {
    setTheoryMode(nextTheoryMode);
  }, []);

  const handleScaleTypeSelect = useCallback((nextScaleType: string) => {
    setScaleType(normalizeTheoryType(nextScaleType));
  }, []);

  const generateScale = useMemo((): ExerciseNote[] => {
    let notes: ExerciseNote[];

    const isRepertoire = !!REPERTOIRE_SONGS[exerciseType] || !!SOULFUL_BOP_PHRASES[exerciseType] || exerciseType === 'Fichier MIDI';

    if (!isRepertoire) {
      const baseNotes = getNotesInSelectedRange(rootNote, scaleType, theoryMode, startNote, endNote);
      let sequence: string[] = [];
      let generatedNotes: ExerciseNote[] | null = null;
      if (exerciseType === 'Gamme simple') {
        sequence = baseNotes;
      } else if (exerciseType === 'Tierces') {
        for (let i = 0; i < baseNotes.length - 2; i++) {
          sequence.push(baseNotes[i], baseNotes[i + 2]);
        }
      } else if (exerciseType === 'Quartes') {
        for (let i = 0; i < baseNotes.length - 3; i++) {
          sequence.push(baseNotes[i], baseNotes[i + 3]);
        }
      } else if (exerciseType === 'Quintes') {
        for (let i = 0; i < baseNotes.length - 4; i++) {
          sequence.push(baseNotes[i], baseNotes[i + 4]);
        }
      } else if (exerciseType === 'Arpège') {
        // Here we can either use the first 4 notes or repeat the arpeggio pattern
        // Given the simplified request, let's just use the filtered baseNotes
        sequence = baseNotes;
      } else {
        const sourceNotes = ROOT_ANCHORED_EXERCISES.has(exerciseType)
          ? getAnchoredScaleNotes(rootNote, scaleType, theoryMode, startNote, endNote)
          : baseNotes;
        const generated = normalizeGeneratedNotes(EXERCISE_PATTERNS[exerciseType]?.(sourceNotes));
        generatedNotes = generated.length > 0 ? generated : [{ key: 'C4', duration: 'w' }];
      }

      if (generatedNotes) {
        notes = upDown && !FIXED_DIRECTION_EXERCISES.has(exerciseType)
          ? appendReturnTrip(generatedNotes)
          : generatedNotes;
      } else {
        if (upDown) {
          const reverse = [...sequence].reverse().slice(1);
          sequence = sequence.concat(reverse);
        }

        notes = sequence.length > 0 ? sequence.map(key => ({ key, duration: '8' })) : [{ key: 'C4', duration: 'w' }];
      }
    } else if (exerciseType === 'Fichier MIDI' && midiNotes.length > 0) {
      notes = midiNotes.map(n => {
        const octave = parseInt(n.key.match(/\d+/)?.[0] || '4', 10);
        const noteName = n.key.replace(/\d+/, '');
        const CHROMATIC_MAP: { [key: string]: number } = {
          'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };
        const noteIndex = CHROMATIC_MAP[noteName] ?? 0;
        const transposedIndex = (noteIndex + midiTranspose + 120) % 12;
        const octaveShift = Math.floor((noteIndex + midiTranspose) / 12);
        return {
          key: `${CHROMATIC_NOTES[transposedIndex]}${octave + octaveShift}`,
          duration: n.duration
        };
      });
    } else if (REPERTOIRE_SONGS[exerciseType]) {
      notes = [...REPERTOIRE_SONGS[exerciseType]];
    } else if (SOULFUL_BOP_PHRASES[exerciseType]) {
      notes = [...SOULFUL_BOP_PHRASES[exerciseType]];
    } else {
      // Fallback if needed, though most logic is now handled by the isRepertoire block above
      notes = [{ key: 'C4', duration: 'w' }];
    }

    // --- PAD : compléter la dernière mesure avec des silences ---
    // Cela garantit que l'audio attend les pauses visibles dans VexFlow
    const totalBeats = notes.reduce((sum, n) => sum + (BEAT_VALUES[n.duration] || 0), 0);
    let remaining = (Math.ceil(totalBeats / 4) * 4) - totalBeats;
    if (remaining >= 0.24) {
      const padded = [...notes];
      while (remaining >= 0.24) {
        if (remaining >= 3.99) { padded.push({ key: 'B4/r', duration: 'w' }); remaining -= 4; }
        else if (remaining >= 1.99) { padded.push({ key: 'B4/r', duration: 'h' }); remaining -= 2; }
        else if (remaining >= 0.99) { padded.push({ key: 'B4/r', duration: 'q' }); remaining -= 1; }
        else if (remaining >= 0.49) { padded.push({ key: 'B4/r', duration: '8' }); remaining -= 0.5; }
        else { padded.push({ key: 'B4/r', duration: '16' }); remaining -= 0.25; }
      }
      return padded;
    }
    return notes;
  }, [rootNote, scaleType, theoryMode, startNote, endNote, upDown, exerciseType, midiNotes, midiTranspose]);

  const noteToFrequency = useCallback((noteKey: string): number => {
    if (noteKey.includes('/r')) return 0;
    const A4 = 440;
    const noteNames: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    const cleanKey = noteKey.replace('/r', '');
    const octave = parseInt(cleanKey.match(/\d+/)?.[0] || '4', 10);
    const noteName = cleanKey.replace(/\d+/, '');
    const semitonesFromA4 = noteNames[noteName] - noteNames['A'] + (octave - 4) * 12;
    const transposedSemitones = semitonesFromA4 + (INSTRUMENTS[selectedInstrument] || 0);
    return A4 * Math.pow(2, transposedSemitones / 12);
  }, [selectedInstrument]);

  // --- LOGIQUE DE STOP (RESET) ---
  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setActiveNoteIndex(0);
    setDisplayBeat(1);
    setDisplayMeasure(1);

    // Si le testeur de vitesse est activé, on remet le tempo à la valeur de départ
    if (accelConfigRef.current.active) {
      setTempo(accelConfigRef.current.start);
    }

    // On réinitialise l'index dans le scheduler
    if (schedulerRef.current) {
      schedulerRef.current.noteIndex = 0;
    }

    // On coupe le son immédiatement
    if (currentOscillatorRef.current) {
      try {
        currentOscillatorRef.current.stop();
      } catch (e) { }
      currentOscillatorRef.current = null;
    }
  }, []);

  useEffect(() => {
    handleStop();
  }, [exerciseType, rootNote, scaleType, theoryMode, startNote, endNote, upDown, handleStop]);

  // --- PLAY / PAUSE TOGGLE (Gestion AudioContext) ---
  const togglePlay = useCallback(async () => {
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    setIsPlaying(prev => !prev);
  }, []);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore text inputs so we don't accidentally trigger playback when searching
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;

      if (e.code === 'Space') {
        e.preventDefault(); // Empêche le scroll
        togglePlay();
      } else if (e.key === '+' || e.code === 'NumpadAdd') {
        setTempo(t => Math.min(208, t + 5));
      } else if (e.key === '-' || e.code === 'NumpadSubtract') {
        setTempo(t => Math.max(40, t - 5));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  const playNote = useCallback((note: ExerciseNote, startTime: number, duration: number, currentVol: number) => {
    if (!audioContextRef.current || isMutedRef.current) return;

    const freq = noteToFrequency(note.key);
    if (freq === 0) return;

    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(currentVol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);

    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
    currentOscillatorRef.current = osc;
  }, [noteToFrequency]);
  // --- SCHEDULER (PLAY / PAUSE) ---
  useEffect(() => {
    if (isPlaying) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // RESUME : Si on reprend après une pause, on ajuste le temps
      if (!schedulerRef.current) {
        schedulerRef.current = { nextNoteTime: audioContextRef.current.currentTime + 0.1, noteIndex: 0 };
      } else {
        schedulerRef.current.nextNoteTime = audioContextRef.current.currentTime + 0.1;
      }

      let totalBeatsInMeasure = 0;
      let currentMeasure = 1;
      const scheduleAheadTime = 0.1;

      const intervalId = setInterval(() => {
        if (!audioContextRef.current || !schedulerRef.current) return;

        while (schedulerRef.current.nextNoteTime < audioContextRef.current.currentTime + scheduleAheadTime) {
          const currentScale = generateScale;
          if (!currentScale || currentScale.length === 0) break;

          const idx = schedulerRef.current.noteIndex;
          const note = currentScale[idx];
          if (!note) { schedulerRef.current.noteIndex = 0; break; }

          const startTime = schedulerRef.current.nextNoteTime;
          const secondsPerBeat = 60.0 / tempoRef.current;
          const beatDuration = BEAT_VALUES[note.duration] || 1;
          const noteDurationSeconds = beatDuration * secondsPerBeat;

          playNote(note, startTime, noteDurationSeconds, volumeRef.current);

          // Update visuelle
          const currentB = Math.floor(totalBeatsInMeasure) + 1;
          const currentM = currentMeasure;
          const delay = (startTime - audioContextRef.current.currentTime) * 1000;

          setTimeout(() => {
            setActiveNoteIndex(idx);
            setDisplayBeat(currentB);
            setDisplayMeasure(currentM);
          }, Math.max(0, delay));

          totalBeatsInMeasure += beatDuration;
          if (totalBeatsInMeasure >= 3.99) {
            totalBeatsInMeasure = 0;
            currentMeasure++;

            // --- ACCELERATION LOGIC ---
            const ac = accelConfigRef.current;
            const intervalMeasures = Math.max(1, Math.trunc(ac.interval || 1));
            const stepAmount = Math.max(1, Math.trunc(ac.step || 1));
            if (ac.active && (currentMeasure - 1) % intervalMeasures === 0) {
              const newTempo = Math.min(ac.end, tempoRef.current + stepAmount);
              if (newTempo !== tempoRef.current) {
                // Update Ref immediately for audio
                tempoRef.current = newTempo;
                // Schedule UI update (this won't re-trigger audio reset thanks to our previous refactor)
                setTimeout(() => setTempo(newTempo), 0);
              }
            }
          }

          schedulerRef.current.nextNoteTime += noteDurationSeconds;
          schedulerRef.current.noteIndex = (idx + 1) % currentScale.length;
        }
      }, 25);

      return () => clearInterval(intervalId);
    } else {
      // PAUSE : On coupe juste le son, on ne touche pas au schedulerRef
      if (currentOscillatorRef.current) {
        try { currentOscillatorRef.current.stop(); } catch (e) { }
        currentOscillatorRef.current = null;
      }
    }
  }, [isPlaying, generateScale, playNote]);

  const saveFavorite = () => {
    const favorite = {
      rootNote,
      scaleType,
      theoryMode,
      exerciseCategory,
      exerciseType,
      tempo,
      volume,
      startNote,
      endNote,
      upDown,
      timestamp: Date.now()
    };
    const newFavorites = [favorite, ...favorites].slice(0, 10);
    setFavorites(newFavorites);
    localStorage.setItem('scalePractice_favorites', JSON.stringify(newFavorites));
  };

  const loadFavorite = (fav: Favorite) => {
    if (!fav) return;
    const normalizedScaleType = normalizeTheoryType(fav.scaleType);
    const favoriteTheoryMode = fav.theoryMode || getLegacyTheoryModeForScaleType(normalizedScaleType);
    setRootNote(fav.rootNote);
    setScaleType(normalizedScaleType);
    setTheoryMode(favoriteTheoryMode);
    setExerciseCategory(fav.exerciseCategory || 'generator');
    setExerciseType(fav.exerciseType);
    setTempo(fav.tempo);
    setVolume(fav.volume);
    if (fav.startNote) setStartNote(fav.startNote);
    if (fav.endNote) setEndNote(fav.endNote);
    if (fav.upDown !== undefined) setUpDown(fav.upDown);
    setIsPlaying(false);
    setActiveNoteIndex(0);

    if (fav.exerciseCategory === 'midi') {
      loadMidiFile(fav.exerciseType);
    }
  };

  const loadMidiFile = async (filename: string, trackIndex: number = -1) => {
    setIsMidiLoading(true);
    setIsPlaying(false);
    setActiveNoteIndex(0);
    try {
      const response = await fetch(`/midi/${filename}`);
      const arrayBuffer = await response.arrayBuffer();
      const midi = new Midi(arrayBuffer);

      const tracksWithNotes = midi.tracks.filter(t => t.notes.length > 0);
      setAvailableTracks(tracksWithNotes.map((t, i) => ({ name: t.name || `Piste ${i + 1}`, index: i })));

      let melodyTrack;
      if (trackIndex >= 0 && midi.tracks[trackIndex]) {
        melodyTrack = midi.tracks[trackIndex];
      } else {
        // Better heuristic for melody: highest average pitch and healthy number of notes
        melodyTrack = tracksWithNotes
          .filter(t => !t.name.toLowerCase().includes('bass') && !t.name.toLowerCase().includes('drum') && !t.name.toLowerCase().includes('percussion'))
          .reduce((prev, current) => {
            const avgPrev = prev.notes.length > 0 ? prev.notes.reduce((sum, n) => sum + n.midi, 0) / prev.notes.length : 0;
            const avgCurr = current.notes.length > 0 ? current.notes.reduce((sum, n) => sum + n.midi, 0) / current.notes.length : 0;
            // Prioritize tracks with more notes and higher average pitch
            if (current.notes.length > prev.notes.length * 0.5 && avgCurr > avgPrev) {
              return current;
            }
            return prev;
          }, tracksWithNotes[0]);
      }

      if (melodyTrack) {
        setSelectedMidiTrack(midi.tracks.indexOf(melodyTrack));
        const notes: ExerciseNote[] = melodyTrack.notes.map(n => {
          const dur = n.duration;
          let duration = 'q';
          if (dur >= 1.5) duration = 'w';
          else if (dur >= 0.75) duration = 'h';
          else if (dur >= 0.375) duration = 'q';
          else if (dur >= 0.1875) duration = '8';
          else duration = '16';

          return { key: n.name, duration };
        });
        setMidiNotes(notes.slice(0, 100)); // Limit for performance
        setSelectedMidi(filename);
        setExerciseType('Fichier MIDI');
      } else {
        setMidiNotes([]);
        setAvailableTracks([]);
        setSelectedMidi('');
        setExerciseType('Gamme simple'); // Fallback
        console.warn("No suitable melody track found in MIDI file.");
      }
    } catch (error) {
      console.error("Error loading MIDI:", error);
      setMidiNotes([]);
      setAvailableTracks([]);
      setSelectedMidi('');
      setExerciseType('Gamme simple'); // Fallback
    } finally {
      setIsMidiLoading(false);
    }
  };

  const isExerciseDisabled = exerciseType === 'Flexibilité - Niveau 1' || !!REPERTOIRE_SONGS[exerciseType] || !!SOULFUL_BOP_PHRASES[exerciseType] || exerciseType === 'Fichier MIDI';

  const exerciseOptions = exerciseCategory === 'generator'
    ? GENERATOR_EXERCISES
    : exerciseCategory === 'repertoire'
      ? Object.keys(REPERTOIRE_SONGS)
      : exerciseCategory === 'bop'
        ? Object.keys(SOULFUL_BOP_PHRASES)
        : MIDI_FILES;
  const exerciseLabel = exerciseCategory === 'generator'
    ? '2. Motif / Ã‰cart'
    : exerciseCategory === 'repertoire'
      ? 'Morceau du RÃ©pertoire'
      : exerciseCategory === 'bop'
        ? 'Phrase Jazz / Bop'
        : 'Fichier MIDI';

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-1">
          <h1
            className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500"
          >
            Logiciel d&apos;Entraînement Trompette
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Assistant Pratique Virtuel</p>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('exercises')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
              activeTab === 'exercises'
                ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <Music2 className="w-4 h-4" />
            Exercices
          </button>
          <button
            onClick={() => setActiveTab('ireal')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
              activeTab === 'ireal'
                ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <BookOpen className="w-4 h-4" />
            iReal Pro
          </button>
        </div>

        {activeTab === 'ireal' ? (
          <Card className="bg-white border-slate-200 shadow-xl overflow-hidden rounded-2xl relative">
            <CardContent className="p-6 md:p-8">
              <IrealChordViewer />
            </CardContent>
          </Card>
        ) : (
        <>
          <Card className="bg-white border-slate-200 shadow-xl overflow-hidden rounded-2xl relative">
            <CardContent className="p-6 md:p-8">
              {/* Category selector */}
              <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                {[
                  { id: 'generator', label: 'Générateur', icon: Zap },
                  { id: 'repertoire', label: 'Répertoire', icon: Music2 },
                  { id: 'bop', label: 'Phrases Bop', icon: Rocket },
                  { id: 'midi', label: 'MIDI', icon: FileMusic }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setExerciseCategory(cat.id as any);
                      // Reset exercise type to first available in category
                      if (cat.id === 'generator') setExerciseType('Gamme simple');
                      else if (cat.id === 'repertoire') setExerciseType(Object.keys(REPERTOIRE_SONGS)[0]);
                      else if (cat.id === 'bop') setExerciseType(Object.keys(SOULFUL_BOP_PHRASES)[0]);
                      else if (cat.id === 'midi') setExerciseType('Fichier MIDI');
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      exerciseCategory === cat.id
                        ? "bg-slate-800 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-600 hover:bg-white"
                    )}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>

              <ScrollArea className="w-full">
                <div className="flex min-w-max gap-3 pb-4">
                  {false && <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        size="lg"
                        className={cn(
                          "h-14 min-w-[88px] rounded-2xl flex flex-col gap-1 shadow-md transition-all active:scale-95 text-white border-none",
                          isPlaying ? "bg-amber-500 hover:bg-amber-600" : "bg-orange-600 hover:bg-orange-700"
                        )}
                        onClick={togglePlay}
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {isPlaying ? 'Pause' : 'Play'}
                        </span>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-14 min-w-[72px] rounded-2xl border-slate-200 flex flex-col gap-1 hover:bg-white transition-all active:scale-95"
                        onClick={handleStop}
                      >
                        <div className="w-4 h-4 bg-current rounded-sm" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Stop</span>
                      </Button>
                    </div>

                    <div className="w-[220px] space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-end gap-1">
                          <span className="text-3xl font-mono font-black text-slate-900 leading-none">{tempo}</span>
                          <span className="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest">BPM</span>
                        </div>
                        <Dialog open={isAccelDialogOpen} onOpenChange={setIsAccelDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-8 px-2.5 text-[9px] font-bold uppercase tracking-widest border border-slate-200 rounded-xl",
                                accelConfig.active ? "bg-orange-100 text-orange-700 border-orange-200" : "text-slate-500"
                              )}
                            >
                              <Rocket className="w-3 h-3 mr-1" />
                              {accelConfig.active ? "ActivÃ©" : "AccÃ©lÃ©rer"}
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="sm:max-w-[420px] rounded-[2rem] border-0 shadow-2xl p-6 bg-white">
                             <DialogHeader>
                               <DialogTitle className="text-xl font-black flex items-center gap-3 text-slate-800">
                                 <Rocket className="w-5 h-5 text-orange-500" />
                                 Testeur de Vitesse
                               </DialogTitle>
                             </DialogHeader>
                             <div className="space-y-6 pt-4">
                               <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                   <Label className="text-[9px] uppercase font-black text-slate-400 ml-1">DÃ©part</Label>
                                   <Input type="number" value={accelConfig.start} onChange={(e) => setAccelConfig(prev => ({ ...prev, start: Number(e.target.value) }))} className="h-12 text-xl font-black rounded-xl" />
                                 </div>
                                 <div className="space-y-2">
                                   <Label className="text-[9px] uppercase font-black text-slate-400 ml-1">Objectif</Label>
                                   <Input type="number" value={accelConfig.end} onChange={(e) => setAccelConfig(prev => ({ ...prev, end: Number(e.target.value) }))} className="h-12 text-xl font-black rounded-xl" />
                                 </div>
                                 <div className="space-y-2">
                                   <Label className="text-[9px] uppercase font-black text-slate-400 ml-1">Pas</Label>
                                   <Input type="number" value={accelConfig.step} min={1} onChange={(e) => setAccelConfig(prev => ({ ...prev, step: Math.max(1, Number(e.target.value) || 1) }))} className="h-12 text-xl font-black rounded-xl" />
                                 </div>
                                 <div className="space-y-2">
                                   <Label className="text-[9px] uppercase font-black text-slate-400 ml-1">Mesures</Label>
                                   <Input type="number" value={accelConfig.interval} min={1} onChange={(e) => setAccelConfig(prev => ({ ...prev, interval: Math.max(1, Number(e.target.value) || 1) }))} className="h-12 text-xl font-black rounded-xl" />
                                 </div>
                               </div>
                               <p className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 text-sm font-medium text-orange-700">
                                 +{accelConfig.step} BPM toutes les {accelConfig.interval} mesure{accelConfig.interval > 1 ? 's' : ''}, de {accelConfig.start} à {accelConfig.end} BPM.
                               </p>
                               <Button
                                 onClick={() => {
                                   setAccelConfig(prev => ({ ...prev, active: !prev.active }));
                                   setIsAccelDialogOpen(false);
                                  if (!accelConfig.active) setTempo(accelConfig.start);
                                }}
                                className="w-full h-14 rounded-xl font-black text-lg bg-orange-600 hover:bg-orange-700"
                              >
                                {accelConfig.active ? "DÃ©sactiver" : "Activer l'accÃ©lÃ©ration"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Slider value={[tempo]} min={40} max={208} onValueChange={(vals) => setTempo(vals[0])} />
                    </div>

                    <div className="w-[180px] space-y-2">
                      <div className="flex items-center justify-between text-slate-500">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Volume</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold">{Math.round(volume * 200)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Slider value={[volume]} max={0.5} step={0.01} onValueChange={(vals) => setVolume(vals[0])} className="flex-1" />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-orange-600 rounded-xl border border-slate-200 bg-white"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>}

                  {exerciseCategory === 'generator' && (
                    <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                      <div className="space-y-2 w-[148px]">
                        <Label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em]">1. Mode</Label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { value: 'gamme' as const, label: 'Gamme' },
                            { value: 'accord' as const, label: 'Accord' }
                          ].map(option => (
                            <button
                              key={option.value}
                              onClick={() => handleTheoryModeSelect(option.value)}
                              className={cn(
                                "h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                theoryMode === option.value
                                  ? "bg-slate-800 text-white border-slate-700 shadow-sm"
                                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 w-[220px]">
                        <Label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em]">Type</Label>
                        <Select value={scaleType} onValueChange={handleScaleTypeSelect}>
                          <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-[11px] font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[120]" side="bottom" sideOffset={6} avoidCollisions={false}>
                            {UNIFIED_THEORY_TYPE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>{getTheoryTypeLabel(option)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm w-[320px]">
                    <Label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em]">{exerciseLabel}</Label>
                    <Select
                      value={exerciseCategory === 'midi' ? selectedMidi : exerciseType}
                      onValueChange={(value) => {
                        if (exerciseCategory === 'midi') {
                          setExerciseType(value);
                          loadMidiFile(value);
                          return;
                        }
                        setExerciseType(value);
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-[11px] font-semibold">
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent className="z-[120]" side="bottom" sideOffset={6} avoidCollisions={false}>
                        {exerciseOptions.map((option: string) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {exerciseCategory === 'generator' && (
                    <>
                      {false && <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm w-[160px]">
                        <Label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em]">3. TonalitÃ©</Label>
                        {false && <Select value={rootNote} onValueChange={handleRootNoteSelect}>
                          <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-[11px] font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[120]">
                            {CHROMATIC_NOTES.map((option) => (
                              <SelectItem key={option} value={option}>{NOTE_NAMES[option] || option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>}
                      </div>}

                      <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm w-[170px]">
                        <Label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em]">4. Plage : DÃ©but</Label>
                        <Select value={startNote} onValueChange={setStartNote}>
                          <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-[11px] font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[120]" side="bottom" sideOffset={6} avoidCollisions={false}>
                            {RANGE_NOTE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>{formatRangeNoteLabel(option)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm w-[170px]">
                        <Label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em]">5. Plage : Fin</Label>
                        <Select value={endNote} onValueChange={setEndNote}>
                          <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-[11px] font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[120]" side="bottom" sideOffset={6} avoidCollisions={false}>
                            {RANGE_NOTE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>{formatRangeNoteLabel(option)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {false && <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                    {exerciseCategory === 'generator' && (
                      <div className="space-y-2 w-[150px]">
                        <Label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em]">Aller-Retour</Label>
                        <button
                          onClick={() => setUpDown(!upDown)}
                          className={cn(
                            "w-full h-10 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm border-2",
                            upDown
                              ? "bg-orange-600 text-white border-orange-400"
                              : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          {upDown ? "ON" : "OFF"}
                        </button>
                      </div>
                    )}

                    <div className="space-y-2 w-[170px]">
                      <Label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em]">Favori</Label>
                      <Button
                        onClick={saveFavorite}
                        variant="outline"
                        className="w-full h-10 border-orange-200 bg-white text-orange-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-orange-50 transition-all active:scale-95"
                      >
                        <Save className="w-3.5 h-3.5 mr-2" />
                        Sauvegarder
                      </Button>
                    </div>

                    <div className="bg-slate-900 rounded-xl px-4 py-2 border border-slate-800 shadow-sm flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-slate-500 uppercase">Temps</span>
                        <span className="text-lg font-mono text-orange-500 leading-none">{isPlaying ? displayBeat : "-"}</span>
                      </div>
                      <div className="w-px h-6 bg-slate-800" />
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-slate-500 uppercase">Mesure</span>
                        <span className="text-lg font-mono text-orange-500 leading-none">{isPlaying ? displayMeasure : "-"}</span>
                      </div>
                    </div>
                  </div>}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              {exerciseCategory === 'generator' && (
                <div className="mt-1 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[420px] flex-1 space-y-2">
                      <Label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em]">3. Tonalite</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {CHROMATIC_NOTES.map((noteOption) => (
                          <button
                            key={noteOption}
                            onClick={() => handleRootNoteSelect(noteOption)}
                            className={cn(
                              "h-9 min-w-[54px] rounded-xl px-2 text-[10px] font-black uppercase transition-all border",
                              rootNote === noteOption
                                ? "bg-slate-800 text-white border-slate-700 shadow-sm"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            {NOTE_NAMES[noteOption] || noteOption}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          size="lg"
                          className={cn(
                            "h-12 min-w-[78px] rounded-2xl flex flex-col gap-1 shadow-md transition-all active:scale-95 text-white border-none",
                            isPlaying ? "bg-amber-500 hover:bg-amber-600" : "bg-orange-600 hover:bg-orange-700"
                          )}
                          onClick={togglePlay}
                        >
                          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          <span className="text-[8px] font-black uppercase tracking-widest">{isPlaying ? 'Pause' : 'Play'}</span>
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="h-12 min-w-[64px] rounded-2xl border-slate-200 flex flex-col gap-1 hover:bg-slate-50 transition-all active:scale-95"
                          onClick={handleStop}
                        >
                          <div className="w-3.5 h-3.5 bg-current rounded-sm" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Stop</span>
                        </Button>
                      </div>

                      <div className="w-[180px] space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-end gap-1">
                            <span className="text-2xl font-mono font-black text-slate-900 leading-none">{tempo}</span>
                            <span className="text-[8px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest">BPM</span>
                          </div>
                          <Dialog open={isAccelDialogOpen} onOpenChange={setIsAccelDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-7 px-2 text-[8px] font-bold uppercase tracking-widest border border-slate-200 rounded-xl",
                                  accelConfig.active ? "bg-orange-100 text-orange-700 border-orange-200" : "text-slate-500"
                                )}
                              >
                                <Rocket className="w-3 h-3 mr-1" />
                                {accelConfig.active ? "Active" : "Accel"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[420px] rounded-[2rem] border-0 shadow-2xl p-6 bg-white">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-black flex items-center gap-3 text-slate-800">
                                  <Rocket className="w-5 h-5 text-orange-500" />
                                  Testeur de Vitesse
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-[9px] uppercase font-black text-slate-400 ml-1">Depart</Label>
                                    <Input type="number" value={accelConfig.start} onChange={(e) => setAccelConfig(prev => ({ ...prev, start: Number(e.target.value) }))} className="h-12 text-xl font-black rounded-xl" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-[9px] uppercase font-black text-slate-400 ml-1">Objectif</Label>
                                    <Input type="number" value={accelConfig.end} onChange={(e) => setAccelConfig(prev => ({ ...prev, end: Number(e.target.value) }))} className="h-12 text-xl font-black rounded-xl" />
                                  </div>
                                </div>
                                <Button
                                  onClick={() => {
                                    setAccelConfig(prev => ({ ...prev, active: !prev.active }));
                                    setIsAccelDialogOpen(false);
                                    if (!accelConfig.active) setTempo(accelConfig.start);
                                  }}
                                  className="w-full h-14 rounded-xl font-black text-lg bg-orange-600 hover:bg-orange-700"
                                >
                                  {accelConfig.active ? "Desactiver" : "Activer l'acceleration"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <Slider value={[tempo]} min={40} max={208} onValueChange={(vals) => setTempo(vals[0])} />
                      </div>

                      <div className="w-[160px] space-y-2">
                        <div className="flex items-center justify-between text-slate-500">
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-bold uppercase tracking-widest">Volume</span>
                          </div>
                          <span className="text-[8px] font-mono font-bold">{Math.round(volume * 200)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Slider value={[volume]} max={0.5} step={0.01} onValueChange={(vals) => setVolume(vals[0])} className="flex-1" />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 hover:text-orange-600 rounded-xl border border-slate-200 bg-white"
                            onClick={() => setIsMuted(!isMuted)}
                          >
                            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                      <div className="space-y-2 w-[130px]">
                        <Label className="text-[8px] font-black text-orange-600 uppercase tracking-[0.2em]">Aller-Retour</Label>
                        <button
                          onClick={() => setUpDown(!upDown)}
                          className={cn(
                            "w-full h-10 rounded-xl text-[9px] font-black uppercase transition-all shadow-sm border-2",
                            upDown
                              ? "bg-orange-600 text-white border-orange-400"
                              : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          {upDown ? "ON" : "OFF"}
                        </button>
                      </div>

                      <div className="space-y-2 w-[150px]">
                        <Label className="text-[8px] font-black text-orange-600 uppercase tracking-[0.2em]">Favori</Label>
                        <Button
                          onClick={saveFavorite}
                          variant="outline"
                          className="w-full h-10 border-orange-200 bg-white text-orange-600 font-bold text-[9px] uppercase tracking-widest rounded-xl hover:bg-orange-50 transition-all active:scale-95"
                        >
                          <Save className="w-3.5 h-3.5 mr-2" />
                          Sauvegarder
                        </Button>
                      </div>

                      <div className="bg-slate-900 rounded-xl px-4 py-2 border border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] text-slate-500 uppercase">Temps</span>
                          <span className="text-lg font-mono text-orange-500 leading-none">{isPlaying ? displayBeat : "-"}</span>
                        </div>
                        <div className="w-px h-6 bg-slate-800" />
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] text-slate-500 uppercase">Mesure</span>
                          <span className="text-lg font-mono text-orange-500 leading-none">{isPlaying ? displayMeasure : "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {false && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                
                {/* 1. Metronome / Left (Col-span-4) */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Button
                        size="lg"
                        className={cn(
                          "flex-1 h-20 rounded-2xl flex flex-col gap-1 shadow-lg transition-all active:scale-95 text-white border-none",
                          isPlaying ? "bg-amber-500 hover:bg-amber-600 ring-4 ring-amber-100" : "bg-orange-600 hover:bg-orange-700 ring-4 ring-orange-100"
                        )}
                        onClick={togglePlay}
                      >
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {isPlaying ? 'PAUSE' : 'PLAY'}
                        </span>
                      </Button>

                      <Button
                        size="lg"
                        variant="outline"
                        className="w-20 h-20 rounded-2xl border-2 border-slate-200 flex flex-col gap-1 hover:bg-slate-50 transition-all active:scale-95"
                        onClick={handleStop}
                      >
                        <div className="w-6 h-6 bg-current rounded-sm" />
                        <span className="text-[10px] font-black uppercase tracking-widest">STOP</span>
                      </Button>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-end justify-between">
                        <div className="flex items-end gap-1">
                          <span className="text-4xl font-mono font-black text-slate-900 tracking-tighter leading-none">{tempo}</span>
                          <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">BPM</span>
                        </div>

                        <Dialog open={isAccelDialogOpen} onOpenChange={setIsAccelDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-6 px-2 text-[10px] font-bold uppercase tracking-widest border border-slate-200",
                                accelConfig.active ? "bg-orange-100 text-orange-700 border-orange-200" : "text-slate-400"
                              )}
                            >
                              <Rocket className="w-3 h-3 mr-1" />
                              {accelConfig.active ? "Activé" : "Accélérer"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[420px] rounded-[2rem] border-0 shadow-2xl p-6 bg-white">
                             <DialogHeader>
                               <DialogTitle className="text-xl font-black flex items-center gap-3 text-slate-800">
                                 <Rocket className="w-5 h-5 text-orange-500" />
                                 Testeur de Vitesse
                               </DialogTitle>
                             </DialogHeader>
                             <div className="space-y-6 pt-4">
                               <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                   <Label className="text-[9px] uppercase font-black text-slate-400 ml-1">Départ</Label>
                                   <Input type="number" value={accelConfig.start} onChange={(e) => setAccelConfig(prev => ({ ...prev, start: Number(e.target.value) }))} className="h-12 text-xl font-black rounded-xl" />
                                 </div>
                                 <div className="space-y-2">
                                   <Label className="text-[9px] uppercase font-black text-slate-400 ml-1">Objectif</Label>
                                   <Input type="number" value={accelConfig.end} onChange={(e) => setAccelConfig(prev => ({ ...prev, end: Number(e.target.value) }))} className="h-12 text-xl font-black rounded-xl" />
                                 </div>
                                 <div className="space-y-2">
                                   <Label className="text-[9px] uppercase font-black text-slate-400 ml-1">Pas</Label>
                                   <Input type="number" value={accelConfig.step} min={1} onChange={(e) => setAccelConfig(prev => ({ ...prev, step: Math.max(1, Number(e.target.value) || 1) }))} className="h-12 text-xl font-black rounded-xl" />
                                 </div>
                                 <div className="space-y-2">
                                   <Label className="text-[9px] uppercase font-black text-slate-400 ml-1">Mesures</Label>
                                   <Input type="number" value={accelConfig.interval} min={1} onChange={(e) => setAccelConfig(prev => ({ ...prev, interval: Math.max(1, Number(e.target.value) || 1) }))} className="h-12 text-xl font-black rounded-xl" />
                                 </div>
                               </div>
                               <p className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 text-sm font-medium text-orange-700">
                                 +{accelConfig.step} BPM toutes les {accelConfig.interval} mesure{accelConfig.interval > 1 ? 's' : ''}, de {accelConfig.start} à {accelConfig.end} BPM.
                               </p>
                               <Button
                                 onClick={() => {
                                   setAccelConfig(prev => ({ ...prev, active: !prev.active }));
                                   setIsAccelDialogOpen(false);
                                   if (!accelConfig.active) setTempo(accelConfig.start);
                                 }}
                                 className="w-full h-14 rounded-xl font-black text-lg bg-orange-600 hover:bg-orange-700"
                               >
                                 {accelConfig.active ? "Désactiver" : "Activer l'accélération"}
                               </Button>
                             </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Slider value={[tempo]} min={40} max={208} onValueChange={(vals) => setTempo(vals[0])} />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-slate-500">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Volume</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold">{Math.round(volume * 200)}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider value={[volume]} max={0.5} step={0.01} onValueChange={(vals) => setVolume(vals[0])} className="flex-1" />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-400 hover:text-orange-600 rounded-lg border border-slate-100"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 2. Middle (Col-span-5) - Selections */}
                <div className="lg:col-span-5 space-y-6 lg:border-l border-slate-100 lg:pl-10">
                  {exerciseCategory === 'generator' && (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] ml-1">1. Type d&apos;Arpège / Gamme</Label>
                      <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                        {[
                          { value: 'gamme' as const, label: 'Gamme' },
                          { value: 'accord' as const, label: 'Accord' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => handleTheoryModeSelect(option.value)}
                            className={cn(
                              "flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                              theoryMode === option.value
                                ? "bg-slate-800 text-white border-slate-700 shadow-md"
                                : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {UNIFIED_THEORY_TYPE_OPTIONS.map(t => (
                          <button
                            key={t}
                            onClick={() => handleScaleTypeSelect(t)}
                            className={cn(
                              "py-2 px-2 rounded-xl text-[10px] font-bold transition-all border shadow-sm text-left overflow-hidden",
                              scaleType === t ? "bg-orange-500 text-white border-orange-400" : "bg-white text-slate-500 border-slate-100"
                            )}
                          >
                            {getTheoryTypeLabel(t)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] ml-1">
                      {exerciseCategory === 'generator' ? '2. Motif / Écart' : 
                       exerciseCategory === 'repertoire' ? 'Morceau du Répertoire' : 
                       exerciseCategory === 'bop' ? 'Phrase Jazz / Bop' : 'Fichier MIDI'}
                    </Label>
                    <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                      {(exerciseCategory === 'generator' ? GENERATOR_EXERCISES :
                        exerciseCategory === 'repertoire' ? Object.keys(REPERTOIRE_SONGS) :
                        exerciseCategory === 'bop' ? Object.keys(SOULFUL_BOP_PHRASES) :
                        MIDI_FILES).map(e => (
                        <button
                          key={e}
                          onClick={() => {
                            if (exerciseCategory === 'midi') loadMidiFile(e);
                            setExerciseType(e);
                          }}
                          className={cn(
                            "py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm flex items-center justify-between text-left",
                            exerciseType === e ? "bg-amber-500 text-white border-amber-400" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                          )}
                        >
                          <span className="truncate">{e}</span>
                          {exerciseType === e && <Zap className="w-3 h-3 fill-current" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] ml-1">3. Tonalité</Label>
                    <div className="grid grid-cols-6 gap-1">
                      {CHROMATIC_NOTES.map(n => (
                        <button
                          key={n}
                          onClick={() => handleRootNoteSelect(n)}
                          className={cn(
                            "h-8 rounded-lg text-[10px] font-bold transition-all border",
                            rootNote === n ? "bg-slate-800 text-white border-slate-700 shadow-md" : "bg-white text-slate-500 border-slate-100"
                          )}
                        >
                          {NOTE_NAMES[n] || n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Right (Col-span-3) - Range */}
                <div className="lg:col-span-3 space-y-6 lg:border-l border-slate-100 lg:pl-10">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] ml-1">4. Plage : Début</Label>
                    <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="grid grid-cols-6 gap-1">
                        {CHROMATIC_NOTES.map(n => (
                          <button
                            key={n}
                            onClick={() => setStartNote(n + (startNote.match(/[0-9]/)?.[0] || '3'))}
                            className={cn(
                              "h-6 rounded-lg text-[8px] font-bold transition-all border",
                              startNote.replace(/[0-9]/g, '') === n ? "bg-orange-500 text-white border-orange-400 shadow-sm" : "bg-white text-slate-400 border-slate-100"
                            )}
                          >
                            {NOTE_NAMES[n] || n}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {[2, 3, 4, 5, 6].map(o => (
                          <button
                            key={o}
                            onClick={() => setStartNote(startNote.replace(/[0-9]/, '') + o)}
                            className={cn(
                              "flex-1 h-5 rounded-md text-[8px] font-black transition-all border",
                              startNote.endsWith(o.toString()) ? "bg-slate-700 text-white border-slate-600" : "bg-white text-slate-300 border-transparent hover:bg-slate-100"
                            )}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] ml-1">5. Plage : Fin</Label>
                    <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="grid grid-cols-6 gap-1">
                        {CHROMATIC_NOTES.map(n => (
                          <button
                            key={n}
                            onClick={() => setEndNote(n + (endNote.match(/[0-9]/)?.[0] || '5'))}
                            className={cn(
                              "h-6 rounded-lg text-[8px] font-bold transition-all border",
                              endNote.replace(/[0-9]/g, '') === n ? "bg-orange-500 text-white border-orange-400 shadow-sm" : "bg-white text-slate-400 border-slate-100"
                            )}
                          >
                            {NOTE_NAMES[n] || n}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {[2, 3, 4, 5, 6].map(o => (
                          <button
                            key={o}
                            onClick={() => setEndNote(endNote.replace(/[0-9]/, '') + o)}
                            className={cn(
                              "flex-1 h-5 rounded-md text-[8px] font-black transition-all border",
                              endNote.endsWith(o.toString()) ? "bg-slate-700 text-white border-slate-600" : "bg-white text-slate-300 border-transparent hover:bg-slate-100"
                            )}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-100/30 rounded-xl border border-orange-200">
                    <div className="flex flex-col">
                      <Label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Aller-Retour</Label>
                      <span className="text-[8px] text-orange-500 font-bold">Redescendre une fois en haut</span>
                    </div>
                    <button
                      onClick={() => setUpDown(!upDown)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-md border-2",
                        upDown 
                          ? "bg-orange-600 text-white border-orange-400 scale-105" 
                          : "bg-white text-slate-400 border-slate-200 hover:bg-white"
                      )}
                    >
                      {upDown ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={saveFavorite}
                      variant="outline"
                      className="w-full h-10 border-orange-200 text-orange-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-orange-50 transition-all active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5 mr-2" />
                      Sauvegarder Favori
                    </Button>
                  </div>
                </div>

                {/* Floating Counters Stats (Absolute) */}
                <div className="absolute -bottom-1 -right-1 flex gap-2 pointer-events-none">
                  <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 shadow-xl flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-slate-500 uppercase">Temps</span>
                      <span className="text-xl font-mono text-orange-500 leading-none">{isPlaying ? displayBeat : "-"}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-800" />
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-slate-500 uppercase">Mesure</span>
                      <span className="text-xl font-mono text-orange-500 leading-none">{isPlaying ? displayMeasure : "-"}</span>
                    </div>
                  </div>
                </div>
              </div>)}
            </CardContent>
          </Card>

          {/* Notation View */}
          <div className="space-y-6 pb-20">
            <NotationView
              notes={generateScale}
              activeNoteIndex={activeNoteIndex}
              exerciseType={exerciseType}
              showFingerings={showFingerings}
            />

            {favorites.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Favoris</h3>
                <div className="flex gap-2 min-w-max pb-2">
                  {favorites.map((fav, idx) => (
                    <Button
                      key={idx}
                      onClick={() => loadFavorite(fav)}
                      variant="outline"
                      className="px-4 py-2 text-[10px] font-bold rounded-xl whitespace-nowrap"
                    >
                      {NOTE_NAMES[fav.rootNote] || fav.rootNote} {getTheoryTypeLabel(fav.scaleType)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => { setActiveNoteIndex(0); setIsPlaying(false); }} variant="outline" className="h-12 rounded-xl text-[10px] font-black uppercase">Réinitialiser</Button>
              <Button onClick={() => window.location.reload()} className="h-12 rounded-xl bg-orange-600 text-white font-black uppercase text-[10px]">Actualiser</Button>
            </div>
          </div>
        </>
        )}
      </div>
    </div>
  );
};

export default ScalePractice;
