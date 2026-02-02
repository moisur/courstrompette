"use client";

import { useBooking } from "@/context/BookingContext";
import { ArrowRight, Sparkles } from "lucide-react";
import { ConfettiButton } from "@/components/magicui/confetti";

export default function BlogCTA() {
    const { openModal } = useBooking();

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 rounded-3xl p-8 md:p-12 text-center shadow-xl">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
                    <Sparkles size={14} className="text-white" />
                    Offre découverte
                </div>

                <h2 className="text-3xl md:text-4xl font-serif text-white mb-6 leading-tight">
                    Envie de jouer votre <span className="italic">premier morceau</span> ?
                </h2>

                <p className="text-lg text-amber-50 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                    Ne perdez plus de temps à chercher des tutos au hasard. Réservez votre cours offert et profitez d&apos;un accompagnement personnalisé.
                </p>

                <ConfettiButton
                    onClick={openModal}
                    className="inline-flex items-center justify-center bg-white text-amber-700 font-bold py-4 px-6 md:px-8 rounded-full border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transition-all duration-300 transform hover:-translate-y-1 text-base md:text-lg group max-w-full"
                >
                    <span className="text-center">Réserver mon 1er cours</span>
                    <ArrowRight className="ml-2 w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                </ConfettiButton>

                <p className="mt-6 text-sm text-amber-100/80">
                    Sans engagement • Accès immédiat
                </p>
            </div>
        </div>
    );
}
