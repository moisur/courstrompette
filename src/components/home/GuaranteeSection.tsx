/* eslint-disable react/no-unescaped-entities */

import { Shield, Sparkles, ArrowRight } from 'lucide-react';

export function GuaranteeSection() {
    return (
        <section id="guarantee" className="py-12 md:py-24 bg-stone-900 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
                {/* Badge */}
                <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase">
                    <Sparkles className="w-4 h-4" />
                    Engagement de Qualité
                </span>

                {/* Icon Container with Glow */}
                <div className="relative inline-flex mb-10">
                    <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl scale-150 animate-pulse" />
                    <div className="relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-900/50 border border-white/20">
                        <Shield className="w-12 h-12 text-white" />
                    </div>
                </div>

                <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 leading-tight">
                    Ma Garantie <br className="md:hidden" />
                    <span className="italic text-amber-100">&quot;Satisfaction ou Remboursé&quot;</span>
                </h2>

                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full mb-10 opacity-60" />

                <p className="text-xl md:text-2xl text-stone-300 leading-relaxed mb-12 max-w-2xl mx-auto font-light">
                    Si vous ne jouez pas votre premier morceau complet en 10 séances,
                    je vous rembourse <strong className="text-white font-medium">intégralement</strong>, sans discuter.
                </p>

                <div className="flex flex-col items-center gap-6">
                    <a
                        href="#booking"
                        className="inline-flex items-center gap-3 bg-white text-stone-900 font-bold py-5 px-12 rounded-full text-xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(251,191,36,1)] hover:shadow-[6px_6px_0px_0px_rgba(251,191,36,1)] transition-all duration-300 transform hover:-translate-y-1"
                    >
                        Réserver mon cours gratuit
                        <ArrowRight className="w-6 h-6" />
                    </a>

                    <p className="text-stone-500 text-sm uppercase tracking-widest font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Premier cours offert • Zéro risque
                    </p>
                </div>
            </div>
        </section>
    );
}
