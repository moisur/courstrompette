"use client";

import { useBooking } from "@/context/BookingContext";
import { ArrowRight } from "lucide-react";

interface InlineCTAProps {
    text: React.ReactNode;
    buttonText?: string;
}

export default function InlineCTA({ text, buttonText = "Réserver mon cours" }: InlineCTAProps) {
    const { openModal } = useBooking();

    return (
        <div className="my-8 md:my-16 mx-auto max-w-4xl bg-white border border-stone-100 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

            <div className="relative z-10 text-center md:text-left">
                <p className="text-xl md:text-2xl text-stone-900 font-serif">
                    {text}
                </p>
            </div>

            <button
                onClick={openModal}
                className="relative z-10 whitespace-nowrap inline-flex items-center bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold py-3.5 px-8 rounded-full border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transition-all duration-300 transform hover:-translate-y-1 group/btn"
            >
                {buttonText}
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
            </button>
        </div>
    );
}
