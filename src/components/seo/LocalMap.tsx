"use client"

import { MapPin } from 'lucide-react';

interface LocalMapProps {
    locationName: string;
    zipCode?: string;
}

export default function LocalMap({ locationName, zipCode }: LocalMapProps) {
    return (
        <section className="py-12 md:py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Map Visual */}
                    <div className="relative order-2 lg:order-1">
                        {/* Decorative Background for the "Map" */}
                        <div className="absolute -inset-4 bg-amber-500/5 rounded-[2.5rem] blur-2xl -z-10" />

                        <div className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] bg-stone-100 flex items-center justify-center group">
                            {/* Stylized Map Texture (Simple Grid) */}
                            <div className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: 'radial-gradient(#1c1917 1px, transparent 1px)',
                                    backgroundSize: '30px 30px'
                                }}
                            />

                            {/* Pulsing Pin */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="absolute -top-12 bg-white px-4 py-2 rounded-xl shadow-lg border border-stone-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="font-serif font-bold text-stone-900">Cours à {locationName}</span>
                                </div>
                                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center animate-ping absolute" />
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-amber-500 relative z-20">
                                    <MapPin className="w-8 h-8 text-amber-600" />
                                </div>
                            </div>

                            {/* Geographical Indicators (Abstract) */}
                            <div className="absolute top-1/4 left-1/4 w-32 h-2 bg-stone-200 rounded-full rotate-12" />
                            <div className="absolute bottom-1/3 right-1/4 w-40 h-2 bg-stone-200 rounded-full -rotate-45" />
                            <div className="absolute bottom-1/4 left-1/3 w-2 h-24 bg-stone-200 rounded-full" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 order-1 lg:order-2">
                        <div className="space-y-4">
                            <span className="text-amber-600 font-bold uppercase tracking-[0.2em] text-xs">Périmètre d'intervention</span>
                            <h2 className="text-3xl md:text-5xl font-serif text-stone-900 leading-tight">
                                Disponibilités à <br />
                                <span className="italic text-amber-600">{locationName} {zipCode}</span>
                            </h2>
                            <div className="w-20 h-1.5 bg-amber-600 rounded-full opacity-30" />
                        </div>

                        <p className="text-lg text-stone-600 leading-relaxed max-w-xl">
                            Je dispense mes cours directement à votre domicile dans tout le quartier de <strong>{locationName}</strong>.
                            Plus besoin de transporter votre instrument dans le métro : je viens à vous avec tout le matériel pédagogique nécessaire.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "Déplacement inclus sans frais supplémentaires",
                                "Horaires flexibles du lundi au samedi",
                                "Secteur privilégié pour les séances Z2G",
                                "Studio partenaire disponible si souhaité"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 text-stone-800 font-medium">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs">✓</span>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
