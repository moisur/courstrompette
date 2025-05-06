"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pause, Play, Save, Volume2, VolumeX } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Vex from 'vexflow';

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

interface ExercisePattern {
  [exercise: string]: (scale: string[]) => string[];
}

interface Favorite {
  rootNote: string;
  scaleType: string;
  exerciseType: string;
  startOctave: number;
  tempo: number;
}

interface Stave {
  name: string;
  notes: string[];
}


// Constants
const PISTONS: Piston = {
  "F#3": "111", "G3": "101", "G#3": "011", "A3": "110", "A#3": "100", "B3": "010",
  "C4": "000", "C#4": "111", "D4": "101", "D#4": "011", "E4": "110",
  "F4": "100", "F#4": "010", "G4": "000", "G#4": "011", "A4": "110",
  "A#4": "100", "B4": "010", "C5": "000", "C#5": "110", "D5": "100",
  "D#5": "010", "E5": "000", "F5": "100", "F#5": "010", "G5": "000",
  "G#5": "011", "A5": "110", "A#5": "100", "B5": "010", "C6": "000",
  "C#6": "010", "D6": "000", "D#6": "010", "E6": "000"
};

const NOTE_NAMES: NoteName = {
  'C': 'do', 'C#': 'do#', 'D': 'ré', 'D#': 'ré#', 
  'E': 'mi', 'F': 'fa', 'F#': 'fa#', 'G': 'sol', 
  'G#': 'sol#', 'A': 'la', 'A#': 'la#', 'B': 'si'
};

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALE_PATTERNS: ScalePattern = {
  'Majeure': [0, 2, 4, 5, 7, 9, 11, 12],
  'Mineure naturelle': [0, 2, 3, 5, 7, 8, 10, 12],
  'Mineure harmonique': [0, 2, 3, 5, 7, 8, 11, 12],
  'Mineure mélodique': [0, 2, 3, 5, 7, 9, 11, 12],
};

const EXERCISE_PATTERNS: ExercisePattern = {
  'Gamme simple': (scale) => scale,
  'Tierces': (scale) => {
    const result = [];
    for (let i = 0; i < scale.length - 2; i++) {
      result.push(scale[i], scale[i + 2]);
    }
    return result;
  },
  'Quartes': (scale) => {
    const result = [];
    for (let i = 0; i < scale.length - 3; i++) {
      result.push(scale[i], scale[i + 3]);
    }
    return result;
  },
  'Quintes': (scale) => {
    const result = [];
    for (let i = 0; i < scale.length - 4; i++) {
      result.push(scale[i], scale[i + 4]);
    }
    return result;
  },
  'Arpège': (scale) => [scale[0], scale[2], scale[4], scale[7]],
  'Arpège avec septième': (scale) => [scale[0], scale[2], scale[4], scale[6], scale[7]],
  'Quinte-Tonale-Quinte-Octave': (scale) => {
    const result = [];
    let i = scale.length - 1; // Commencer par la dernière note
    while (true) {
      const tonale = scale[i];
      const quinteIndex = (i + 7) % scale.length;
      const octaveIndex = (i + 12) % scale.length;
      const quinte = scale[quinteIndex];
      const octave = scale[octaveIndex];
      result.push(quinte, tonale, quinte, octave);
      
      // Descendre d'un demi-ton
      i = (i - 1 + scale.length) % scale.length;
      
      // Arrêter si on atteint Do# (C#)
      if (tonale.startsWith('C#')) break;
    }
    return result;
  },
  'Arpèges (Plage)': (scale) => scale, // Placeholder, will be implemented later
};

const INSTRUMENTS: { [key: string]: number } = {
  'Trompette (Sib)': -2,
  'Saxophone Alto (Mib)': -9,
  'Instrument en Do': 0,
};

// Helper function to format fingering
const getFingeringText = (pistonString: string): string => {
  if (!pistonString) return ''; // Handle cases where fingering might be undefined
  if (pistonString === '000') return '0';
  return pistonString
    .split('')
    .map((p, i) => (p === '1' ? (i + 1).toString() : ''))
    .filter(Boolean)
    .join('');
};

