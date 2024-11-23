"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { PlayCircle, RotateCcw, Music2 } from 'lucide-react';

type InstrumentType = 'piano' | 'trumpet';
type NoteType = 'Do' | 'Do#' | 'Ré' | 'Ré#' | 'Mi' | 'Fa' | 'Fa#' | 'Sol' | 'Sol#' | 'La' | 'La#' | 'Si';

interface FrequencyMap {
  [key: string]: number;
}

const EntraineurNote: React.FC = () => {
    const [essaisRestants, setEssaisRestants] = useState<number>(3);
    const [volume, setVolume] = useState<number>(50);
    const [correctes, setCorrectes] = useState<number>(0);
    const [fausses, setFausses] = useState<number>(0);
    const [niveau, setNiveau] = useState<number>(10);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [noteActuelle, setNoteActuelle] = useState<NoteType | null>(null);
    const [derniereClic, setDerniereClic] = useState<NoteType | null>(null);
    const [animation, setAnimation] = useState<boolean>(false);
    const [instrument, setInstrument] = useState<InstrumentType>('piano');
  
    // Initialiser `notes` avec `useMemo`
    const notes: NoteType[] = useMemo(() => [
      'Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa',
      'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'
    ], []);
  

  const frequencesPiano: FrequencyMap = {
    'Do': 261.63, 'Do#': 277.18, 'Ré': 293.66, 'Ré#': 311.13,
    'Mi': 329.63, 'Fa': 349.23, 'Fa#': 369.99, 'Sol': 392.00,
    'Sol#': 415.30, 'La': 440.00, 'La#': 466.16, 'Si': 493.88
  };

  const frequencesTrompette: FrequencyMap = Object.fromEntries(
    Object.entries(frequencesPiano).map(([note, freq]) => [note, freq * 0.8909])
  );


  useEffect(() => {
    const ctx = new (window.AudioContext)();
    setAudioContext(ctx);
    const noteRandom = notes[Math.floor(Math.random() * notes.length)];
    setNoteActuelle(noteRandom);
    return () => {
      ctx.close();
    };
  }, [notes]);
  

  const createTrumpetSound = (
    ctx: AudioContext,
    frequency: number,
    gainNode: GainNode
  ): OscillatorNode => {
    const oscillator = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, ctx.currentTime);
    filter.Q.setValueAtTime(5, ctx.currentTime);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    
    return oscillator;
  };

  const createPianoSound = (
    ctx: AudioContext,
    frequency: number,
    gainNode: GainNode
  ): OscillatorNode => {
    const oscillator = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    
    return oscillator;
  };

  const jouerNote = (note: NoteType): void => {
    if (!audioContext) return;

    const gainNode = audioContext.createGain();
    const freq = instrument === 'piano' ? frequencesPiano[note] : frequencesTrompette[note];
    const oscillator = instrument === 'piano' 
      ? createPianoSound(audioContext, freq, gainNode)
      : createTrumpetSound(audioContext, freq, gainNode);

    const gainValue = (volume / 100) * 0.5;
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(gainValue, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(gainValue * 0.7, audioContext.currentTime + 0.3);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.2);

    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.2);
  };

  const handleNoteClick = (noteChoisie: NoteType): void => {
    setDerniereClic(noteChoisie);
    setTimeout(() => setDerniereClic(null), 300);
    
    jouerNote(noteChoisie);
    
    if (essaisRestants > 0) {
      if (noteChoisie === noteActuelle) {
        setAnimation(true);
        setTimeout(() => setAnimation(false), 1000);
        setCorrectes(prev => prev + 1);
        const nouvelleNote = notes[Math.floor(Math.random() * notes.length)];
        setNoteActuelle(nouvelleNote);
        setEssaisRestants(3);
        setTimeout(() => jouerNote(nouvelleNote), 2000);
      } else {
        setFausses(prev => prev + 1);
        setEssaisRestants(prev => prev - 1);
      }
    }
  };

  const reinitialiserJeu = (): void => {
    setEssaisRestants(3);
    setCorrectes(0);
    setFausses(0);
    const nouvelleNote = notes[Math.floor(Math.random() * notes.length)];
    setNoteActuelle(nouvelleNote);
    setTimeout(() => {
      if (nouvelleNote) jouerNote(nouvelleNote);
    }, 100);
  };

  const getButtonStyle = (note: NoteType): string => {
    let className = "w-full py-3 text-lg transition-all duration-300 ";
    if (derniereClic === note) {
      className += "scale-95 bg-purple-100 ";
    }
    if (note.includes('#')) {
      className += "bg-gray-800 text-white hover:bg-gray-700 ";
    }
    return className;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <Music2 className="w-12 h-12 text-purple-600" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Entraîneur Note Parfaite
        </CardTitle>
        <p className="text-gray-600 text-lg">Écoutez la note et devinez laquelle c&apos;est !</p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex justify-center space-x-4 items-center">
          <div className={`text-2xl font-bold text-purple-600 transition-all duration-300 transform ${animation ? 'scale-125' : 'scale-100'}`}>
            Essais Restants: {essaisRestants}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant={instrument === 'piano' ? 'default' : 'outline'}
            onClick={() => setInstrument('piano')}
            className="w-32"
          >
            Piano (Do)
          </Button>
          <Button
            variant={instrument === 'trumpet' ? 'default' : 'outline'}
            onClick={() => setInstrument('trumpet')}
            className="w-32"
          >
            Trompette (Sib)
          </Button>
        </div>
        
        <div className="grid grid-cols-6 gap-3">
          {notes.slice(0, 6).map((note) => (
            <Button
              key={note}
              variant="outline"
              className={getButtonStyle(note)}
              onClick={() => handleNoteClick(note)}
            >
              {note}
            </Button>
          ))}
        </div>
        
        <div className="grid grid-cols-6 gap-3">
          {notes.slice(6).map((note) => (
            <Button
              key={note}
              variant="outline"
              className={getButtonStyle(note)}
              onClick={() => handleNoteClick(note)}
            >
              {note}
            </Button>
          ))}
        </div>

        <Button 
          className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white transition-all duration-300 transform hover:scale-102"
          onClick={() => noteActuelle && jouerNote(noteActuelle)}
        >
          <PlayCircle className="mr-3 h-6 w-6" />
          Rejouer la Note
        </Button>

        <div className="grid grid-cols-2 gap-6">
          <select 
            className="p-3 border rounded-lg bg-white/50 backdrop-blur-sm text-lg"
            value={niveau}
            onChange={(e) => setNiveau(Number(e.target.value))}
          >
            <option value={10}>Niveau 10</option>
          </select>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Volume</span>
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-gray-700 w-12">{volume}%</span>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 space-y-4">
          <div className="flex justify-between text-lg">
            <div className="text-green-600 font-bold">Correctes: {correctes}</div>
            <div className="text-red-600 font-bold">Fausses: {fausses}</div>
          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
              style={{width: `${(correctes/(correctes+fausses))*100 || 0}%`}}
            />
          </div>
        </div>

        <Button 
          variant="outline"
          className="flex items-center mx-auto py-4 px-8 text-lg hover:bg-purple-50"
          onClick={reinitialiserJeu}
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Réinitialiser
        </Button>
      </CardContent>
    </Card>
  );
};

export default EntraineurNote;