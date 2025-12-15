import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import GoogleReviewsDisplay from '@/components/reviews/GoogleReviewsDisplay';
import { Card, CardContent } from '@/components/ui/card';

interface BlogLayoutProps {
  children: React.ReactNode;
}

// Pas besoin d'exporter `metadata` ici si chaque page gère son propre `metadata`
// export const metadata = { ... }

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <>
      {/* Le composant Head n'est pas utilisé dans l'App Router pour les métadonnées. */}
      {/* Les métadonnées sont définies via l'objet `metadata` exporté dans `page.tsx` ou `layout.tsx` du niveau supérieur. */}

      <main className="min-h-screen"> {/* min-h-screen pour s'assurer que le contenu principal prend au moins toute la hauteur */}
        {children} {/* Le contenu de la page sera rendu ici */}
      </main>

      {/* Section des Témoignages et Avis Google */}
      <section id="testimonials-blog" className="bg-gray-50 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-gray-900 leading-tight">
            Mes
            <span className="ml-3 mr-3 bg-gradient-to-br from-[#FF6B00] via-[#FF9300] to-[#FFAF00] bg-clip-text text-transparent drop-shadow-md">
              élèves
            </span>
            peuvent vous le confirmer :
          </h2>
          {/* Grille des Témoignages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="italic text-gray-700 mb-6 text-lg leading-relaxed">
                  &quot;Grâce à JC, j&apos;ai réalisé mon rêve de jouer sur une
                  scène avec mon copain en seulement 6 mois. La méthode Z2G a
                  changé ma vie !&quot;
                </p>
                <p className="font-semibold text-orange-600 text-base">
                  Sophie L., 28 ans - De débutante à pro en 6 mois
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="italic text-gray-700 mb-6 text-lg leading-relaxed">
                  &quot;À 40 ans, je pensais que c&apos;était trop tard. JC
                  m&apos;a prouvé le contraire. En 10 séances, je jouais déjà
                  mes premiers morceaux ! ! !&quot;
                </p>
                <p className="font-semibold text-orange-600 text-base">
                  Thomas M., 41 ans - A surmonté ses doutes et brille sur scène
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <p className="italic text-gray-700 mb-6 text-lg leading-relaxed">
                  &quot;JC ne m&apos;a pas seulement appris à jouer, il m&apos;a appris à
                  ressentir la musique. Chaque leçon est une révélation. Je vis
                  mon rêve éveillé !&quot;
                </p>
                <p className="font-semibold text-orange-600 text-base">
                  Léa D., 22 ans - Joue de la trompette avec plaisir grâce à La
                  Méthode Z2G
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Avis Google */}
          <h3 className="text-3xl md:text-4xl font-extrabold text-center mb-12 mt-16 text-gray-900 leading-tight">
            Ce qu&apos;ils disent sur
            <span className="ml-3 mr-3 bg-gradient-to-br from-[#4285F4] via-[#DB4437] to-[#F4B400] bg-clip-text text-transparent drop-shadow-md">
              Google
            </span>
          </h3>
          <GoogleReviewsDisplay />
        </div>
      </section>

      <Analytics /> {/* Garder Vercel Analytics */}
    </>
  );
}