// Sub-components
const NotationView: React.FC<{ notes: string[]; activeNoteIndex: number }> = ({ notes, activeNoteIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const VF = Vex.Flow;
    
    const notesPerMeasure = 4; // Assuming 4/4 time
    const measuresPerLine = 6; // Display 6 measures per line
    const totalMeasures = Math.ceil(notes.length / notesPerMeasure);
    const numLines = Math.ceil(totalMeasures / measuresPerLine);

    const measureWidth = 240; // Slightly reduced width per measure
    const staveHeight = 120; // Height per stave/line
    const padding = 10; // Padding
    const firstMeasureExtraWidth = 40; // Extra space needed for clef/time sig

    // Calculate width based on measures per line, adding extra for the first measure
    const width = measuresPerLine * measureWidth + firstMeasureExtraWidth + padding * 2; 
    // Calculate height based on number of lines
    const height = numLines * staveHeight + padding * 2; 

    const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    context.setFont('Arial', 10, 400).setBackgroundFillStyle('#fff');

    const staves: Vex.Flow.Stave[] = [];
    const voices: Vex.Flow.Voice[] = [];

    let currentMeasureIndex = 0;
    for (let line = 0; line < numLines; line++) {
      const lineStaves: Vex.Flow.Stave[] = [];
      const lineVoices: Vex.Flow.Voice[] = [];

      let currentX = padding;
      for (let measureInLine = 0; measureInLine < measuresPerLine; measureInLine++) {
        if (currentMeasureIndex >= totalMeasures) break; // Stop if no more measures

        // Adjust width for the first measure on the first line
        const currentMeasureEffectiveWidth = measureWidth + (currentMeasureIndex === 0 ? firstMeasureExtraWidth : 0);
        
        const staveY = padding + line * staveHeight;
        const stave = new VF.Stave(currentX, staveY, currentMeasureEffectiveWidth);

        if (currentMeasureIndex === 0) { // Add clef and time signature only to the very first stave
          stave.addClef('treble').addTimeSignature('4/4');
        }
        
        // Update currentX for the next stave
        currentX += currentMeasureEffectiveWidth;
        
        stave.setContext(context).draw();
        staves.push(stave); // Add to the main staves array
        lineStaves.push(stave); // Add to the current line's staves

        const measureNotes = notes.slice(currentMeasureIndex * notesPerMeasure, (currentMeasureIndex + 1) * notesPerMeasure);
        const vexNotes = measureNotes.map((note, idx) => {
          const globalIdx = currentMeasureIndex * notesPerMeasure + idx;
        const noteName = note.replace(/[0-9]/, '').replace('#', '#');
        const octave = note.match(/[0-9]/)?.[0] || '4';
        const vexNote = new VF.StaveNote({ clef: "treble", keys: [`${noteName}/${octave}`], duration: "q" });

        if (globalIdx === activeNoteIndex) {
          vexNote.setStyle({ fillStyle: "#2196f3", strokeStyle: "#2196f3" });
        }

        if (noteName.includes('#')) {
          // Add accidental modifier correctly
          vexNote.addModifier(new VF.Accidental("#"), 0); // Added index 0
        }

        // Use Annotation modifier for fingering
        const fingering = PISTONS[note];
        if (fingering) {
          const fingeringText = getFingeringText(fingering);
          const annotation = new VF.Annotation(fingeringText)
             .setFont('Arial', 10, 'normal') // Added 'normal' weight
             .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
          vexNote.addModifier(annotation, 0); // Add modifier at index 0
        }

        return vexNote;
      });

        // Pad with rests if necessary
        while (vexNotes.length < notesPerMeasure) {
          vexNotes.push(new VF.StaveNote({ clef: "treble", keys: ["b/4"], duration: "qr" }));
        }

        const voice = new VF.Voice({ num_beats: notesPerMeasure, beat_value: 4 });
        voice.addTickables(vexNotes);
        voices.push(voice); // Add to the main voices array
        lineVoices.push(voice); // Add to the current line's voices

        currentMeasureIndex++;
      }

      // Format and draw voices individually per measure within the line loop
      lineVoices.forEach((voice, voiceIndex) => {
        const stave = lineStaves[voiceIndex];
        if (stave) {
          // Format this single voice within its stave. 
          // Provide a width slightly less than the stave's width for padding.
          // Apply a larger reduction for the very first measure.
          const formatWidth = stave.getWidth() - (currentMeasureIndex === voiceIndex + line * measuresPerLine && line === 0 ? 60 : 30); // Reduce more for first measure overall
          try {
             new VF.Formatter().joinVoices([voice]).format([voice], formatWidth > 0 ? formatWidth : 100); // Ensure positive width, provide fallback
          } catch(e) {
             console.error("Error formatting voice:", e, "Voice Index:", voiceIndex, "Measure Index:", currentMeasureIndex - lineVoices.length + voiceIndex);
          }
          // Draw the voice
          voice.draw(context, stave);
        }
      });
    }

  }, [notes, activeNoteIndex]);

  // Use overflow-x-auto to handle cases where the calculated width exceeds the container
  return <div ref={containerRef} className="overflow-x-auto" />;
};



