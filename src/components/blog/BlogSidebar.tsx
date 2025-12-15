"use client";

import Link from 'next/link';
import Image from 'next/image';
import { PhoneIcon, Trophy, Sparkles } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';

export default function BlogSidebar() {
    const { openModal } = useBooking();

    return (
        <aside className="lg:col-span-4 space-y-6">
            {/* 
        top-24 = 6rem. 
        Height = 100vh - 12rem (6rem top + 6rem bottom) for perfect symmetry.
        Hiding scrollbar for clean look while allowing scroll on tiny screens.
      */}
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col gap-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] py-2">

                {/* Author Card - "Changer la vie de 150 élèves" */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                    <div className="w-24 h-24 relative mb-4 flex-shrink-0 group">
                        <div className="absolute inset-0 bg-orange-100 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500"></div>
                        <Image
                            src="/jc.jpg"
                            alt="JC Trompette"
                            fill
                            className="object-cover rounded-full border-4 border-white shadow-md relative z-10"
                        />
                        <div className="absolute bottom-0 right-0 bg-orange-600 text-white p-1.5 rounded-full z-20 shadow-sm">
                            <Trophy className="w-4 h-4" />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1">JC Trompette</h3>
                    <p className="text-sm text-orange-600 font-bold uppercase tracking-wide mb-3">Professeur Passionné</p>

                    <p className="text-gray-600 text-sm mb-6 leading-relaxed px-2">
                        J&apos;ai eu la chance d&apos;accompagner et de <span className="font-bold text-gray-900">changer la vie musicale de plus de 150 élèves</span>. Pourquoi pas la vôtre ?
                    </p>

                    <button
                        onClick={openModal}
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3.5 rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/30 transform hover:-translate-y-0.5 text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                        <PhoneIcon className="w-4 h-4" />
                        Cours offert
                    </button>
                </div>

                {/* Call to Action Box - "Changer votre vie dès maintenant" */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-xl text-white text-center flex flex-col justify-center items-center relative overflow-hidden group">

                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700 group-hover:bg-orange-500/20"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -ml-12 -mb-12"></div>

                    <h3 className="text-xl font-bold mb-3 leading-tight relative z-10">
                        Prêt à <span className="text-orange-400">commencer</span> votre parcours ?
                    </h3>

                    <button
                        onClick={openModal}
                        className="relative z-10 inline-block bg-white text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-orange-50 transition-colors shadow-lg text-sm"
                    >
                        Je me lance  !
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-2 opacity-60 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                        <span>Réponse sous 24h</span>
                    </div>
                </div>

            </div>
        </aside>
    );
}
