'use client';

import { X, Sparkles } from 'lucide-react';
import { ConfettiButton } from "@/components/magicui/confetti";
import { cn } from "@/app/lib/utils";

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    ctaText: string;
    ctaHref?: string;
}

export function Popup({ isOpen, onClose, title, description, ctaText, ctaHref = "#booking" }: PopupProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
            <div className="relative bg-white p-8 rounded-3xl max-w-lg w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-stone-100">

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-full transition-colors"
                    aria-label="Fermer"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
                        <Sparkles size={12} />
                        Offre exclusive
                    </span>
                    <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-3 leading-tight">
                        {title}
                    </h2>
                    <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full opacity-60 mb-4"></div>
                    <p className="text-stone-600 leading-relaxed text-lg">
                        {description}
                    </p>
                </div>

                <ConfettiButton
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-center font-bold py-4 px-6 rounded-xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transform transition hover:-translate-y-1"
                    onClick={() => {
                        window.location.href = ctaHref;
                        onClose();
                    }}
                >
                    {ctaText}
                </ConfettiButton>

                <p className="text-center text-xs text-stone-400 mt-4">
                    Offre limitée aux places disponibles
                </p>
            </div>
        </div>
    );
}
