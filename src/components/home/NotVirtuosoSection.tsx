/* eslint-disable react/no-unescaped-entities */

import { Check, Quote, CircleHelp, CloudRain, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function NotVirtuosoSection() {
    return (
        <section className="py-12 md:py-24 bg-white text-stone-900 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-stone-100/60 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-6xl relative z-10">

                {/* En-tête : Approche philosophique */}
                <div className="text-center mb-16 md:mb-24">
                    <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-6">
                        Au début, même Miles Davis était nul.
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif text-stone-900 mb-6 leading-tight">
                        Ne cherchez pas un Virtuose.<br />
                        <span className="text-stone-400 italic">Cherchez un Pédagogue.</span>
                    </h2>
                    <div className="w-24 h-1.5 bg-amber-600 mx-auto rounded-full opacity-30"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
                    {/* Colonne Gauche : L'argumentaire sophistiqué */}
                    <div className="space-y-8 text-lg leading-relaxed text-stone-600 font-light">
                        <p className="first-letter:text-7xl first-letter:font-serif first-letter:text-stone-900 first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:mt-[-8px] first-letter:leading-[0.8]">
                            Il y a une vérité inconfortable dans le monde de la musique : les plus grands interprètes sont
                            <span className="font-semibold text-stone-900 bg-amber-100 px-1">rarement les meilleurs professeurs.</span>
                        </p>
                        <p>
                            Pour le virtuose naturel, jouer est instinctif. Il ne réfléchit pas à la position de sa langue ou à la pression de ses lèvres. Il le <em>fait</em>, simplement.
                        </p>
                        <p>
                            C'est admirable sur scène, mais ne prenez jamais de cours avec lui. Quand vous bloquerez, il ne pourra pas vous aider, car il n'a jamais rencontré votre problème.
                        </p>

                        <div className="bg-white border-l-4 border-amber-500 pl-6 py-4 shadow-sm">
                            <p className="font-medium text-stone-800 italic">
                                Mon seul objectif est de vous apporter une méthode implacable. Un chemin qui vous garantira la réussite avec la précision d'un ingénieur.
                            </p>
                        </div>
                    </div>

                    {/* Colonne Droite : Preuve sociale stylisée */}
                    <div className="relative group">
                        <div className="absolute -top-6 -left-6 text-amber-500/20 transform -rotate-12 transition-transform duration-500 group-hover:-rotate-6">
                            <Quote size={100} strokeWidth={1} fill="currentColor" />
                        </div>

                        <div className="relative bg-white border-2 border-stone-900 rounded-[2.5rem] p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] hover:shadow-[10px_10px_0px_0px_rgba(251,191,36,1)] transition-all duration-300">
                            <p className="text-stone-700 italic mb-8 text-lg md:text-xl font-medium leading-relaxed">
                                "Mon ancien prof jouait l'étude parfaitement, me regardait et disait : 'Fais comme ça, chante dans ta tête'. <br /><br />
                                C'était frustrant. Ici, on ne me demande pas d'imiter, on m'explique <strong>comment fonctionne mon corps</strong>."
                            </p>
                            <footer className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-white font-bold text-sm border-2 border-amber-500">
                                    TB
                                </div>
                                <div>
                                    <div className="text-base font-bold text-stone-900">Thomas B.</div>
                                    <div className="text-xs text-amber-600 font-bold uppercase tracking-wider">Élève Intermédiaire</div>
                                </div>
                            </footer>
                        </div>
                    </div>
                </div>

                {/* Section Comparaison : "L'Approche Analytique" */}
                <div className="bg-white rounded-[3rem] border-2 border-stone-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                    <div className="grid md:grid-cols-2">
                        {/* Approche Traditionnelle */}
                        <div className="p-8 md:p-16 bg-stone-50/50 border-r-0 md:border-r-2 border-b-2 md:border-b-0 border-dashed border-stone-200">
                            <h3 className="text-2xl font-serif mb-6 text-stone-400">L'approche traditionnelle</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4 opacity-70 hover:opacity-100 transition-opacity group">
                                    <div className="mt-1 min-w-[32px] p-1.5 bg-stone-200 rounded-lg group-hover:bg-amber-100 transition-colors">
                                        <CircleHelp className="w-5 h-5 text-stone-500 group-hover:text-amber-600" />
                                    </div>
                                    <span className="text-stone-500 font-medium pt-1">"Utilise plus d'air" <span className="text-sm text-stone-400 block font-normal">(Galère...)</span></span>
                                </li>
                                <li className="flex items-start gap-4 opacity-70 hover:opacity-100 transition-opacity group">
                                    <div className="mt-1 min-w-[32px] p-1.5 bg-stone-200 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        <CloudRain className="w-5 h-5 text-stone-500 group-hover:text-blue-600" />
                                    </div>
                                    <span className="text-stone-500 font-medium pt-1">"Soutiens la note" <span className="text-sm text-stone-400 block font-normal">(Triste...)</span></span>
                                </li>
                                <li className="flex items-start gap-4 opacity-70 hover:opacity-100 transition-opacity group">
                                    <div className="mt-1 min-w-[32px] p-1.5 bg-stone-200 rounded-lg group-hover:bg-red-100 transition-colors">
                                        <ShieldAlert className="w-5 h-5 text-stone-500 group-hover:text-red-600" />
                                    </div>
                                    <span className="text-stone-500 font-medium pt-1">"Écoute et répète" <span className="text-sm text-stone-400 block font-normal">(Énervé !)</span></span>
                                </li>
                            </ul>
                        </div>

                        {/* Mon Diagnostic */}
                        <div className="p-8 md:p-16 bg-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                            <h3 className="text-2xl font-serif mb-6 text-stone-900 flex items-center gap-3">
                                Mon diagnostic analytique
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">Unique</span>
                            </h3>
                            <ul className="space-y-8 relative z-10">
                                <li className="flex items-start gap-4 group">
                                    <div className="mt-1 bg-amber-100 p-1.5 rounded-full border border-amber-200 group-hover:scale-110 transition-transform duration-300">
                                        <Check className="w-4 h-4 text-amber-700" />
                                    </div>
                                    <div>
                                        <strong className="text-stone-900 block mb-1 text-lg">Localisation précise</strong>
                                        <span className="text-stone-500 text-sm leading-relaxed">Je vous montre exactement où votre colonne d'air se verrouille.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 group">
                                    <div className="mt-1 bg-amber-100 p-1.5 rounded-full border border-amber-200 group-hover:scale-110 transition-transform duration-300">
                                        <Check className="w-4 h-4 text-amber-700" />
                                    </div>
                                    <div>
                                        <strong className="text-stone-900 block mb-1 text-lg">Micro-ajustements</strong>
                                        <span className="text-stone-500 text-sm leading-relaxed">3 corrections physiques invisibles qui débloquent votre registre.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 group">
                                    <div className="mt-1 bg-amber-100 p-1.5 rounded-full border border-amber-200 group-hover:scale-110 transition-transform duration-300">
                                        <Check className="w-4 h-4 text-amber-700" />
                                    </div>
                                    <div>
                                        <strong className="text-stone-900 block mb-1 text-lg">Compréhension biomécanique</strong>
                                        <span className="text-stone-500 text-sm leading-relaxed">Pourquoi votre corps vous sabote et comment le reprogrammer.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-20 max-w-3xl mx-auto">
                    <p className="text-stone-600 italic text-xl md:text-2xl font-serif leading-relaxed">
                        "Le talent s'admire. La technique s'enseigne. <br />
                        La méthode Z2G c'est de la <span className="text-stone-900 font-bold bg-amber-100 px-2 decoration-amber-400 decoration-2 underline-offset-4">mécanique de précision</span>."
                    </p>
                </div>

            </div>
        </section>
    );
}
