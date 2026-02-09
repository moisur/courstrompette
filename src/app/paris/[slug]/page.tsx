import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locations, LocationData, getNearLocations } from '@/data/locations';
import Cours from "@/components/cours";
import { HeroSection, TestimonialsSection, FAQSection } from '@/components/home';
import { useBooking } from "@/context/BookingContext";
import NeighborhoodsGrid from '@/components/seo/NeighborhoodsGrid';

interface Props {
    params: { slug: string };
}

export async function generateStaticParams() {
    const paths: { slug: string }[] = [];
    locations.forEach(location => {
        paths.push({ slug: location.slug });
        if (location.aliases) {
            location.aliases.forEach(alias => {
                paths.push({ slug: alias });
            });
        }
    });
    return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const location = locations.find((l) => l.slug === params.slug || l.aliases?.includes(params.slug));

    if (!location) {
        return {
            title: 'Page non trouvée',
        };
    }
    // ... (rest remains similar, but using the found location)

    const title = `Cours de Trompette à ${location.name} (${location.zipCode || 'Paris'}) | Méthode Rapide`;
    const description = `${location.description} Profitez d'un coaching personnalisé par un professeur expérimenté. Premier cours offert !`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: `https://courstrompette.fr/paris/${location.slug}`,
        },
    };
}

export default function LocationPage({ params }: Props) {
    const location = locations.find((l) => l.slug === params.slug || l.aliases?.includes(params.slug));

    if (!location) {
        notFound();
    }

    // Near locations for interlinking
    const nearLocations = getNearLocations(location.slug);

    return (
        <main className="relative min-h-screen">
            <div className="z-0">
                <Cours
                    locationName={location.name}
                    zipCode={location.zipCode}
                    locationTitle={
                        <>
                            Apprendre la trompette <br />
                            à <span className="font-semibold text-amber-100">{location.name}</span>
                        </>
                    }
                    introContent={
                        <div className="space-y-12">
                            <div className="text-center space-y-4">
                                <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-4">
                                    Une expertise locale à Paris
                                </span>
                                <h2 className="text-3xl md:text-5xl font-serif text-stone-900 leading-tight">
                                    Votre Professeur de Trompette <br />
                                    à <span className="italic text-amber-600">{location.name}</span>
                                </h2>
                                <div className="w-16 h-1 bg-amber-600/30 rounded-full mx-auto" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="relative p-8 bg-white border border-stone-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                    <div className="absolute -left-2 top-8 w-1 h-12 bg-amber-500 rounded-full" />
                                    <p className="text-lg text-stone-700 leading-relaxed">
                                        Vous habitez dans le quartier de <strong>{location.name}</strong> et vous cherchez à apprendre la trompette ou à vous perfectionner ?
                                        Que vous soyez près de {location.monument} ou dans les rues de {location.neighborhoods?.join(', ') || location.name},
                                        je vous propose une méthode unique pour progresser deux fois plus vite.
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="text-2xl mt-1">🎺</div>
                                        <div>
                                            <h4 className="font-serif text-lg text-stone-900">Ambiance {location.vibe}</h4>
                                            <p className="text-stone-600 text-sm">{location.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="text-2xl mt-1">📍</div>
                                        <div>
                                            <h4 className="font-serif text-lg text-stone-900">Proximité Totale</h4>
                                            <p className="text-stone-600 text-sm">Je me déplace directement à votre domicile ou dans votre studio de répétition favori dans le {location.zipCode || 'secteur'}.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                />

                {/* Local Interlinking Section for SEO */}
                <section className="py-12 border-t border-stone-100 bg-stone-50">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <h3 className="text-xl font-bold text-stone-900 mb-6">Autres quartiers à proximité :</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {nearLocations.map((loc) => (
                                <a
                                    key={loc.slug}
                                    href={`/paris/${loc.slug}`}
                                    className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                                >
                                    Cours à {loc.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                <NeighborhoodsGrid locationName={location.name} />
            </div>
        </main>
    );
}
