/* eslint-disable react/no-unescaped-entities */

import { Card, CardContent } from "@/components/ui/card";
import { Eye, Zap, Wind, Music } from 'lucide-react';

const features = [
    {
        icon: Eye,
        title: "Écoute et Observation",
        accent: "Diagnostic instantané",
        description: "Dès que quelque chose cloche, je le vois immédiatement et vous permets de corriger à la seconde près."
    },
    {
        icon: Zap,
        title: "Équilibre ZEN et Énergie",
        accent: "Maîtrise corporelle",
        description: "Un équilibre subtil entre détente et explosion. Vous saurez enfin comment utiliser votre corps pour produire un son parfait."
    },
    {
        icon: Wind,
        title: "Les Secrets du Souffle",
        accent: "Contre-intuitif",
        description: "N'écoutez pas votre propre son. Ignorez le feedback. Concentrez vos forces. Apprenez à jouer sans partitions."
    }
];

export function MethodFeaturesSection() {
    return (
        <section id="method-features" className="py-12 md:py-24 bg-stone-50 relative overflow-hidden">
            {/* Ambient Background & Decorative Curves */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stone-200/40 rounded-full blur-[120px] pointer-events-none" />

            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 20 Q 25 10 50 20 T 100 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-stone-900" />
                    <path d="M0 50 Q 25 40 50 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-stone-900" />
                    <path d="M0 80 Q 25 70 50 80 T 100 80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-stone-900" />
                </svg>
            </div>

            {/* Decorative Musical Notes */}
            <div className="absolute top-20 left-[10%] text-amber-600/10 -rotate-12 pointer-events-none">
                <Music size={120} />
            </div>
            <div className="absolute bottom-40 right-[5%] text-amber-600/5 rotate-45 pointer-events-none">
                <Music size={180} />
            </div>
            <div className="absolute top-1/2 left-[5%] text-stone-900/5 rotate-12 pointer-events-none">
                <Music size={80} />
            </div>

            <div className="container mx-auto px-6 max-w-6xl relative z-10">

                {/* En-tête */}
                <div className="text-center mb-20 space-y-6">
                    <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
                        Les Piliers de la Réussite
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight text-center">
                        Votre passeport vers l'<span className="italic text-amber-600">excellence</span>
                    </h2>
                    <div className="w-24 h-1.5 bg-amber-600 rounded-full mx-auto opacity-20" />
                    <p className="text-xl text-stone-600 max-w-3xl mx-auto font-light leading-relaxed">
                        En seulement 10 séances, transformez radicalement votre approche de la trompette grâce à ces trois piliers fondamentaux.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-10 lg:gap-12 mb-16">
                    {features.map((feature, index) => (
                        <Card key={index} className="bg-white/80 backdrop-blur-sm border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(251,191,36,1)] hover:shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] transition-all duration-300 group rounded-[2.5rem] overflow-hidden">
                            <CardContent className="p-10 flex flex-col h-full">
                                <div className="p-4 bg-white border-2 border-stone-900 rounded-2xl w-fit mb-8 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transition-all duration-300">
                                    <feature.icon className="w-8 h-8 text-amber-600" />
                                </div>

                                <span className="text-amber-600 text-xs font-bold tracking-widest uppercase mb-3 text-left">
                                    {feature.accent}
                                </span>

                                <h3 className="text-2xl font-serif text-stone-900 mb-6 leading-tight group-hover:text-amber-700 transition-colors text-left">
                                    {feature.title}
                                </h3>

                                <p className="text-stone-600 leading-relaxed text-lg font-light text-left">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Footer message */}
                <div className="text-center pt-8 border-t border-stone-200">
                    <p className="text-stone-400 italic text-lg text-center">
                        Et ce n'est que <span className="text-amber-600 font-medium not-italic underline decoration-amber-500/20 underline-offset-4">0.01%</span> de ce que je vais vous offrir.
                    </p>
                </div>
            </div>
        </section>
    );
}
