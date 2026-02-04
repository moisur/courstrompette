"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Pause, Play, Save, Volume2, VolumeX, FileMusic, Activity, LayoutDashboard, Settings2, Music2, Rocket, Gauge, Flag, Zap, Repeat, Target } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
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

interface Favorite {
  rootNote: string;
  scaleType: string;
  exerciseType: string;
  startOctave: number;
  tempo: number;
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

const SONGS_EXERCISES = [...Object.keys(EXERCISE_PATTERNS), ...Object.keys(REPERTOIRE_SONGS)];

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

const NotationView: React.FC<{ notes: ExerciseNote[]; activeNoteIndex: number; exerciseType: string }> = ({ notes, activeNoteIndex, exerciseType }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousHighlightRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || notes.length === 0) return;
    containerRef.current.innerHTML = '';

    const VF = Vex.Flow;

    // --- 0. CONFIGURATION ---
    const isClarke = exerciseType.includes("Clarke");
    const measuresPerLine = isClarke ? 5 : 2;
    const totalWidth = isClarke ? 1600 : 900;

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
        const fingering = isRest ? null : PISTONS[note.key];
        if (fingering) {
          vexNote.addModifier(new VF.Annotation(getFingeringText(fingering)).setFont('Arial', 8, 'bold').setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM), 0);
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
  }, [notes, exerciseType]);

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
  const [rootNote, setRootNote] = useState('C');
  const [scaleType, setScaleType] = useState('Majeure');
  const [exerciseType, setExerciseType] = useState('Gamme simple');
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [startOctave, setStartOctave] = useState(4);
  const [tempo, setTempo] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.1);
  const [isMuted, setIsMuted] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState('Trompette (Sib)');
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

  // 2. Synchronisation systématique des refs avec l'état UI
  useEffect(() => { tempoRef.current = tempo; }, [tempo]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { accelConfigRef.current = accelConfig; }, [accelConfig]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scalesFavorites');
      if (saved) setFavorites(JSON.parse(saved));
    }
  }, []);

  const generateScale = useMemo((): ExerciseNote[] => {
    if (exerciseType === 'Fichier MIDI' && midiNotes.length > 0) {
      return midiNotes.map(n => {
        const octave = parseInt(n.key.match(/\d+/)?.[0] || '4', 10);
        const noteName = n.key.replace(/\d+/, '');
        // Handle both sharps and flats for index lookup
        const CHROMATIC_MAP: { [key: string]: number } = {
          'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };
        const noteIndex = CHROMATIC_MAP[noteName] ?? 0;
        const transposedIndex = (noteIndex + midiTranspose + 120) % 12; // Add 120 to ensure positive result before modulo
        const octaveShift = Math.floor((noteIndex + midiTranspose) / 12);
        return {
          key: `${CHROMATIC_NOTES[transposedIndex]}${octave + octaveShift}`,
          duration: n.duration
        };
      });
    }

    if (REPERTOIRE_SONGS[exerciseType]) {
      return REPERTOIRE_SONGS[exerciseType];
    }

    const exerciseGenerator = EXERCISE_PATTERNS[exerciseType];
    if (exerciseType === 'Flexibilité - Niveau 1') {
      return exerciseGenerator() as ExerciseNote[];
    }

    const rootIndex = CHROMATIC_NOTES.indexOf(rootNote);
    const chromaticScale = Array.from({ length: 24 }, (_, i) => {
      const noteIndex = (rootIndex + i) % 12;
      const octaveShift = Math.floor((rootIndex + i) / 12);
      return `${CHROMATIC_NOTES[noteIndex]}${startOctave + octaveShift}`;
    });

    const pattern = SCALE_PATTERNS[scaleType];
    const scaleNotes = pattern.map(interval => chromaticScale[interval]);
    const result = exerciseGenerator(scaleNotes);

    // If it's already an array of ExerciseNote, return it directly
    if (result.length > 0 && typeof result[0] === 'object') {
      return result as ExerciseNote[];
    }
    // Otherwise it's an array of strings, map to ExerciseNote with default duration
    return (result as string[]).map(key => ({ key, duration: 'q' }));
  }, [rootNote, scaleType, startOctave, exerciseType, midiNotes, midiTranspose]);

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

  // --- AUTO-RESET SUR CHANGEMENT DE CONFIG ---
  useEffect(() => {
    handleStop();
  }, [exerciseType, rootNote, scaleType, startOctave, handleStop]);

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
            if (ac.active && (currentMeasure - 1) % ac.interval === 0) {
              const newTempo = Math.min(ac.end, tempoRef.current + ac.step);
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
    const newFavorite: Favorite = { rootNote, scaleType, exerciseType, startOctave, tempo };
    const newFavorites = [...favorites, newFavorite];
    setFavorites(newFavorites);
    if (typeof window !== 'undefined') localStorage.setItem('scalesFavorites', JSON.stringify(newFavorites));
  };

  const loadFavorite = (favorite: Favorite) => {
    setRootNote(favorite.rootNote);
    setScaleType(favorite.scaleType);
    setExerciseType(favorite.exerciseType);
    setStartOctave(favorite.startOctave);
    setTempo(favorite.tempo);
    setActiveNoteIndex(0);
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

  const isExerciseDisabled = exerciseType === 'Flexibilité - Niveau 1' || !!REPERTOIRE_SONGS[exerciseType] || exerciseType === 'Fichier MIDI';

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-1">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500"
          >
            Logiciel d&apos;Entraînement Trompette
          </motion.h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Assistant Pratique Virtuel</p>
        </div>

        <Card className="bg-white border-slate-200 shadow-xl overflow-hidden rounded-2xl relative">
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left: Metronome & Volume */}
              {/* Left: Metronome & Volume */}
              <div className="lg:col-span-4 space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    {/* Bouton PLAY / PAUSE */}
                    <Button
                      size="lg"
                      className={cn(
                        "flex-1 h-20 rounded-2xl flex flex-col gap-1 shadow-lg transition-all active:scale-95 text-white border-none",
                        isPlaying
                          ? "bg-amber-500 hover:bg-amber-600 ring-4 ring-amber-100"
                          : "bg-orange-600 hover:bg-orange-700 ring-4 ring-orange-100"
                      )}
                      onClick={togglePlay}
                    >
                      {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {isPlaying ? 'PAUSE' : 'PLAY'}
                      </span>
                    </Button>

                    {/* Bouton STOP (Reset) */}
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-20 h-20 rounded-2xl border-2 border-slate-200 flex flex-col gap-1 hover:bg-slate-50 hover:border-red-200 hover:text-red-600 transition-all active:scale-95"
                      onClick={handleStop}
                    >
                      <div className="w-6 h-6 bg-current rounded-sm" /> {/* Carré Stop */}
                      <span className="text-[10px] font-black uppercase tracking-widest">STOP</span>
                    </Button>
                  </div>

                  {/* Slider Tempo */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-end justify-between">
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-mono font-black text-slate-900 tracking-tighter leading-none">{tempo}</span>
                        <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">BPM</span>
                      </div>

                      {/* ACCELERATION MODE BUTTON */}
                      <Dialog open={isAccelDialogOpen} onOpenChange={setIsAccelDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-6 px-2 text-[10px] font-bold uppercase tracking-widest border border-slate-200 hover:bg-slate-50",
                              accelConfig.active ? "bg-orange-100 text-orange-700 border-orange-200 animate-pulse" : "text-slate-400"
                            )}
                          >
                            <Rocket className="w-3 h-3 mr-1" />
                            {accelConfig.active ? "Activé" : "Accélérer"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[420px] rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden bg-white">
                          {/* Header avec dégradé subtil */}
                          <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 p-6 border-b border-orange-100/50">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-black flex items-center gap-3 text-slate-800">
                                <div className="p-2.5 bg-orange-500 rounded-2xl shadow-lg shadow-orange-200">
                                  <Rocket className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                  <span>Testeur de Vitesse</span>
                                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-[0.15em] mt-0.5">Entraînement Progressif</span>
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                          </div>

                          <div className="p-6 space-y-5">
                            {/* SECTION PRINCIPALE : DEPART & OBJECTIF */}
                            <div className="bg-slate-50/80 p-4 rounded-[1.5rem] border border-slate-100">
                              <div className="grid grid-cols-2 gap-4">
                                {/* DEPART */}
                                <div className="space-y-2">
                                  <Label className="flex items-center gap-2 text-[9px] uppercase font-black text-slate-400 ml-1">
                                    <Flag className="w-3 h-3 text-orange-500" />
                                    Départ
                                  </Label>
                                  <div className="relative group">
                                    <Input
                                      type="number"
                                      value={accelConfig.start}
                                      onChange={(e) => setAccelConfig(prev => ({ ...prev, start: Number(e.target.value) }))}
                                      className="h-14 text-2xl font-mono font-black border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 bg-white pl-4 pr-10 rounded-2xl transition-all shadow-sm"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 group-focus-within:text-orange-400">BPM</span>
                                  </div>
                                </div>

                                {/* OBJECTIF */}
                                <div className="space-y-2">
                                  <Label className="flex items-center gap-2 text-[9px] uppercase font-black text-slate-400 ml-1">
                                    <Target className="w-3 h-3 text-orange-500" />
                                    Objectif
                                  </Label>
                                  <div className="relative group">
                                    <Input
                                      type="number"
                                      value={accelConfig.end}
                                      onChange={(e) => setAccelConfig(prev => ({ ...prev, end: Number(e.target.value) }))}
                                      className="h-14 text-2xl font-mono font-black border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 bg-white pl-4 pr-10 rounded-2xl transition-all shadow-sm"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 group-focus-within:text-orange-400">BPM</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* SECTION REGLAGES : PAS & INTERVALLE (Côte à côte pour réduire la hauteur) */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
                                <Label className="flex items-center gap-2 text-[9px] uppercase font-black text-slate-400">
                                  <Zap className="w-3 h-3 text-amber-500" />
                                  Pas
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    value={accelConfig.step}
                                    onChange={(e) => setAccelConfig(prev => ({ ...prev, step: Number(e.target.value) }))}
                                    className="h-9 font-mono font-bold border-transparent bg-slate-50 focus:bg-white text-center rounded-lg"
                                  />
                                  <span className="text-[9px] font-bold text-slate-400">BPM</span>
                                </div>
                              </div>

                              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
                                <Label className="flex items-center gap-2 text-[9px] uppercase font-black text-slate-400">
                                  <Repeat className="w-3 h-3 text-blue-500" />
                                  Toutes les
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    value={accelConfig.interval}
                                    onChange={(e) => setAccelConfig(prev => ({ ...prev, interval: Number(e.target.value) }))}
                                    className="h-9 font-mono font-bold border-transparent bg-slate-50 focus:bg-white text-center rounded-lg"
                                  />
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">Mes.</span>
                                </div>
                              </div>
                            </div>

                            {/* BOUTON ACTION */}
                            <Button
                              onClick={() => {
                                setAccelConfig(prev => ({ ...prev, active: !prev.active }));
                                setIsAccelDialogOpen(false);
                                if (!accelConfig.active) {
                                  setTempo(accelConfig.start);
                                }
                              }}
                              size="lg"
                              className={cn(
                                "w-full h-16 rounded-2xl text-base font-black shadow-xl transition-all active:scale-[0.97] border-0",
                                accelConfig.active
                                  ? "bg-slate-800 hover:bg-slate-900 text-white"
                                  : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200"
                              )}
                            >
                              {accelConfig.active ? (
                                "Désactiver le mode"
                              ) : (
                                <span className="flex items-center gap-2">
                                  Activer l&apos;accélération <Rocket className="w-4 h-4" />
                                </span>
                              )}
                            </Button>

                            <p className="text-[9px] text-center font-bold text-slate-300 uppercase tracking-widest">
                              Pratiquez mieux, pas plus vite
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Slider
                      value={[tempo]}
                      min={40}
                      max={208}
                      onValueChange={(vals) => setTempo(vals[0])}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-orange-600">
                        <Volume2 className="w-3.5 h-3.5" />
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Volume</Label>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{Math.round(volume * 200)}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[volume]}
                        max={0.5}
                        step={0.01}
                        onValueChange={(vals) => setVolume(vals[0])}
                        className="cursor-pointer"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-400 hover:text-orange-600 hover:bg-slate-50 rounded-lg border border-slate-100"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle: Selection Controls */}
              <div className="lg:col-span-5 space-y-5 lg:border-l border-slate-100 lg:pl-10">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Exercice</Label>
                    <select
                      value={exerciseType}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('MIDI:')) {
                          loadMidiFile(val.replace('MIDI:', ''));
                        } else {
                          setExerciseType(val);
                          setMidiNotes([]);
                          setAvailableTracks([]);
                          setSelectedMidi('');
                        }
                      }}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all cursor-pointer"
                    >
                      <optgroup label="Exercices & Gammes">
                        {Object.keys(EXERCISE_PATTERNS).filter(k => !k.includes('Clarke')).map(type => <option key={type} value={type}>{type}</option>)}
                      </optgroup>
                      <optgroup label="Méthodes Célèbres">
                        <option value="Clarke Second Study">Clarke - Second Study (Complet)</option>
                        <option value="Clarke II (Single Tonalité)">Clarke - Lesson 3 (Single)</option>
                        <option value="Clarke Étude III">Clarke - Étude III</option>
                      </optgroup>
                      <optgroup label="Répertoire Populaire">
                        {Object.keys(REPERTOIRE_SONGS).map(type => <option key={type} value={type}>{type}</option>)}
                      </optgroup>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tonalité</Label>
                      <select
                        value={rootNote}
                        onChange={(e) => setRootNote(e.target.value)}
                        disabled={isExerciseDisabled}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all disabled:opacity-50"
                      >
                        {CHROMATIC_NOTES.map(note => <option key={note} value={note}>{NOTE_NAMES[note]}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mode</Label>
                      <select
                        value={scaleType}
                        onChange={(e) => setScaleType(e.target.value)}
                        disabled={isExerciseDisabled}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all disabled:opacity-50"
                      >
                        {Object.keys(SCALE_PATTERNS).map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Octave</Label>
                      <select
                        value={startOctave}
                        onChange={(e) => setStartOctave(Number(e.target.value))}
                        disabled={isExerciseDisabled}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all disabled:opacity-50"
                      >
                        {[3, 4, 5].map(o => <option key={o} value={o}>Octave {o}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={saveFavorite}
                        variant="outline"
                        className="h-10 w-full border-orange-200 text-orange-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-orange-50 transition-all active:scale-95"
                      >
                        <Save className="w-3.5 h-3.5 mr-2" />
                        Sauvegarder
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Instrument</Label>
                    <div className="flex gap-4 items-center bg-slate-50 p-1.5 pr-4 rounded-xl border border-slate-200">
                      <select
                        value={selectedInstrument}
                        onChange={(e) => setSelectedInstrument(e.target.value)}
                        className="bg-transparent text-sm font-semibold text-slate-700 outline-none flex-1 px-2 border-none ring-0 focus:ring-0"
                      >
                        {Object.keys(INSTRUMENTS).map(inst => <option key={inst} value={inst}>{inst}</option>)}
                      </select>
                      <Activity className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Real-time Counters */}
              <div className="lg:col-span-3 space-y-4 lg:border-l border-slate-100 lg:pl-10 flex flex-col">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] text-orange-600 font-black uppercase tracking-[0.2em] text-center w-full block">Temps</Label>
                    <div className="bg-slate-900 rounded-xl w-full p-3 flex flex-col items-center justify-center border border-slate-800 shadow-inner h-16">
                      <div className="text-3xl font-mono font-black text-orange-500 tracking-tighter">
                        {isPlaying ? displayBeat : "-"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] text-orange-600 font-black uppercase tracking-[0.2em] text-center w-full block">Mesure</Label>
                    <div className="bg-slate-900 rounded-xl w-full p-3 flex flex-col items-center justify-center border border-slate-800 shadow-inner h-16">
                      <div className="text-3xl font-mono font-black text-orange-500 tracking-tighter">
                        {isPlaying ? displayMeasure : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col gap-3 mt-auto">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FileMusic className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate">{exerciseType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", isPlaying ? "bg-green-500 animate-pulse" : "bg-slate-300")} />
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      {isPlaying ? "En cours" : "Prêt"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Notation Area */}
        <div className="space-y-6 pb-20">
          <NotationView
            notes={generateScale}
            activeNoteIndex={activeNoteIndex}
            exerciseType={exerciseType}
          />
          {/* Favorites & Footer Controls */}
          {favorites.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Favoris</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                {favorites.map((fav, idx) => (
                  <Button
                    key={idx}
                    onClick={() => loadFavorite(fav)}
                    variant="outline"
                    className="px-4 py-2 bg-slate-50 border-slate-200 text-slate-600 rounded-xl hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 text-[10px] font-bold transition-all active:scale-95"
                  >
                    {NOTE_NAMES[fav.rootNote] || fav.rootNote} {fav.scaleType}
                    <span className="ml-2 text-slate-400 font-mono text-[9px]">{fav.tempo}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => { setActiveNoteIndex(0); setIsPlaying(false); }}
              variant="outline"
              className="h-12 rounded-xl border-slate-200 bg-white text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
            >
              Réinitialiser
            </Button>
            <Button
              onClick={saveFavorite}
              className="h-12 rounded-xl bg-orange-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-orange-700 shadow-lg active:scale-95 transition-all"
            >
              Sauvegarder Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScalePractice;
