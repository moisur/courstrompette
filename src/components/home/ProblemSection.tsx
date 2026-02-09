"use client"

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import jc from '@/../public/jc.webp';

const problems = [
    {
        emoji: "😫",
        title: "Pratique Stagnante",
        description: "Malgré des heures de pratique, vous constatez peu ou pas de progrès dans votre jeu.",
        accent: "bg-amber-50 text-amber-600"
    },
    {
        emoji: "😵‍💫",
        title: "Confusion Technique",
        description: "Les embouchures, les gammes et les doigtés semblent être en langage codé.",
        accent: "bg-amber-50 text-amber-600"
    },
    {
        emoji: "🧭",
        title: "Manque de Direction",
        description: "Sans un bon guide, on tourne en rond et on développe de mauvaises habitudes.",
        accent: "bg-amber-50 text-amber-600"
    }
];

export function ProblemSection() {
    return (
        <section id="problem" className="py-16 md:py-32 bg-stone-50/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-stone-100/50 -skew-x-12 translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-12 gap-16 items-center">

                    {/* Content Left */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-12"
                        >
                            <span className="text-amber-700 font-medium tracking-[0.2em] text-sm uppercase mb-4 block">
                                Ca fait des mois que vous le savez
                            </span>
                            <h2 className="text-4xl md:text-6xl font-serif text-stone-900 leading-tight mb-6">
                                Vous pratiquez sans <br />
                                <span className="italic text-stone-500">progresser ...</span>
                            </h2>
                            <div className="w-20 h-1 bg-amber-600 rounded-full opacity-60" />
                        </motion.div>

                        <div className="grid gap-6">
                            {problems.map((problem, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="group border border-amber-100 shadow-sm hover:shadow-2xl hover:shadow-amber-200/40 hover:border-amber-200 transition-all duration-500 bg-white rounded-2xl overflow-hidden">
                                        <CardContent className="p-8">
                                            <div className="flex items-start gap-6">
                                                <div className={`text-4xl p-4 rounded-2xl ${problem.accent} bg-amber-50 shadow-md group-hover:scale-110 group-hover:bg-amber-100 group-hover:shadow-lg group-hover:shadow-amber-200/50 transition-all duration-500 flex items-center justify-center min-w-[80px] h-[80px]`}>
                                                    {problem.emoji}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-serif text-stone-900 mb-2 group-hover:text-amber-800 transition-colors">{problem.title}</h3>
                                                    <p className="text-stone-600 leading-relaxed font-light text-lg">
                                                        {problem.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="mt-12 flex items-center gap-4 p-6 bg-amber-50/50 rounded-2xl border border-amber-100/50"
                        >
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-xl">
                                🎺
                            </div>
                            <div>
                                <p className="text-stone-900 font-medium">C&apos;est tout à fait normal.</p>
                                <p className="text-stone-600 leading-relaxed font-light">
                                    Sans la bonne méthode, on stagne, pire parfois, on se décourage. Mon objectif est de vous faire jouer votre premier morceau en <span className="font-medium italic text-amber-800">10 séances</span>.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Image Right */}
                    <div className="lg:col-span-5 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            {/* Decorative frames */}
                            <div className="absolute -inset-4 border border-stone-200 rounded-[2.5rem] -z-10" />
                            <div className="absolute inset-4 border border-amber-200/30 rounded-[1.5rem] translate-x-4 translate-y-4 -z-10" />

                            <div className="rounded-[2rem] overflow-hidden shadow-2xl relative">
                                <Image
                                    src={jc}
                                    alt="JC - Professeur de trompette"
                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                    width={600}
                                    height={800}
                                    sizes="(max-width: 768px) calc(100vw - 48px), 600px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/10 to-transparent opacity-60" />

                                {/* Floating badge adjusted to bottom right or smaller to cover less */}
                                <div className="absolute bottom-6 right-6 left-12 bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/20 scale-90 origin-bottom-right">
                                    <p className="text-stone-900 font-serif italic text-base leading-snug">
                                        &quot;La trompette n&apos;est pas difficile, ce sont les professeurs qui ne savent pas l&apos;enseigner.&quot;
                                    </p>
                                    <p className="text-amber-700 text-xs font-medium mt-2 uppercase tracking-widest">— Jean-Christophe</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
