"use client"

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Save, Volume2, VolumeX } from 'lucide-react';
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
    for (let i = 0; i < scale.length; i++) {
      const tonale = scale[i];
      const quinteIndex = (i - 7 + scale.length) % scale.length;
      const octaveIndex = (i - 12 + scale.length) % scale.length;
      const quinte = scale[quinteIndex];
      const octave = scale[octaveIndex];
      result.push(quinte, tonale, quinte, octave);
    }
    return result;
  }
};

const INSTRUMENTS: { [key: string]: number } = {
  'Trompette (Sib)': -2,
  'Saxophone Alto (Mib)': -9,
  'Instrument en Do': 0,
};

// Sub-components
const NotationView: React.FC<{ notes: string[]; activeNoteIndex: number }> = ({ notes, activeNoteIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const VF = Vex.Flow;
    
    // Calculate dimensions
    const measuresCount = Math.ceil(notes.length / 4);
    const width = Math.max(600, measuresCount * 250); // 250px per measure
    const height = 150;

    const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    context.setFont('Arial', 10, 400).setBackgroundFillStyle('#eed');

    const staves: Vex.Flow.Stave[] = [];

    const voices: Vex.Flow.Voice[] = [];

    for (let i = 0; i < measuresCount; i++) {
      const stave = new VF.Stave(i * 250, 0, 250);
      if (i === 0) {
        stave.addClef('treble').addTimeSignature('4/4');
      }
      stave.setContext(context).draw();
      staves.push(stave);

      const measureNotes = notes.slice(i * 4, (i + 1) * 4);
      const vexNotes = measureNotes.map((note, idx) => {
        const globalIdx = i * 4 + idx;
        const noteName = note.replace(/[0-9]/, '').replace('#', '#');
        const octave = note.match(/[0-9]/)?.[0] || '4';
        const vexNote = new VF.StaveNote({ clef: "treble", keys: [`${noteName}/${octave}`], duration: "q" });

        if (globalIdx === activeNoteIndex) {
          vexNote.setStyle({ fillStyle: "#2196f3", strokeStyle: "#2196f3" });
        }

        if (noteName.includes('#')) {
          vexNote.addModifier(new VF.Accidental("#"));
        }
        return vexNote;
      });

      // Pad with rests if necessary
      while (vexNotes.length < 4) {
        vexNotes.push(new VF.StaveNote({ clef: "treble", keys: ["b/4"], duration: "qr" }));
      }

      const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
      voice.addTickables(vexNotes);
      voices.push(voice);
    }

    const formatter = new VF.Formatter();
    voices.forEach((voice, i) => {
      formatter.joinVoices([voice]);
      formatter.formatToStave([voice], staves[i]);
    });

    voices.forEach((voice, i) => {
      voice.draw(context, staves[i]);
    });

  }, [notes, activeNoteIndex]);

  return <div ref={containerRef} className="w-full overflow-x-auto" />;
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

  const generateScale = useMemo(() => {
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
  }, [rootNote, scaleType, startOctave, exerciseType]);

  const handleNext = useCallback(() => {
    setActiveNoteIndex((prev) => (prev + 1) % generateScale.length);
  }, [generateScale.length]);

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
    <Card className="w-full max-w-4xl mx-auto px-4 py-20">
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
            {generateScale.map((note, idx) => (
              <Note key={idx} note={note} isActive={idx === activeNoteIndex} />
            ))}
          </div>

          <ToneGenerator 
            note={generateScale[activeNoteIndex]} 
            isPlaying={isPlaying && !isMuted} 
            volume={volume}
            selectedInstrument={selectedInstrument}
          />
          
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

