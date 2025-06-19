import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "Cours particuliers de trompette Paris | (+150 Élèves) conquis !",
  description:
    "Cours de trompette à Paris par professeur expert. +150 élèves ont déjà progressé avec ma méthode unique. Réservez votre cours d'essai dès aujourd'hui!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness", // Changed from MusicSchool
              name: "Cours de trompette Paris",
              url: "https://courstrompetteparis.lecoledes1.com/", // Make sure this is your main URL
              address: {
                "@type": "PostalAddress",
                streetAddress: "9 RUE DE LA FONTAINE AU ROI",
                addressLocality: "Paris",
                postalCode: "75011",
                addressCountry: "FR",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "5.0",
                reviewCount: "4"
              },
            }),
          }}
        />
        <Header />
        {children}
        <Chatbot />
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
