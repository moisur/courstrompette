"use client";

import { useBooking } from "@/context/BookingContext";
import { ArrowRight } from "lucide-react";

export default function BlogCTA() {
    const { openModal } = useBooking();

    return (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8 mb-16 text-center shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Envie de jouer votre premier morceau ?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Ne perdez plus de temps à chercher des tutos au hasard. Réservez votre cours offert et profitez d&apos;un accompagnement personnalisé.
            </p>
            <button
                onClick={openModal}
                className="inline-flex items-center bg-orange-600 text-white font-bold py-4 px-8 rounded-full hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 text-lg"
            >
                Réserver mon 1er cours maintenant
                <ArrowRight className="ml-2 w-5 h-5" />
            </button>
        </div>
    );
}
