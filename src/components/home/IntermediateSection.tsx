/* eslint-disable react/no-unescaped-entities */

import { Card, CardContent } from '@/components/ui/card';
import { Target, Music, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assumant que vous avez un composant Button

const comparisons = [
    {
        bad: "L'instruction vague",
        detailBad: '"Supporte plus l\'air"',
        good: 'La précision chirurgicale',
        detailGood: 'Exercices ciblés de 15 min/jour',
        icon: Target,
    },
    {
        bad: "L'ennui académique",
        detailBad: "Étude #47 du Arban",
        good: 'Le plaisir musical',
        detailGood: 'Jazz, Pop ou Classique — tes choix',
        icon: Music,
    },
    {
        bad: "L'observation passive",
        detailBad: 'Un prof qui joue devant toi',
        good: 'La correction active',
        detailGood: 'Feedback et ajustement en temps réel',
        icon: Eye,
    },
];

export function IntermediateSection() {
    return (
        <section id="intermediates" className="py-12 md:py-24 bg-white relative overflow-hidden">
            {/* Soft decorative background element */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] -ml-64 -mt-64 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-6xl relative z-10">

                {/* En-tête de section Premium - Version Claire */}
                <div className="text-center mb-20 space-y-6">
                    <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
                        Niveau Intermédiaire (3-5 ans)
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif text-stone-900 tracking-tight leading-tight">
                        Élevez vos standards. <br />
                        <span className="italic text-amber-600 font-light">Oubliez les comptines.</span>
                    </h2>
                    <div className="w-24 h-1.5 bg-amber-600 rounded-full mx-auto opacity-20 mb-8" />
                    <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
                        Vous n&apos;êtes plus un débutant. Votre pédagogie ne devrait pas l&apos;être non plus.
                        Passez de la répétition aveugle à la progression structurée.
                    </p>
                </div>

                {/* Grille de comparaison stylisée - Version Claire */}
                <div className="grid md:grid-cols-3 gap-10 mb-24">
                    {comparisons.map((item, index) => (
                        <Card
                            key={index}
                            className="bg-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(251,191,36,1)] hover:shadow-[10px_10px_0px_0px_rgba(251,191,36,1)] transition-all duration-300 group rounded-[2rem] overflow-hidden"
                        >
                            <CardContent className="p-10 flex flex-col items-center text-center h-full">
                                {/* Icône modernisée */}
                                <div className="mb-8 p-5 bg-stone-50 rounded-2xl border border-stone-200 group-hover:bg-amber-50 group-hover:border-amber-200 transition-all duration-500 group-hover:rotate-6">
                                    <item.icon className="w-8 h-8 text-stone-400 group-hover:text-amber-600 transition-colors" />
                                </div>

                                {/* Le "Avant" - Désaturé */}
                                <div className="mb-8 w-full">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-3 block">
                                        Ancien système
                                    </span>
                                    <p className="text-stone-400 text-base font-light italic line-through decoration-stone-200">
                                        &ldquo;{item.detailBad}&rdquo;
                                    </p>
                                </div>

                                {/* Separator stylisé */}
                                <div className="relative w-full h-px bg-stone-100 mb-8">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-stone-200 p-1 rounded-full group-hover:border-amber-500 transition-colors animate-bounce-slow">
                                        <ArrowRight className="w-3 h-3 text-stone-300 group-hover:text-amber-500 rotate-90" />
                                    </div>
                                </div>

                                {/* Le "Maintenant" - Éclatant */}
                                <div className="w-full">
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-3 block">
                                        Méthode Z2G
                                    </span>
                                    <p className="text-stone-900 font-serif text-2xl leading-snug">
                                        {item.detailGood}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Section Engagement Personnel (On garde le fond sombre pour l'impact, mais dans un conteneur plus aéré) */}
                <div className="relative rounded-[2.5rem] overflow-hidden bg-stone-900 text-white p-12 md:p-20 text-center shadow-2xl border border-stone-800">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full mb-10 tracking-widest uppercase">
                            Garantie de Résultats
                        </span>

                        <h3 className="text-3xl md:text-5xl font-serif text-white mb-10 leading-tight">
                            Mon engagement <span className="italic text-amber-100">personnel</span>
                        </h3>

                        <blockquote className="text-xl md:text-3xl text-stone-200 font-light italic mb-14 max-w-4xl mx-auto leading-relaxed">
                            &ldquo;Si vous ne gagnez pas au moins <span className="text-amber-400 font-medium not-italic border-b-2 border-amber-500/30 pb-1">3 notes de tessiture</span> en 10 séances, je vous rembourse intégralement.&rdquo;
                        </blockquote>

                        <div className="flex flex-col items-center gap-10">
                            <a href="#booking">
                                <button className="bg-white text-stone-900 hover:bg-stone-50 px-10 py-5 rounded-full font-bold transition-all duration-300 border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(251,191,36,1)] hover:shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] text-xl flex items-center gap-4 group/btn">
                                    Débloquer mon plateau
                                    <ArrowRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-2" />
                                </button>
                            </a>

                            <p className="text-stone-500 text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-4">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Places limitées • Accompagnement Premium
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}