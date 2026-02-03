"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pause, Play, Save, Volume2, VolumeX, FileMusic } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Vex from 'vexflow';
import { Midi } from '@tonejs/midi';

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
  'Arpèges (Plage)': (scale) => scale!,
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

const NotationView: React.FC<{ notes: ExerciseNote[]; activeNoteIndex: number }> = ({ notes, activeNoteIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || notes.length === 0) return;
    containerRef.current.innerHTML = '';

    const VF = Vex.Flow;

    const measures: ExerciseNote[][] = [];
    let currentMeasureNotes: ExerciseNote[] = [];
    let currentMeasureBeats = 0;

    notes.forEach(note => {
      const noteBeats = BEAT_VALUES[note.duration];
      if (currentMeasureBeats + noteBeats > 4) {
        measures.push(currentMeasureNotes);
        currentMeasureNotes = [note];
        currentMeasureBeats = noteBeats;
      } else {
        currentMeasureNotes.push(note);
        currentMeasureBeats += noteBeats;
      }
      if (currentMeasureBeats === 4) {
        measures.push(currentMeasureNotes);
        currentMeasureNotes = [];
        currentMeasureBeats = 0;
      }
    });
    if (currentMeasureNotes.length > 0) measures.push(currentMeasureNotes);

    const measuresPerLine = 4;
    const totalMeasures = measures.length;
    const numLines = Math.ceil(totalMeasures / measuresPerLine);
    const measureWidth = 220;
    const staveHeight = 120;
    const padding = 10;
    const firstMeasureExtraWidth = 40;
    const width = measuresPerLine * measureWidth + firstMeasureExtraWidth + padding * 2;
    const height = numLines * staveHeight + padding * 2;

    const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    context.setFont('Arial', 10, 400).setBackgroundFillStyle('#fff');

    let noteCounter = 0;
    let currentMeasureIndex = 0;

    for (let line = 0; line < numLines; line++) {
      let currentX = padding;
      for (let measureInLine = 0; measureInLine < measuresPerLine; measureInLine++) {
        if (currentMeasureIndex >= totalMeasures) break;

        const currentMeasureEffectiveWidth = measureWidth + (currentMeasureIndex === 0 ? firstMeasureExtraWidth : 0);
        const stave = new VF.Stave(currentX, padding + line * staveHeight, currentMeasureEffectiveWidth);
        if (currentMeasureIndex === 0) stave.addClef('treble').addTimeSignature('4/4');
        stave.setContext(context).draw();

        const measureNotes = measures[currentMeasureIndex];
        const vexNotes = measureNotes.map((note, idx) => {
          const globalIdx = noteCounter + idx;
          const noteKey = note.key;
          const noteName = noteKey.replace(/[0-9]/, '');
          const octave = noteKey.match(/[0-9]/)?.[0] || '4';

          const baseNote = noteName[0].toLowerCase();
          const accidental = noteName.substring(1);

          const vexKey = `${baseNote}/${octave}`;

          const vexNote = new VF.StaveNote({ clef: "treble", keys: [vexKey], duration: note.duration, auto_stem: true });

          if (accidental) {
            vexNote.addModifier(new VF.Accidental(accidental), 0);
          }

          if (globalIdx === activeNoteIndex) vexNote.setStyle({ fillStyle: "#2196f3", strokeStyle: "#2196f3" });

          const fingering = PISTONS[note.key];
          if (fingering) {
            const fingeringText = getFingeringText(fingering);
            const annotation = new VF.Annotation(fingeringText).setFont('Arial', 10, 'normal').setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
            vexNote.addModifier(annotation, 0);
          }
          return vexNote;
        });

        const measureBeats = measureNotes.reduce((acc, n) => acc + BEAT_VALUES[n.duration], 0);
        const voice = new VF.Voice({ num_beats: measureBeats, beat_value: 4 });
        voice.setStrict(false);
        voice.addTickables(vexNotes);

        const formatter = new VF.Formatter().joinVoices([voice]);
        const formatWidth = stave.getWidth() - (currentMeasureIndex === 0 ? 80 : 40);
        formatter.format([voice], formatWidth > 0 ? formatWidth : 100);
        voice.draw(context, stave);

        noteCounter += measureNotes.length;
        currentMeasureIndex++;
        currentX += currentMeasureEffectiveWidth;
      }
    }
  }, [notes, activeNoteIndex]);

  return <div ref={containerRef} className="overflow-x-auto" />;
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

  const audioContextRef = useRef<AudioContext | null>(null);
  const schedulerRef = useRef<{ nextNoteTime: number; noteIndex: number } | null>(null);
  const currentOscillatorRef = useRef<OscillatorNode | null>(null);
  const currentGainRef = useRef<GainNode | null>(null);

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
    const noteStrings = exerciseGenerator(scaleNotes) as string[];
    return noteStrings.map(key => ({ key, duration: 'q' }));
  }, [rootNote, scaleType, startOctave, exerciseType, midiNotes, midiTranspose]);

  const noteToFrequency = useCallback((noteKey: string): number => {
    const A4 = 440;
    const noteNames: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    const octave = parseInt(noteKey.match(/\d+/)?.[0] || '4', 10);
    const noteName = noteKey.replace(/\d+/, '');
    const semitonesFromA4 = noteNames[noteName] - noteNames['A'] + (octave - 4) * 12;
    const transposedSemitones = semitonesFromA4 + (INSTRUMENTS[selectedInstrument] || 0);
    return A4 * Math.pow(2, transposedSemitones / 12);
  }, [selectedInstrument]);

  const playClick = useCallback((time: number) => {
    if (!audioContextRef.current) return;
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, time);
    osc.start(time);
    osc.stop(time + 0.05);
  }, []);

  const playNote = useCallback((note: ExerciseNote, startTime: number, duration: number) => {
    if (!audioContextRef.current || isMuted) return;

    // Stop previous note
    if (currentOscillatorRef.current) {
      currentOscillatorRef.current.stop(startTime);
    }

    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    const freq = noteToFrequency(note.key);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);

    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    currentOscillatorRef.current = osc;
    currentGainRef.current = gain;
  }, [isMuted, volume, noteToFrequency]);

  useEffect(() => {
    if (isPlaying) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      schedulerRef.current = {
        nextNoteTime: audioContextRef.current.currentTime + 0.1,
        noteIndex: activeNoteIndex
      };

      const lookahead = 25.0; // ms
      const scheduleAheadTime = 0.1; // seconds

      const intervalId = setInterval(() => {
        if (!audioContextRef.current || !schedulerRef.current) return;

        while (schedulerRef.current.nextNoteTime < audioContextRef.current.currentTime + scheduleAheadTime) {
          const currentScale = generateScale;
          const noteIndex = schedulerRef.current.noteIndex;
          const note = currentScale[noteIndex];
          const startTime = schedulerRef.current.nextNoteTime;

          const secondsPerBeat = 60.0 / tempo;
          const noteDuration = (BEAT_VALUES[note.duration] || 1) * secondsPerBeat;

          // Schedule Metronome Click
          playClick(startTime);

          // Schedule Note
          playNote(note, startTime, noteDuration);

          // Update UI (with a small delay to match start time)
          const delay = (startTime - audioContextRef.current.currentTime) * 1000;
          setTimeout(() => {
            setActiveNoteIndex(noteIndex);
          }, Math.max(0, delay));

          schedulerRef.current.nextNoteTime += noteDuration;
          schedulerRef.current.noteIndex = (noteIndex + 1) % currentScale.length;
        }
      }, lookahead);

      return () => {
        clearInterval(intervalId);
        if (currentOscillatorRef.current) {
          currentOscillatorRef.current.stop();
          currentOscillatorRef.current = null;
        }
      };
    } else {
      if (currentOscillatorRef.current) {
        currentOscillatorRef.current.stop();
        currentOscillatorRef.current = null;
      }
      schedulerRef.current = null;
    }
  }, [isPlaying, tempo, generateScale, isMuted, volume, playClick, playNote]);


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
    <Card className="w-full mx-auto px-4 py-20">
      <CardHeader>
        <CardTitle>Générateur de Gammes - Trompette</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-2">Tonalité</label>
              <select value={rootNote} onChange={(e) => setRootNote(e.target.value)} className="px-3 py-2 border rounded" disabled={isExerciseDisabled}>
                {CHROMATIC_NOTES.map(note => <option key={note} value={note}>{NOTE_NAMES[note]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type de gamme</label>
              <select value={scaleType} onChange={(e) => setScaleType(e.target.value)} className="px-3 py-2 border rounded" disabled={isExerciseDisabled}>
                {Object.keys(SCALE_PATTERNS).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type d&apos;exercice / Morceau</label>
              <select
                value={exerciseType.startsWith('MIDI:') ? exerciseType : exerciseType}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('MIDI:')) {
                    loadMidiFile(val.replace('MIDI:', ''));
                  } else {
                    setExerciseType(val);
                    setMidiNotes([]); // Clear MIDI notes if not MIDI exercise
                    setAvailableTracks([]);
                    setSelectedMidi('');
                  }
                }}
                className="px-3 py-2 border rounded"
              >
                <optgroup label="Exercices">
                  {Object.keys(EXERCISE_PATTERNS).map(type => <option key={type} value={type}>{type}</option>)}
                </optgroup>
                <optgroup label="Répertoire">
                  {Object.keys(REPERTOIRE_SONGS).map(type => <option key={type} value={type}>{type}</option>)}
                </optgroup>
                <optgroup label="MIDI Local">
                  <option value="Fichier MIDI">Fichier MIDI Importé</option>
                  {MIDI_FILES.map(file => <option key={file} value={`MIDI:${file}`}>{file.replace('.mid', '')}</option>)}
                </optgroup>
              </select>
            </div>
            {exerciseType === 'Fichier MIDI' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Transposition (Sib &lt;-&gt; Ut)</label>
                  <select
                    value={midiTranspose}
                    onChange={(e) => setMidiTranspose(Number(e.target.value))}
                    className="px-3 py-2 border rounded"
                  >
                    <option value={0}>Notes Originales (Ut / Piano)</option>
                    <option value={2}>Piano (Do) -&gt; Trompette (Sib) [+2]</option>
                    <option value={-2}>Trompette (Sib) -&gt; Piano (Do) [-2]</option>
                    <option value={12}>+1 Octave</option>
                    <option value={-12}>-1 Octave</option>
                  </select>
                </div>
                {availableTracks.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Choix de la piste (Voix)</label>
                    <select
                      value={selectedMidiTrack}
                      onChange={(e) => loadMidiFile(selectedMidi, Number(e.target.value))}
                      className="px-3 py-2 border rounded"
                    >
                      {availableTracks.map(t => (
                        <option key={t.index} value={t.index}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Octave de départ</label>
              <select value={startOctave} onChange={(e) => setStartOctave(Number(e.target.value))} className="px-3 py-2 border rounded" disabled={isExerciseDisabled}>
                <option value={3}>3</option><option value={4}>4</option><option value={5}>5</option>
              </select>
            </div>
            <div>
              <label htmlFor="instrument-select" className="block text-sm font-medium mb-2">Instrument</label>
              <select id="instrument-select" value={selectedInstrument} onChange={(e) => setSelectedInstrument(e.target.value)} className="px-3 py-2 border rounded">
                {Object.keys(INSTRUMENTS).map(inst => <option key={inst} value={inst}>{inst}</option>)}
              </select>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <NotationView notes={generateScale} activeNoteIndex={activeNoteIndex} />
          </div>

          <div className="flex justify-between items-center flex-wrap gap-4">
            <Metronome tempo={tempo} setTempo={setTempo} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
            <div className="flex items-center gap-4">
              <Button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded bg-gray-200 hover:bg-gray-300" title={isMuted ? "Activer le son" : "Couper le son"}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
              <input type="range" min="0" max="0.5" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-24" title="Volume" />
              <Button onClick={saveFavorite} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2" title="Sauvegarder dans les favoris">
                <Save size={20} /> Sauvegarder
              </Button>
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="border rounded p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Favoris</h3>
              <div className="flex gap-2 flex-wrap">
                {favorites.map((fav, idx) => (
                  <Button key={idx} onClick={() => loadFavorite(fav)} className="px-3 py-1 bg-white text-color-primary border rounded hover:bg-gray-100 text-sm">
                    {NOTE_NAMES[fav.rootNote]} {fav.scaleType} - {fav.exerciseType}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {generateScale.length > 0 ? generateScale.map((note, idx) => (
              <Note key={idx} note={note} isActive={idx === activeNoteIndex} />
            )) : <p className="col-span-full text-center text-gray-500">Aucune note à afficher.</p>}
          </div>

          <div className="flex gap-4">
            <Button onClick={() => { setActiveNoteIndex(0); setIsPlaying(false); }} className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              Réinitialiser
            </Button>
            <Button onClick={() => setActiveNoteIndex((prev) => (prev + 1) % generateScale.length)} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Note Suivante
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScalePractice;