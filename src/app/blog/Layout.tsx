import Head from 'next/head';
import React from 'react';
import { Analytics } from "@vercel/analytics/react";
import GoogleReviewsDisplay from '@/components/reviews/GoogleReviewsDisplay';
import { Card, CardContent } from "@/components/ui/card"; // Import Card components

interface LayoutProps {
  children: React.ReactNode;
  // Note: Layouts in App Router don't typically receive title/description props like this.
  // Metadata should be handled in page.tsx or layout.tsx using the Metadata API.
  // We'll keep the props for now but remove the <Head> component as it's not standard here.
  title?: string; // Made optional
  description?: string; // Made optional
}

// Standard App Router layout structure
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <Head> component is not used directly in App Router layouts. Use Metadata API instead. */}
      {/*
      <Head>
        <title>{title} - Cours de Trompette</title>
        <meta name="description" content={description} />
      </Head>
      */}
      <main className="container mx-auto px-4 py-20">
        {children} {/* The page content will be rendered here */}
      </main>

      {/* Add the full testimonials section here */}
      <section id="testimonials-blog" className="bg-gray-100 py-20">
        {" "}
        {/* Changed id slightly to avoid conflicts if needed */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl mb-16 md:text-4xl font-bold text-center">
            Mes
            <span className="pl-2 pr-2   bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              élèves
            </span>
            peuvent vous le confirmer :
          </h2>
          {/* Original Testimonial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardContent className="p-6">
                <p className="italic mb-4">
                  &quot;Grâce à JC, j&apos;ai réalisé mon rêve de jouer sur une
                  scène avec mon copain en seulement 6 mois. La méthode Z2G a
                  changé ma vie !&quot;
                </p>
                <p className="font-semibold">
                  Sophie L., 28 ans - De débutante à pro en 6 mois
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="italic mb-4">
                  &quot;À 40 ans, je pensais que c&apos;était trop tard. JC
                  m&apos;a prouvé le contraire. En 10 séances, je jouais déjà
                  mes premiers morceaux ! ! !&quot;
                </p>
                <p className="font-semibold">
                  Thomas M., 41 ans - A surmonté ses doutes et brille sur scène
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="italic mb-4">
                  &quot;JC ne m&apos;a pas seulement appris à jouer, il m&apos;a appris à
                  ressentir la musique. Chaque leçon est une révélation. Je vis
                  mon rêve éveillé !&quot;
                </p>
                <p className="font-semibold">
                  Léa D., 22 ans - Joue de la trompette avec plaisir grâce à La
                  Méthode Z2G
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Add the Google Reviews Display below the original testimonials */}
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 mt-16">
            Ce qu&apos;ils disent sur
            <span className="pl-2 pr-2   bg-gradient-to-br from-[#4285F4] via-[#DB4437] to-[#F4B400] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              Google
            </span>
          </h3>
          {/* Display ALL Google reviews on blog posts now */}
          <GoogleReviewsDisplay />
        </div>
      </section>
    </>
  );
}
