"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Rocket, Brain, Users, ArrowRight } from 'lucide-react';

const methods = [
  {
    icon: Rocket,
    title: "Apprentissage progressif",
    description: "Mon approche unique vous propulse de débutant à musicien accompli en un temps record. Votre premier morceau est à portée de main !",
    color: "from-amber-500/10 to-transparent",
    iconColor: "text-amber-600"
  },
  {
    icon: Brain,
    title: "Clarté Mentale",
    description: "Découvrez les secrets que j'ai mis des années à développer pour vous permettre de progresser facilement. Sans galèrer et surtout sans vous décourager.",
    color: "from-stone-500/10 to-transparent",
    iconColor: "text-stone-700"
  },
  {
    icon: Users,
    title: "Des centaines d'élèves déjà formés",
    description: "Rejoignez les centaines d'élèves déjà formés, ne laissez pas le temps filer. Votre aventure musicale commence maintenant !",
    color: "from-amber-600/10 to-transparent",
    iconColor: "text-amber-800"
  }
];

export default function Method() {
  return (
    <section className="py-16 md:py-32 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-amber-100 blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-stone-100 blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <span className="text-amber-700 font-medium tracking-[0.2em] text-sm uppercase mb-4 block animate-fade-in-up">
              Avec les vrais secrets, 100 % des élèves progressent
            </span>
            <h2
              className="text-4xl md:text-6xl font-serif text-stone-900 leading-[1.1] animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              Apprendre la trompette <br />
              <span className="italic text-stone-500">c&apos;est facile !</span>
            </h2>
          </div>

          <div
            className="hidden md:block pb-2 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <p className="text-stone-500 max-w-xs text-lg leading-relaxed border-l-2 border-amber-200 pl-6">
              La méthode Z2G c&apos;est des <span className="text-stone-900 font-medium italic">centaines</span> d&apos;élèves facilement qui progressent chaque année.
            </p>
          </div>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          {methods.map((method, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Card className="h-full border border-amber-100 bg-white hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 group rounded-[2rem] overflow-hidden">
                <CardContent className="p-8 md:p-10 flex flex-col h-full relative">
                  {/* Persistent Subtle shadow/glow */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-50 rounded-full blur-[60px] opacity-40 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="relative z-10">
                    <div className="mb-8 inline-flex relative">
                      {/* Glow behind icon */}
                      <div className="absolute inset-0 bg-amber-100 rounded-2xl blur-xl scale-110 group-hover:scale-150 transition-transform duration-500" />

                      <div className="relative z-10 p-3 md:p-4 rounded-2xl bg-white shadow-md border border-amber-100 group-hover:border-amber-300 group-hover:scale-110 transition-all duration-500 ease-out">
                        <method.icon className={`w-8 h-8 md:w-10 h-10 ${method.iconColor} transition-colors duration-500`} />
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-serif text-stone-900 mb-4 md:mb-6 group-hover:text-amber-800 transition-colors duration-300">
                      {method.title}
                    </h3>

                    <p className="text-stone-600 leading-relaxed text-base md:text-lg mb-6 md:mb-8 font-light">
                      {method.description}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center text-amber-700 group-hover:text-amber-900 font-medium transition-colors duration-300 gap-2">
                    <span className="text-sm uppercase tracking-wider translate-x-0 transition-all duration-500">
                      En savoir plus
                    </span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Call to action text below grid */}
        <div
          className="mt-20 text-center animate-fade-in-up"
          style={{ animationDelay: '600ms' }}
        >
          <p className="text-stone-400 text-sm tracking-widest uppercase">
            Basé à Paris • Coaching Personnalisé • Succès Garanti
          </p>
        </div>
      </div>
    </section>
  );
}
