import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { getBlogMenuData } from "@/lib/markdown";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { Analytics } from "@vercel/analytics/react";
import { BookingProvider } from "@/context/BookingContext";
import { BookingModal } from "@/components/BookingModal";
import JsonLd from "@/components/seo/JsonLd";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://courstrompetteparis.lecoledes1.com/'),
  title: "Cours de Trompette | Apprendre la trompette en ligne",
  description: "Apprenez la trompette avec nos cours en ligne, guides et exercices pour tous les niveaux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <BookingProvider>
          {/* Correction ici : Utilisation d'une prop 'data' pour passer l'objet JSON complet */}
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "MusicSchool", // Ou 'LocalBusiness' selon votre activité
              "name": "Cours de Trompette Paris",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "9 RUE DE LA FONTAINE AU ROI",
                "addressLocality": "Paris",
                "postalCode": "75011",
                "addressCountry": "FR"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "reviewCount": "4"
              }
            }}
          />
          <Header menuItems={getBlogMenuData()} />
          {children}
          <Chatbot />
          <Footer />
          <Analytics />
          <BookingModal />
        </BookingProvider>
      </body>
    </html>
  );
}