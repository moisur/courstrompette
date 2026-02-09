"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Music2,
  Volume2,
  TrendingUp,
  Headphones,
  Target,
  Zap,
  Hand,
  BookOpen,
  Sparkles
} from 'lucide-react';

const aspects = [
  { icon: Music2, label: 'Rythme', description: 'Maîtriser le tempo et la pulsation', delay: 0 },
  { icon: Volume2, label: 'Pose du son', description: 'Produire un son clair et stable', delay: 0.1 },
  { icon: TrendingUp, label: 'Graves & Aigus', description: 'Étendre votre tessiture', delay: 0.2 },
  { icon: Headphones, label: 'Écoute', description: 'Développer votre oreille musicale', delay: 0.3 },
  { icon: Target, label: 'Justesse', description: 'Jouer chaque note avec précision', delay: 0.4 },
  { icon: Zap, label: 'Vitesse', description: 'Passages rapides et fluides', delay: 0.5 },
  { icon: Hand, label: 'Doigtés', description: 'Automatiser les combinaisons', delay: 0.6 },
  { icon: BookOpen, label: 'Lecture', description: 'Déchiffrer les partitions', delay: 0.7 },
  { icon: Sparkles, label: 'Improvisation', description: 'Libérer votre créativité', delay: 0.8 },
];

export default function Mission() {
  return (
    <section className="py-16 md:py-32 bg-white relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-50/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">

        {/* En-tête */}
        <div className="text-center mb-24">
          <span className="text-amber-700 font-medium tracking-[0.3em] text-sm uppercase mb-4 block animate-fade-in-up">
            Ma Mission
          </span>
          <h2
            className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight mb-8 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            Vous accompagner à jouer <br />
            <span className="italic text-stone-500">de la trompette</span>
          </h2>

          <div
            className="w-24 h-1 bg-amber-600 mx-auto rounded-full opacity-60 mb-12 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          />

          {/* Promesse */}
          <div
            className="max-w-2xl mx-auto bg-stone-50 p-10 rounded-[2.5rem] border border-stone-100 shadow-sm animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <p className="text-stone-500 mb-2 uppercase tracking-widest text-xs font-medium">La promesse ultime</p>
            <p className="text-2xl md:text-3xl font-serif text-stone-900 leading-relaxed">
              Jouer vos premiers morceaux en <br />
              <span className="text-amber-700 italic font-medium underline underline-offset-8 decoration-amber-300">seulement 10 séances</span>
            </p>
          </div>
        </div>

        {/* Aspects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aspects.map((aspect, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${100 + aspect.delay * 1000}ms` }}
            >
              <Card className="group h-full border border-amber-100 bg-white hover:-translate-y-2 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 rounded-[2rem] overflow-hidden cursor-default">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    {/* Glow is now permanent */}
                    <div className="absolute inset-0 bg-amber-100 rounded-2xl scale-125 blur-xl opacity-80 group-hover:scale-150 group-hover:opacity-100 transition-all duration-700" />

                    {/* Icon Container is now more intense by default */}
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center transition-all duration-500 border border-amber-200 group-hover:border-amber-500 group-hover:shadow-amber-100">
                      <aspect.icon className="w-8 h-8 text-amber-700 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                    </div>

                    {/* New hover shine effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-20 pointer-events-none" />
                  </div>

                  <h3 className="text-xl font-serif text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">
                    {aspect.label}
                  </h3>
                  <p className="text-stone-500 font-light leading-relaxed">
                    {aspect.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