const Metronome: React.FC<{
  tempo: number;
  setTempo: (tempo: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}> = ({ tempo, setTempo, isPlaying, setIsPlaying }) => {
  useEffect(() => {
    let timer: number | undefined;
    if (isPlaying) {
      timer = window.setInterval(() => {
        const click = new AudioContext();
        const oscillator = click.createOscillator();
        const gainNode = click.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(click.destination);
        
        gainNode.gain.setValueAtTime(0.1, click.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, click.currentTime + 0.05);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, click.currentTime);
        
        oscillator.start();
        oscillator.stop(click.currentTime + 0.05);
      }, (60 / tempo) * 1000);
    }
    return () => clearInterval(timer);
  }, [tempo, isPlaying]);

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={() => setIsPlaying(!isPlaying)}
        className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </Button>
      <input
        type="range"
        min="40"
        max="208"
        value={tempo}
        onChange={(e) => setTempo(Number(e.target.value))}
        className="w-32"
      />
      <span className="text-sm">{tempo} BPM</span>
    </div>
  );
};

const TrumpetPiston: React.FC<{ pressed: boolean }> = ({ pressed }) => (
  <div 
    className={`w-8 h-16 rounded-full border-2 ${
      pressed ? 'bg-blue-500 border-blue-600' : 'bg-white border-gray-300'
    } shadow-md`}
  />
);

const Note: React.FC<{ note: string; isActive: boolean }> = ({ note, isActive }) => {
  const fingering = PISTONS[note] || '000';
  const baseName = note.replace(/[0-9]/g, '');
  const octave = note.match(/[0-9]/)?.[0] || '4';
  const solfegeName = NOTE_NAMES[baseName] + octave;
  
  return (
    <div className={`flex flex-col items-center p-2 ${isActive ? 'bg-blue-100 rounded-lg' : ''}`}>
      <div className="text-lg font-bold mb-2">{solfegeName}</div>
      <div className="flex gap-2">
        {fingering.split('').map((pressed, idx) => (
          <TrumpetPiston key={idx} pressed={pressed === '1'} />
        ))}
      </div>
    </div>
  );
};

const ToneGenerator: React.FC<{ note: string; isPlaying: boolean; volume: number; selectedInstrument: string }> = ({ note, isPlaying, volume, selectedInstrument }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const noteToFrequency = useCallback((note: string): number => {
    const A4 = 440;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = parseInt(note.match(/\d+/)?.[0] || '4', 10);
    const noteName = note.replace(/\d+/, '');
    const semitonesFromA4 = noteNames.indexOf(noteName) - noteNames.indexOf('A') + (octave - 4) * 12;
    const transposedSemitones = semitonesFromA4 + (INSTRUMENTS[selectedInstrument] || 0);
    return A4 * Math.pow(2, transposedSemitones / 12);
  }, [selectedInstrument]);

  useEffect(() => {
    if (isPlaying) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const freq = noteToFrequency(note);
      
      oscillatorRef.current = audioContextRef.current.createOscillator();
      gainNodeRef.current = audioContextRef.current.createGain();
      
      oscillatorRef.current.type = 'triangle';
      oscillatorRef.current.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
      
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
      
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      oscillatorRef.current.start();
    }

    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
    };
  }, [isPlaying, note, volume, selectedInstrument, noteToFrequency]);

  return null;
};

