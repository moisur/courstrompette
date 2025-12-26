/* eslint-disable react/no-unescaped-entities */

import { Zap, Brain, Ear, Eye, HandHeart, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const highlights = [
  { keyword: "l'écoute", icon: Ear, color: "text-blue-600", bg: "bg-blue-100" },
  { keyword: "l'observation", icon: Eye, color: "text-emerald-600", bg: "bg-emerald-100" },
  { keyword: "ZEN", icon: HandHeart, color: "text-teal-600", bg: "bg-teal-100" },
  { keyword: "énergie", icon: Zap, color: "text-amber-600", bg: "bg-amber-100" },
];

export default function Puissance() {
  return (
    <section id="puissance" className="py-12 md:py-24 bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-stone-100 rounded-full blur-[100px] -translate-y-1/2 -ml-32 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px] -mt-20 -mr-20 pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">

        {/* En-tête */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-6">
            La Méthode Z2G
          </span>
          <h2 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight">
            La puissance de ce que <span className="italic text-amber-600">je vous offre</span>
          </h2>
          <div className="w-24 h-1.5 bg-amber-600 mx-auto rounded-full opacity-30 mt-6 md:mt-8" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-stretch">

          {/* Colonne Gauche : Contenu */}
          <div className="flex flex-col h-full">
            <Card className="h-full bg-white border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] rounded-[2.5rem] overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-8 md:p-12 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-amber-100 border-2 border-amber-200 rounded-2xl shadow-sm rotate-3 group-hover:rotate-6 transition-transform">
                    <Zap className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-3xl font-serif text-stone-900">
                    L'Excellence Z2G
                  </h3>
                </div>

                <div className="relative">
                  <p className="text-xl md:text-2xl font-serif text-stone-800 leading-relaxed italic pl-6 border-l-4 border-amber-500">
                    <span className="font-bold text-amber-700">20 années d'expertise</span> concentrées en une méthode.
                  </p>
                </div>

                <div className="space-y-6 text-lg text-stone-600 font-light leading-relaxed">
                  <p>
                    <span className="first-letter:text-6xl first-letter:font-serif first-letter:text-stone-900 first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-6px] first-letter:leading-[0.8]">P</span>
                    uissante, elle vous fera progresser <strong className="text-stone-900 font-medium bg-amber-50 px-1">3 fois plus vite</strong> qu'avec
                    les méthodes traditionnelles. Pourquoi ?
                  </p>

                  <p>
                    Parce que j'ai toujours adoré <strong className="text-stone-900 font-medium">enseigner</strong> ce que je savais.
                    J'ai ça dans le sang. Ma méthode est basée sur <strong className="text-stone-900 font-medium underline decoration-amber-400/50 underline-offset-4">l'écoute</strong> et
                    <strong className="text-stone-900 font-medium underline decoration-amber-400/50 underline-offset-4"> l'observation</strong>.
                  </p>

                  <p className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                    <span className="block mb-2 text-stone-900 font-serif text-xl">🚀 Mon super-pouvoir ?</span>
                    Je vois votre cerveau en marche. Je sens vos peurs. Je réponds aux questions
                    que vous n'osez pas demander ou que vous n'arrivez pas à formuler.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne Droite : Citation & Highlights */}
          <div className="flex flex-col h-full space-y-8">

            {/* Citation Card */}
            <div className="relative group flex-grow">
              <div className="absolute -top-4 -right-4 w-full h-full border-2 border-stone-200 rounded-[2.5rem] -z-10" />
              <Card className="h-full relative border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(28,25,23,1)] bg-stone-900 text-white rounded-[2.5rem] overflow-hidden">
                {/* Grainy texture overlay if possible, else simple abstract shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />

                <CardContent className="p-10 md:p-14 flex flex-col justify-center h-full relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-800 border border-stone-700 mb-8 shadow-inner">
                    <Brain className="w-8 h-8 text-amber-400" />
                  </div>

                  <blockquote className="text-2xl md:text-3xl font-serif italic leading-relaxed mb-8 text-stone-100">
                    <span className="text-amber-500 opacity-40 text-6xl absolute -translate-x-6 -translate-y-4">"</span>
                    Je suis passé par là ! Je connais tout ça par cœur. Éloignons-nous de l'angoisse. Concentrons-nous sur <span className="text-amber-400 font-medium">l'essentiel</span>.
                  </blockquote>
                  <p className="text-lg text-stone-400 font-light">
                    Plus que du mindset, c'est <strong className="text-stone-200">énergétique</strong>. Ma méthode est un équilibre subtil entre <strong className="text-amber-400">ZEN</strong> et <strong className="text-amber-400">énergie</strong>.
                    <br />
                    <span className="block mt-4 text-sm uppercase tracking-widest text-stone-500 font-bold">- La touche JC Yervant</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {highlights.map((item, index) => (
                <div key={index} className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-2xl border-2 border-stone-200 hover:border-amber-400 hover:bg-white transition-colors group cursor-default">
                  <div className={`p-3 rounded-xl mb-3 ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="font-serif font-bold text-stone-700">{item.keyword}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
