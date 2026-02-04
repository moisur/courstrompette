import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { getBlogMenuData } from "@/lib/markdown";
import Footer from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import JsonLd from "@/components/seo/JsonLd";
import dynamic from 'next/dynamic';
import { Analytics } from "@vercel/analytics/react";
import { BookingProvider } from "@/context/BookingContext";

const Chatbot = dynamic(() => import("@/components/Chatbot"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://courstrompette.fr/'),
  title: "Cours de Trompette en ligne ou à domicile",
  description: "Découvrez nos cours de Trompette pour apprendre à jouer de la trompette à votre rythme avec Jean Christophe Yervant, le meilleur professeur de trompette.",
  keywords: ["cours de trompette", "trompette paris", "apprendre la trompette", "méthode Z2G", "professeur de trompette", "Jean Christophe Yervant"],
  openGraph: {
    title: "Cours de Trompette en ligne ou à domicile",
    description: "Découvrez nos cours de Trompette pour apprendre à jouer de la trompette à votre rythme avec Jean Christophe Yervant, le meilleur professeur de trompette.",
    url: "https://courstrompette.fr/",
    siteName: "Cours de Trompette",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cours de Trompette en ligne ou à domicile",
    description: "Découvrez nos cours de Trompette pour apprendre à jouer de la trompette à votre rythme avec Jean Christophe Yervant, le meilleur professeur de trompette.",
  },
  verification: {
    google: "jBElafHqU3eAux7x5QbUblWVpm3kVEjzME6ZKlXzglU",
  },
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

          <JsonLd />
          <Header menuItems={getBlogMenuData()} />
          {children}
          <Footer />
          <Analytics />
          <BookingModal />
          <Chatbot />
        </BookingProvider>
      </body>
    </html>
  );
}