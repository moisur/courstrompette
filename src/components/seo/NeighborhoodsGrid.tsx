import { locations } from '@/data/locations';
import Link from 'next/link';

export default function NeighborhoodsGrid({ locationName }: { locationName?: string }) {
    const arrondissements = locations.filter(loc => loc.type === 'arrondissement');
    const neighborhoods = locations.filter(loc => loc.type === 'neighborhood');

    return (
        <section className="py-20 bg-stone-900 text-stone-200">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-serif text-white mb-4 italic">
                        {locationName ? `Où apprendre la trompette près de ${locationName} ?` : "Où apprendre la trompette à Paris ?"}
                    </h2>
                    <p className="text-stone-400">
                        Je me déplace dans tous les arrondissements et quartiers phares de la capitale pour vos cours particuliers.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Arrondissements */}
                    <div>
                        <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm mb-6">Par Arrondissement</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {arrondissements.map((loc) => (
                                <Link
                                    key={loc.slug}
                                    href={`/paris/${loc.slug}`}
                                    className="text-stone-400 hover:text-white transition-colors py-1 text-sm border-b border-stone-800"
                                >
                                    Cours {loc.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quartiers */}
                    <div>
                        <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm mb-6">Par Quartier</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {neighborhoods.map((loc) => (
                                <Link
                                    key={loc.slug}
                                    href={`/paris/${loc.slug}`}
                                    className="text-stone-400 hover:text-white transition-colors py-1 text-sm border-b border-stone-800"
                                >
                                    {loc.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
