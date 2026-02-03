import { Metadata } from 'next';
import { locations } from '@/data/locations';
import { HeroSection } from '@/components/home';
import NeighborhoodsGrid from '@/components/seo/NeighborhoodsGrid';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Cours de Trompette à Paris | Tous les arrondissements',
    description: 'Découvrez où apprendre la trompette à Paris. Je me déplace dans tous les arrondissements et quartiers phares de la capitale.',
};

export default function ParisOverviewPage() {
    const arrondissements = locations.filter(loc => loc.type === 'arrondissement');
    const neighborhoods = locations.filter(loc => loc.type === 'neighborhood');

    return (
        <main className="relative min-h-screen bg-white">
            <HeroSection
                title={
                    <>
                        La Trompette <br />
                        <span className="font-semibold text-amber-100">Partout à Paris</span>
                    </>
                }
                subtitle="Trouvez votre professeur de trompette dans votre arrondissement ou votre quartier favori."
            />

            <section className="py-20 bg-stone-50">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6">Un professeur mobile dans tout Paris</h2>
                    <p className="text-xl text-stone-600 leading-relaxed">
                        Que vous soyez dans le centre historique, sur la rive gauche ou dans les quartiers bohèmes du nord,
                        je me déplace pour vous offrir des cours de trompette de qualité avec la méthode Z2G.
                    </p>
                    <div className="w-24 h-1.5 bg-amber-600 rounded-full mx-auto mt-8 opacity-20" />
                </div>
            </section>

            <NeighborhoodsGrid />
        </main>
    );
}
