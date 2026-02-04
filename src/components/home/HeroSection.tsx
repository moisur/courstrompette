'use client';

/* eslint-disable react/no-unescaped-entities */

import Image from "next/image";
import { useBooking } from "@/context/BookingContext";

interface HeroSectionProps {
    title?: React.ReactNode;
    subtitle?: string;
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
    const { openModal } = useBooking();
    return (
        <header className="relative min-h-screen flex items-center justify-center text-white text-center px-6 pt-16">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/Cours-trompette-paris.webp"
                    alt="Cours de trompette à Paris"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                    quality={85}
                />
            </div>

            {/* Overlay avec effet plus subtil */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/70 via-stone-900/50 to-stone-900/80 z-10" />

            <div className="relative z-20 max-w-4xl">
                {/* Badge subtil */}
                <span className="inline-block mb-6 text-amber-400 text-sm font-medium tracking-widest uppercase">
                    Cours de trompette à Paris
                </span>

                <h1 className="text-3xl md:text-6xl font-serif font-light mb-6 leading-tight">
                    {title || (
                        <>
                            Jouez votre premier morceau <br />
                            <span className="font-semibold text-amber-100">en 10 séances</span>
                        </>
                    )}
                </h1>

                <p className="text-lg md:text-xl text-stone-300 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
                    {subtitle || "Débutants ou amateurs, découvrez une méthode pédagogique unique qui transforme l'apprentissage de la trompette."}
                </p>

                <button
                    onClick={openModal}
                    className="inline-flex items-center gap-3 bg-white text-stone-900 font-medium py-4 px-10 rounded-full text-lg transition-all duration-300 hover:bg-amber-50 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transform hover:-translate-y-1"
                >
                    Réserver mon cours découverte
                    <span className="text-2xl">🎺</span>
                </button>

                <p className="mt-6 text-stone-400 text-sm tracking-wide">
                    Premier cours offert • Sans engagement
                </p>
            </div>

            {/* Scroll indicator subtil */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                    <div className="w-1 h-2 bg-white/60 rounded-full mt-2 animate-bounce" />
                </div>
            </div>
        </header>
    );
}
