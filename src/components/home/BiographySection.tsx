/* eslint-disable react/no-unescaped-entities */

import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Music, Globe, Users, Mic } from 'lucide-react';
import jc1 from "@/../public/jc.webp";

const credentials = [
    {
        icon: Music,
        text: "20 ans d'expérience en tant que trompettiste autodidacte"
    },
    {
        icon: Globe,
        text: "Tournées en Pologne, Allemagne, Belgique, Espagne, Pays-Bas et France"
    },
    {
        icon: Mic,
        text: "Des centaines de spectacles de rue — un apprentissage terrain unique"
    },
    {
        icon: Users,
        text: "150+ élèves transformés grâce à ma méthode (et ce chiffre grandit)"
    }
];

export function BiographySection() {
    return (
        <section id="biography" className="py-12 md:py-24 bg-white relative overflow-hidden">
            {/* Soft decorative background halos */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stone-100/50 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">

                <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                    {/* 1. Heading Block - First on mobile, Left top on LG */}
                    <div className="lg:col-span-7">
                        <div className="space-y-6">
                            <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
                                L'Histoire du Mentor
                            </span>
                            <h2 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight">
                                Qui est <span className="italic text-amber-600">JC</span> ?
                            </h2>
                            <div className="w-24 h-1.5 bg-amber-600 rounded-full opacity-30" />
                        </div>
                    </div>

                    {/* 2. Visual Side - Second on mobile, Right side spanning on LG */}
                    <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 relative group">
                        <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] transition-transform duration-500 group-hover:-translate-y-1">
                            <Image
                                src={jc1}
                                alt="Jean-Christophe Yervant - Professeur de trompette"
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                width={600}
                                height={750}
                                sizes="(max-width: 768px) calc(100vw - 48px), 600px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent pointer-events-none" />
                        </div>

                        {/* Status/Badge */}
                        <div className="absolute -bottom-6 right-0 md:-right-6 bg-white border-2 border-stone-900 px-6 py-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] z-20">
                            <p className="text-xl font-serif text-stone-900">JC Yervant</p>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Fondateur Z2G</p>
                        </div>
                    </div>

                    {/* 3. Content Side - Third on mobile, Left bottom on LG */}
                    <div className="lg:col-span-7 space-y-10">
                        <div className="space-y-4">
                            <h3 className="text-2xl md:text-3xl font-serif text-stone-800 leading-snug">
                                Jean-Christophe Yervant, 40 ans. <br />
                                <span className="text-stone-500 font-light italic">Passionné de trompette depuis 2006.</span>
                            </h3>
                            <p className="text-xl text-stone-600 font-light leading-relaxed max-w-2xl">
                                Plus qu&apos;un professeur, je suis un explorateur sonore qui a dédié sa vie à décoder les secrets de la trompette pour les rendre accessibles à tous.
                            </p>
                        </div>

                        <Card className="bg-stone-50 border-2 border-stone-900 shadow-[6px_6px_0px_0px_rgba(251,191,36,1)] rounded-[2rem] overflow-hidden">
                            <CardContent className="p-10">
                                <ul className="space-y-6">
                                    {credentials.map((credential, index) => (
                                        <li key={index} className="flex items-start gap-5 group/item">
                                            <div className="p-3 bg-white border border-stone-200 rounded-xl shadow-sm group-hover/item:border-amber-400 group-hover/item:scale-110 transition-all">
                                                <credential.icon className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <div className="pt-1">
                                                <p className="text-stone-800 font-medium leading-relaxed">
                                                    {credential.text}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <div className="pt-4 flex items-center gap-4 text-stone-400 italic text-sm">
                            <span className="w-10 h-px bg-stone-200" />
                            <span>Une approche terrain, loin des conservatoires rigides.</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
