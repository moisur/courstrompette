/* eslint-disable react/no-unescaped-entities */

import { Card, CardContent } from '@/components/ui/card';
import {
    Search,
    UserCheck,
    Calendar,
    Users,
    Video,
    CheckCircle2,
    Sparkles,
    ArrowRight,
} from 'lucide-react';

const learnings = [
    {
        icon: Search,
        text: 'Identifier les 7 erreurs les plus courantes chez les trompettistes',
    },
    {
        icon: UserCheck,
        text: 'Auto-diagnostiquer votre posture, embouchure et souffle',
    },
    {
        icon: Calendar,
        text: 'Créer votre propre programme de 15 minutes par jour',
    },
];

const details = [
    { icon: Users, label: 'Format', value: '2h en petit groupe (max 6 personnes)' },
    { icon: Calendar, label: 'Tarif', value: '80€ par personne' },
    { icon: Video, label: 'Bonus Audit', value: 'Audit vidéo personnalisé inclus' },
];

export function MasterclassSection({ locationName }: { locationName?: string }) {
    return (
        <section id="masterclass" className="py-12 md:py-24 bg-stone-900 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-900/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto px-6 max-w-6xl relative z-10">

                {/* En-tête */}
                <div className="text-center mb-20">
                    <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
                        <Sparkles className="w-4 h-4" />
                        Masterclass Exclusive
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
                        Le Diagnostic <span className="italic text-amber-100">Z2G</span> {locationName && `à ${locationName}`}
                    </h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full mb-8 opacity-80" />
                    <p className="text-xl md:text-2xl text-stone-300 max-w-3xl mx-auto leading-relaxed font-light">
                        Cette masterclass n&apos;est pas un concert où vous regardez un pro jouer. <br className="hidden md:block" />
                        C&apos;est un <span className="text-amber-400 font-medium">laboratoire</span> où vous apprenez à vous <span className="italic">diagnostiquer</span>.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid lg:grid-cols-5 gap-8 mb-20">
                    {/* What you'll learn - 3/5 width */}
                    <Card className="lg:col-span-3 bg-stone-800/40 backdrop-blur-md border-stone-700/50 hover:border-amber-500/30 transition-all duration-500 group rounded-[2rem] overflow-hidden">
                        <CardContent className="p-10">
                            <h3 className="text-2xl font-serif text-white mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 text-lg">01</span>
                                Ce que vous apprendrez
                            </h3>
                            <ul className="space-y-6">
                                {learnings.map((item, index) => (
                                    <li key={index} className="flex items-start gap-5 group/item">
                                        <div className="p-3 bg-stone-900/50 border border-stone-700 rounded-2xl group-hover/item:border-amber-500/50 group-hover/item:bg-amber-500/5 transition-all duration-300">
                                            <item.icon className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <span className="text-stone-300 text-lg leading-relaxed group-hover/item:text-white transition-colors">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Details - 2/5 width */}
                    <Card className="lg:col-span-2 bg-gradient-to-br from-amber-600 to-amber-800 border-none shadow-2xl shadow-amber-900/20 rounded-[2rem] overflow-hidden relative group">
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        <CardContent className="p-10 relative z-10">
                            <h3 className="text-2xl font-serif text-white mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white text-lg">02</span>
                                Les détails
                            </h3>
                            <ul className="space-y-8">
                                {details.map((item, index) => (
                                    <li key={index} className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                                            <item.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-amber-200/80 text-sm uppercase tracking-widest font-bold mb-1">{item.label}</p>
                                            <p className="text-white text-lg font-medium tracking-wide">{item.value}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* CTA Area */}
                <div className="bg-stone-800/20 border border-stone-700/30 rounded-3xl p-10 md:p-16 text-center backdrop-blur-sm">
                    <div className="inline-flex items-center gap-2 text-stone-400 text-sm mb-8 uppercase tracking-widest font-medium">
                        <CheckCircle2 className="w-4 h-4 text-amber-500" />
                        Places limitées — Session intensive
                    </div>

                    <div>
                        <a
                            href="#booking"
                            className="inline-flex items-center gap-3 bg-white text-stone-900 font-bold py-5 px-12 rounded-full text-xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(251,191,36,1)] hover:shadow-[6px_6px_0px_0px_rgba(251,191,36,1)] transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Réserver ma place en Masterclass
                            <ArrowRight className="w-6 h-6" />
                        </a>
                    </div>

                    <p className="text-stone-500 mt-8 text-sm italic">
                        Une expérience unique pour débloquer votre progression en groupe réduit.
                    </p>
                </div>
            </div>
        </section>
    );
}
