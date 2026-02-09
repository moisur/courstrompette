import React from 'react';
import GoogleReviewsDisplay from '@/components/reviews/GoogleReviewsDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <>
      <main className="min-h-screen bg-stone-50/50">
        {children}
      </main>

      {/* Section des Témoignages et Avis Google */}
      <section id="testimonials-blog" className="bg-white py-24 border-t border-stone-100">
        <div className="container mx-auto px-6 max-w-7xl">

          <div className="text-center mb-16">
            <span className="text-amber-700 font-medium tracking-widest text-sm uppercase">
              Témoignages
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-stone-900 mt-4 mb-6 leading-tight">
              Mes élèves peuvent
              <span className="block italic text-stone-500">vous le confirmer</span>
            </h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full opacity-60"></div>
          </div>

          {/* Grille des Témoignages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              {
                text: "Grâce à JC, j'ai réalisé mon rêve de jouer sur une scène avec mon copain en seulement 6 mois. La méthode Z2G a changé ma vie !",
                author: "Sophie L., 28 ans",
                role: "De débutante à pro en 6 mois"
              },
              {
                text: "À 40 ans, je pensais que c'était trop tard. JC m'a prouvé le contraire. En 10 séances, je jouais déjà mes premiers morceaux ! ! !",
                author: "Thomas M., 41 ans",
                role: "A surmonté ses doutes"
              },
              {
                text: "JC ne m'a pas seulement appris à jouer, il m'a appris à ressentir la musique. Chaque leçon est une révélation. Je vis mon rêve éveillé !",
                author: "Léa D., 22 ans",
                role: "Joue avec plaisir"
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-none shadow-sm bg-stone-50 hover:bg-white hover:shadow-md transition-all duration-300">
                <CardContent className="p-8 flex flex-col h-full relative">
                  <Quote className="text-amber-200 w-10 h-10 mb-4" />
                  <p className="italic text-stone-600 mb-8 text-lg leading-relaxed flex-grow">
                    &quot;{testimonial.text}&quot;
                  </p>
                  <div>
                    <p className="font-serif text-stone-900 text-lg font-medium">
                      {testimonial.author}
                    </p>
                    <p className="text-amber-700 text-sm font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Avis Google */}
          <div className="bg-stone-50 rounded-3xl p-10 md:p-16 text-center">
            <h3 className="text-2xl md:text-3xl font-serif text-stone-900 mb-8">
              Ce qu&apos;ils disent sur <span className="text-amber-700">Google</span>
            </h3>
            <GoogleReviewsDisplay />
          </div>
        </div>
      </section>
    </>
  );
}
