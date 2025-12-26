/* eslint-disable react/no-unescaped-entities */

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import pkoi from '@/../public/3.jpeg';

const benefits = [
    "Un accompagnement patient et professionnel",
    "Des conseils techniques précis et applicables",
    "Une progression structurée, étape par étape",
    "L'assurance de ne pas développer de mauvaises habitudes"
];

export function WhyMethodSection() {
    return (
        <section id="why-method" className="py-12 md:py-24 bg-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-stone-100/50 rounded-full blur-[100px] -ml-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] -mr-20 -mb-20 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">

                {/* En-tête */}
                <div className="text-center mb-20">
                    <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-6">
                        La méthode Zone de Génie
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight">
                        Pourquoi choisir la <span className="italic text-amber-600">méthode Z2G</span>
                    </h2>
                    <div className="w-24 h-1.5 bg-amber-600 mx-auto rounded-full opacity-30 mt-6 md:mt-8" />
                </div>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Image */}
                    <div className="relative group">
                        <div className="absolute -top-6 -left-6 w-full h-full border-2 border-stone-200 rounded-[2.5rem] -z-10" />
                        <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] transition-transform duration-500 group-hover:-translate-y-1">
                            <Image
                                src={pkoi}
                                alt="Pourquoi choisir la méthode Z2G"
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                width={600}
                                height={750}
                                sizes="(max-width: 768px) 100vw, 600px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent pointer-events-none" />
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-serif text-stone-900 leading-tight mb-6">
                                En voulant tout faire seul, on perds un temps précieux.
                            </h3>
                            <div className="text-lg text-stone-600 font-light leading-relaxed">
                                <p className="first-letter:text-7xl first-letter:font-serif first-letter:text-stone-900 first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:mt-[-8px] first-letter:leading-[0.8]">
                                    J'ai vécu cela au début. C'était frustrant de ne pas trouver un professeur
                                    pour m'aiguiller. Têtu, j'ai tout fait tout seul. Je connais bien ce chemin
                                    semé d'embûches.
                                </p>
                            </div>
                        </div>

                        <Card className="p-8 bg-white border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(251,191,36,1)] rounded-[2rem]">
                            <p className="text-stone-800 italic font-medium mb-6 text-lg border-l-4 border-amber-500 pl-4">
                                "Mais franchement, qu'est-ce que j'aurais aimé trouver un guide comme moi..."
                            </p>
                            <ul className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-start gap-4 group">
                                        <div className="mt-0.5 bg-amber-100 p-1 rounded-full border border-amber-200 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                            <Check className="w-4 h-4 text-amber-700 group-hover:text-white" />
                                        </div>
                                        <span className="text-stone-700 font-medium group-hover:text-stone-900 transition-colors">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <div className="pt-2">
                            <p className="text-xl font-serif text-stone-900">
                                La méthode Zone de Génie <span className="bg-amber-100 px-2 decoration-amber-400 decoration-2 underline-offset-4 font-bold">garanti</span> l'apprentissage de la trompette.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
