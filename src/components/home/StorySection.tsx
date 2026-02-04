/* eslint-disable react/no-unescaped-entities */

import Image from 'next/image';
import profMat from '@/../public/2.webp';

export function StorySection() {
    return (
        <section id="story" className="py-12 md:py-24 bg-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-stone-100/50 rounded-full blur-[100px] -ml-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] -mr-20 -mb-20 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Visual Side */}
                    <div className="relative group order-2 lg:order-1">
                        <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] transition-transform duration-500 group-hover:-translate-y-1">
                            <Image
                                src={profMat}
                                alt="L'histoire de la méthode Z2G"
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                width={600}
                                height={750}
                                sizes="(max-width: 768px) calc(100vw - 48px), 600px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent pointer-events-none" />
                        </div>

                        {/* Decorative Quote Badge */}
                        <div className="absolute -bottom-6 -right-6 md:-right-10 bg-white border-2 border-stone-900 px-6 py-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] z-20 max-w-xs hidden md:block">
                            <p className="text-sm font-serif italic text-stone-800">
                                "La méthode qui a changé la donne."
                            </p>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="space-y-8 order-1 lg:order-2">
                        <div className="space-y-6">
                            <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
                                L'Histoire
                            </span>
                            <h2 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight">
                                Comment est née la <span className="italic text-amber-600">méthode Z2G</span>
                            </h2>
                            <div className="w-24 h-1.5 bg-amber-600 rounded-full opacity-30" />
                        </div>

                        <div className="space-y-6 text-lg text-stone-600 font-light leading-relaxed">
                            <p className="first-letter:text-7xl first-letter:font-serif first-letter:text-stone-900 first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:mt-[-8px] first-letter:leading-[0.8]">
                                Tout a commencé en aidant le meilleur ami de mon petit frère.
                            </p>

                            <p>
                                En l'aidant, j'ai compris que j'avais un don pour enseigner la trompette.
                                Plus je lui donnais mes "secrets", plus il progressait rapidement.
                            </p>

                            <div className="bg-stone-50 border-l-4 border-amber-500 p-6 my-8 rounded-r-xl">
                                <p className="text-stone-800 italic font-medium">
                                    Incroyable de voir qu'en quelques séances, il réussissait à faire ce que j'avais mis des années à maîtriser.
                                </p>
                            </div>

                            <p>
                                Et systématiquement, quand je partageais ma méthode avec mes proches, ils apprenaient à une vitesse <strong className="font-bold text-stone-900 bg-amber-100 px-1">déconcertante</strong>.
                            </p>

                            <p className="font-medium text-stone-900 pt-2">
                                J'ai donc décidé de partager la méthode Z2G au plus grand nombre.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
