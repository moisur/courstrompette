/* eslint-disable react/no-unescaped-entities */

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export function AboutMethodSection({ locationName }: { locationName?: string }) {
    return (
        <section id="about" className="py-12 md:py-24 bg-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stone-100/50 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">

                {/* En-tête de Prestige */}
                <div className="text-center mb-20 space-y-6">
                    <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
                        Jouer de la trompette sans galère
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight">
                        La méthode Z2G <span className="italic text-amber-600">révolutionne</span> l&apos;apprentissage {locationName && `à ${locationName}`}
                    </h2>
                    <div className="w-24 h-1.5 bg-amber-600 rounded-full mx-auto opacity-30" />
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Visual Case */}
                    <div className="relative group lg:order-2">
                        <div className="absolute -top-6 -right-6 w-full h-full border-2 border-stone-200 rounded-[2.5rem] -z-10" />
                        <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] transition-transform duration-500 group-hover:-translate-y-1 bg-white">
                            <Image
                                src="/trumpet_closeup.webp"
                                alt="Trompette en gros plan - Excellence Technique"
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                width={600}
                                height={750}
                                sizes="(max-width: 768px) calc(100vw - 48px), 600px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent pointer-events-none" />

                            {/* Decorative Badge embedded in image */}
                            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md border border-stone-200 px-6 py-4 rounded-xl shadow-lg max-w-[200px]">
                                <p className="text-sm font-serif italic text-stone-800 leading-tight">
                                    "Demain, la trompette n'aura plus AUCUN secret pour vous."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="space-y-10 lg:order-1">
                        <div className="space-y-8">
                            {/* Key Statement Card */}
                            <div className="relative">
                                <div className="absolute -left-4 top-4 w-1 h-20 bg-amber-500 rounded-full" />
                                <p className="text-xl md:text-2xl font-serif text-stone-800 leading-relaxed italic pl-6">
                                    <span className="first-letter:text-7xl first-letter:font-serif first-letter:text-stone-900 first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:mt-[-8px] first-letter:leading-[0.8]">I</span>
                                    maginez-vous jouant votre premier morceau en <span className="text-stone-900 font-bold bg-amber-100 px-1">10 séances</span>, même si vous n&apos;avez jamais touché une trompette de votre vie.
                                </p>
                            </div>

                            <div className="space-y-6 text-stone-600 text-lg font-light leading-relaxed">
                                <p>
                                    Ça paraît ambitieux ? Pourtant, c&apos;est la réalité de mes élèves.
                                </p>
                                <p>
                                    La méthode Zone de Génie n&apos;est pas un programme miracle — c&apos;est une <strong className="text-stone-900 font-medium">approche millimétrée</strong> où rien n'est laissé au hasard, on élimine 100% des erreurs des débutants, pour vous faire gagner des années de frustration.
                                </p>

                                <Card className="bg-stone-50 border-none shadow-inner p-6 rounded-2xl">
                                    <p className="font-medium text-stone-800">
                                        À chaque étape, je suis là pour décoder le langage de l&apos;instrument avec vous, transformant la technique pure en plaisir musical immédiat.
                                    </p>
                                </Card>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-6 group cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="flex flex-col">
                                <span className="text-xs uppercase tracking-[0.2em] font-bold text-amber-600 mb-1">Vous vous demandez peut-être...</span>
                                <p className="text-stone-900 font-serif text-lg">
                                    Et comment ça se passe ?
                                </p>
                            </div>
                            <div className="w-12 h-px bg-stone-300 group-hover:bg-amber-500 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