// Main component
const ScalePractice: React.FC = () => {
  const [rootNote, setRootNote] = useState('C');
  const [scaleType, setScaleType] = useState('Majeure');
  const [exerciseType, setExerciseType] = useState('Gamme simple');
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [startOctave, setStartOctave] = useState(4);
  // New state for ranged arpeggios
  const [startNoteRange, setStartNoteRange] = useState('C3'); // Default start note
  const [endNoteRange, setEndNoteRange] = useState('E4');   // Default end note
  const [arpeggioType, setArpeggioType] = useState<'Majeur' | 'Mineur'>('Majeur'); // Default type
  // ---
  const [tempo, setTempo] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.1);
  const [isMuted, setIsMuted] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scalesFavorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [selectedInstrument, setSelectedInstrument] = useState('Trompette (Sib)');

  // Helper to get all notes in a range based on PISTONS availability
  const getAvailableNotesInRange = (startNote: string, endNote: string): string[] => {
    const allPistonNotes = Object.keys(PISTONS);
    
    // Sort piston notes correctly (chromatically and by octave)
    allPistonNotes.sort((a, b) => {
      const octaveA = parseInt(a.match(/\d+/)?.[0] || '0');
      const octaveB = parseInt(b.match(/\d+/)?.[0] || '0');
      if (octaveA !== octaveB) return octaveA - octaveB;

      const noteAIndex = CHROMATIC_NOTES.indexOf(a.replace(/\d+/, ''));
      const noteBIndex = CHROMATIC_NOTES.indexOf(b.replace(/\d+/, ''));
      return noteAIndex - noteBIndex;
    });

    const startIndex = allPistonNotes.indexOf(startNote);
    const endIndex = allPistonNotes.indexOf(endNote);

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      console.error("Invalid note range or notes outside PISTONS definition:", startNote, endNote);
      // Attempt to find closest valid notes if defaults are outside range
      const defaultStartIdx = allPistonNotes.indexOf('C4');
      const defaultEndIdx = allPistonNotes.indexOf('G4');
       if (defaultStartIdx !== -1 && defaultEndIdx !== -1) {
         return allPistonNotes.slice(defaultStartIdx, defaultEndIdx + 1);
       }
      return []; // Return empty if range is invalid or defaults fail
    }

    return allPistonNotes.slice(startIndex, endIndex + 1);
  };


  const generateScale = useMemo(() => {
    // Handle 'Arpèges (Plage)' exercise type
    if (exerciseType === 'Arpèges (Plage)') {
      const notesInRange = getAvailableNotesInRange(startNoteRange, endNoteRange);
      const generatedArpeggios: string[] = [];
      // Major: Root, M3, P5, Octave (intervals 0, 4, 7, 12)
      // Minor: Root, m3, P5, Octave (intervals 0, 3, 7, 12)
      const pattern = arpeggioType === 'Majeur' ? [0, 4, 7, 12] : [0, 3, 7, 12];

      notesInRange.forEach(rootNoteInRange => {
        const noteName = rootNoteInRange.replace(/[0-9]/g, '');
        const octave = parseInt(rootNoteInRange.match(/[0-9]/)?.[0] || '4', 10);
        const rootIdx = CHROMATIC_NOTES.indexOf(noteName);

        if (rootIdx !== -1) {
          const arpeggioNotes = pattern.map(interval => {
            const totalSemitones = rootIdx + interval;
            const noteIdx = totalSemitones % 12;
            const octShift = Math.floor(totalSemitones / 12);
            const calculatedNote = `${CHROMATIC_NOTES[noteIdx]}${octave + octShift}`;
            return calculatedNote;
          });

          // Add the full arpeggio (if notes are valid)
          const validArpeggio = arpeggioNotes.filter(n => PISTONS[n] !== undefined);
          // Ensure we add the complete arpeggio (4 notes) if possible, even if some notes are outside PISTONS range
          // We still filter based on PISTONS, but append the whole group
          if (validArpeggio.length > 0) { // Check if at least the root is valid
             // Add all calculated notes of the arpeggio, even if some are outside PISTONS
             // The NotationView will handle rendering only valid notes if needed,
             // or we rely on the fact that the range selection uses PISTONS keys.
             // Let's stick to adding only notes defined in PISTONS for now to avoid errors.
             generatedArpeggios.push(...validArpeggio);
             // If you want to include notes outside PISTONS (potentially unplayable), use:
             // generatedArpeggios.push(...arpeggioNotes);
          }
        }
      });

      // Return the sequence of arpeggios directly, without filtering duplicates or sorting
      return generatedArpeggios.length > 0 ? generatedArpeggios : [startNoteRange];
    }

    // Original logic for other exercises
    const rootIndex = CHROMATIC_NOTES.indexOf(rootNote);
    // Generate a chromatic scale starting from the root note, spanning two octaves
    const chromaticScale = Array.from({ length: 24 }, (_, i) => {
      const noteIndex = (rootIndex + i) % 12;
      const octaveShift = Math.floor((rootIndex + i) / 12);
      const note = CHROMATIC_NOTES[noteIndex];
      return `${note}${startOctave + octaveShift}`;
    });

    if (exerciseType === 'Quinte-Tonale-Quinte-Octave') {
      return EXERCISE_PATTERNS[exerciseType](chromaticScale);
    }

    // For other exercise types, use the original scale generation logic
    const pattern = SCALE_PATTERNS[scaleType];
    return EXERCISE_PATTERNS[exerciseType](
      pattern.map(interval => chromaticScale[interval])
    );
  }, [rootNote, scaleType, startOctave, exerciseType, startNoteRange, endNoteRange, arpeggioType]); // Added dependencies for the new exercise

  // Prepare sorted list of available notes for dropdowns
  const availableNotes = useMemo(() => {
    const notes = Object.keys(PISTONS);
    notes.sort((a, b) => {
      const octaveA = parseInt(a.match(/\d+/)?.[0] || '0');
      const octaveB = parseInt(b.match(/\d+/)?.[0] || '0');
      if (octaveA !== octaveB) return octaveA - octaveB;
      const noteAIndex = CHROMATIC_NOTES.indexOf(a.replace(/\d+/, ''));
      const noteBIndex = CHROMATIC_NOTES.indexOf(b.replace(/\d+/, ''));
      return noteAIndex - noteBIndex;
    });
    return notes;
  }, []);


  const handleNext = useCallback(() => {
    // Ensure generateScale has notes before trying to get length
    const currentScale = generateScale || [];
    if (currentScale.length === 0) return; // Prevent modulo by zero if scale is empty
    setActiveNoteIndex((prev) => (prev + 1) % currentScale.length);
  }, [generateScale]);

  useEffect(() => {
    let timer: number | undefined;
    if (isPlaying) {
      timer = window.setInterval(handleNext, (60 / tempo) * 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, tempo, handleNext]);

  const saveFavorite = () => {
    const newFavorite: Favorite = {
      rootNote,
      scaleType,
      exerciseType,
      startOctave,
      tempo
    };
    const newFavorites = [...favorites, newFavorite];
    setFavorites(newFavorites);
    if (typeof window !== 'undefined') {
      localStorage.setItem('scalesFavorites', JSON.stringify(newFavorites));
    }
  };

  const loadFavorite = (favorite: Favorite) => {
    setRootNote(favorite.rootNote);
    setScaleType(favorite.scaleType);
    setExerciseType(favorite.exerciseType);
    setStartOctave(favorite.startOctave);
    setTempo(favorite.tempo);
    setActiveNoteIndex(0);
  };

  return (
    <Card className="w-full mx-auto px-4 py-20"> {/* Removed max-w-4xl */}
      <CardHeader>
        <CardTitle>Générateur de Gammes - Trompette</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-2">Tonalité</label>
              <select 
                value={rootNote}
                onChange={(e) => {
                  setRootNote(e.target.value);
                  setActiveNoteIndex(0);
                }}
                className="px-3 py-2 border rounded"
              >
                {CHROMATIC_NOTES.map(note => (
                  <option key={note} value={note}>
                    {NOTE_NAMES[note]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type de gamme</label>
              <select 
                value={scaleType}
                onChange={(e) => {
                  setScaleType(e.target.value);
                  setActiveNoteIndex(0);
                }}
                className="px-3 py-2 border rounded"
              >
                {Object.keys(SCALE_PATTERNS).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type d&apos;exercice</label>
              <select 
                value={exerciseType}
                onChange={(e) => {
                  setExerciseType(e.target.value);
                  setActiveNoteIndex(0);
                }}
                className="px-3 py-2 border rounded"
              >
                {Object.keys(EXERCISE_PATTERNS).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Octave de départ</label>
              <select 
                value={startOctave}
                onChange={(e) => {
                  setStartOctave(Number(e.target.value));
                  setActiveNoteIndex(0);
                }}
                className="px-3 py-2 border rounded"
              >
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
              </select>
            </div>
            <div>
              <label htmlFor="instrument-select" className="block text-sm font-medium mb-2">Instrument</label>
              <select 
                id="instrument-select"
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                {Object.keys(INSTRUMENTS).map(instrument => (
                  <option key={instrument} value={instrument}>{instrument}</option>
                ))}
              </select>
            </div>

            {/* Conditional UI for Arpèges (Plage) */}
            {exerciseType === 'Arpèges (Plage)' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Note de début</label>
                  <select
                    value={startNoteRange}
                    onChange={(e) => {
                      setStartNoteRange(e.target.value);
                      setActiveNoteIndex(0); // Reset index on change
                    }}
                    className="px-3 py-2 border rounded"
                  >
                    {availableNotes.map(note => (
                      <option key={note} value={note}>
                        {NOTE_NAMES[note.replace(/[0-9]/g, '')]}{note.match(/[0-9]/)?.[0]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Note de fin</label>
                  <select
                    value={endNoteRange}
                    onChange={(e) => {
                      setEndNoteRange(e.target.value);
                      setActiveNoteIndex(0); // Reset index on change
                    }}
                    className="px-3 py-2 border rounded"
                  >
                    {availableNotes.map(note => (
                      <option key={note} value={note}>
                        {NOTE_NAMES[note.replace(/[0-9]/g, '')]}{note.match(/[0-9]/)?.[0]}
                      </option>
                    ))}
                  </select>
                 </div>
                  <div>
                   <label className="block text-sm font-medium mb-2">Type d&apos;arpège</label>
                   <select
                     value={arpeggioType}
                    onChange={(e) => {
                      setArpeggioType(e.target.value as 'Majeur' | 'Mineur');
                      setActiveNoteIndex(0); // Reset index on change
                    }}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="Majeur">Majeur</option>
                    <option value="Mineur">Mineur</option>
                  </select>
                </div>
              </>
            )}
             {/* End Conditional UI */}
          </div>


          <div className="border rounded-lg p-4 bg-gray-50">
            <NotationView 
              notes={generateScale} 
              activeNoteIndex={activeNoteIndex} 
            />
          </div>

          <div className="flex justify-between items-center flex-wrap gap-4">
            <Metronome 
              tempo={tempo} 
              setTempo={setTempo}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded bg-gray-200 hover:bg-gray-300"
                title={isMuted ? "Activer le son" : "Couper le son"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
              <div className="flex flex-col gap-1">
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24"
                  title="Volume"
                />
                <span className="text-xs text-gray-500 text-center">
                  Volume: {Math.round(volume * 200)}%
                </span>
              </div>
              <Button
                onClick={saveFavorite}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                title="Sauvegarder dans les favoris"
              >
                <Save size={20} />
                Sauvegarder
              </Button>
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="border rounded p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Favoris</h3>
              <div className="flex gap-2 flex-wrap">
                {favorites.map((fav, idx) => (
                  <Button
                    key={idx}
                    onClick={() => loadFavorite(fav)}
                    className="px-3 py-1 bg-white text-color-primary border rounded hover:bg-gray-100 text-sm"
                  >
                    {NOTE_NAMES[fav.rootNote]} {fav.scaleType} - {fav.exerciseType}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {/* Ensure generateScale is not empty before mapping */}
            {(generateScale && generateScale.length > 0) ? generateScale.map((note, idx) => (
              <Note key={idx} note={note} isActive={idx === activeNoteIndex} />
            )) : <p className="col-span-full text-center text-gray-500">Aucune note à afficher pour cette sélection.</p>}
          </div>

           {/* Ensure generateScale has notes before rendering ToneGenerator */}
          {(generateScale && generateScale.length > 0 && generateScale[activeNoteIndex]) && (
            <ToneGenerator
              note={generateScale[activeNoteIndex]}
              isPlaying={isPlaying && !isMuted}
              volume={volume}
              selectedInstrument={selectedInstrument}
            />
          )}
          
          {/* Buttons Section */}
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setActiveNoteIndex(0);
                setIsPlaying(false);
              }}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Réinitialiser
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Note Suivante
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScalePractice;
