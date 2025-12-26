/* eslint-disable react/no-unescaped-entities */

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';
import questionImage from '@/../public/1.jpg';

export function TeacherSection() {
    return (
        <section id="teacher" className="py-12 md:py-24 bg-white relative overflow-hidden">
            {/* Soft decorative background halos */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-stone-100/50 rounded-full blur-[100px] -ml-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -mr-32 -mb-32 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">

                {/* En-tête de Prestige */}
                <div className="text-center mb-24 space-y-6">
                    <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
                        Le Défi de l'Apprentissage
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight">
                        Trouver un bon professeur <br />
                        <span className="italic text-amber-600">est plus rare qu&apos;on ne le pense</span>
                    </h2>
                    <div className="w-24 h-1.5 bg-amber-600 rounded-full mx-auto opacity-20" />
                </div>

                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Image Case */}
                    <div className="relative order-1 lg:order-1 group">
                        <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] transition-transform duration-500 group-hover:-translate-y-1">
                            <Image
                                src={questionImage}
                                alt="La pédagogie de la trompette"
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                width={600}
                                height={750}
                                sizes="(max-width: 1024px) 100vw, 600px"
                            />
                            <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
                        </div>

                        {/* Interactive accent */}
                        <div className="absolute -top-6 -left-6 w-24 h-24 border-2 border-stone-900 rounded-full -z-10 opacity-10 animate-pulse-slow" />
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -z-10" />
                    </div>

                    {/* Content Column */}
                    <div className="space-y-10 order-2 lg:order-2">
                        <div className="space-y-6">
                            <h3 className="text-2xl md:text-3xl font-serif text-stone-900 leading-snug">
                                On croit à tort que <br />
                                <span className="text-stone-500 font-light italic text-xl md:text-2xl">Bien jouer c'est un "don".</span>
                            </h3>

                            <p className="text-xl text-stone-600 font-light leading-relaxed">
                                La plupart des professeurs jouent merveilleusement bien, mais n&apos;ont aucune idée consciente de <strong className="text-stone-900 font-medium border-b-2 border-amber-500/30">comment ils produisent le son</strong>.
                            </p>

                            <p className="text-lg text-stone-500 font-light leading-relaxed">
                                Ils n&apos;ont souvent aucune méthode reproductible. Ce qui est problématique pour vous : comment apprendre ce qui n&apos;est pas expliqué ?
                            </p>
                        </div>

                        <Card className="bg-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(251,191,36,1)] rounded-[2rem] overflow-hidden relative group/quote">
                            <CardContent className="p-10">
                                <Quote className="absolute top-6 left-6 w-12 h-12 text-stone-100 group-hover/quote:text-amber-100 transition-colors duration-500 -z-0" />
                                <div className="relative z-10">
                                    <p className="text-xl text-stone-700 italic font-light leading-loose">
                                        &ldquo;Quand j&apos;ai commencé, il n&apos;y avait personne pour me guider. J&apos;ai dû tout décoder moi-même. Les bons trompettistes sont rares. Mais les bons professeurs le sont encore plus.&rdquo;
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="pt-4 flex flex-col gap-6">
                            <p className="text-stone-700 leading-relaxed font-medium">
                                C&apos;est cette frustration qui est la genèse de la <span className="text-amber-700 underline decoration-amber-500/30 decoration-2 underline-offset-4">méthode Zone de Génie</span>.
                            </p>

                            <div className="flex items-center gap-4 text-stone-400 text-sm tracking-wide">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                                            <Image
                                                src={`/avatar${i}.png`}
                                                alt={`Student ${i}`}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <span>Rejoignez 150+ trompettistes qui ont déjà franchi le pas.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
