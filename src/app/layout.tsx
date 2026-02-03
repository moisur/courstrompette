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
  title: "Cours de Trompette à Paris | Méthode Z2G : Jouez en 10 Séances",
  description: "Apprenez la trompette à Paris avec la méthode Z2G. Jouez votre premier morceau en seulement 10 séances. Cours pour débutants et avancés. Réservez votre séance gratuite !",
  keywords: ["cours de trompette", "trompette paris", "apprendre la trompette", "méthode Z2G", "professeur de trompette"],
  openGraph: {
    title: "Cours de Trompette à Paris | Méthode Z2G",
    description: "Apprenez la trompette à Paris avec la méthode Z2G. Jouez votre premier morceau en seulement 10 séances.",
    url: "https://courstrompetteparis.lecoledes1.com/",
    siteName: "Cours de Trompette Paris",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cours de Trompette à Paris | Méthode Z2G",
    description: "Apprenez la trompette à Paris avec la méthode Z2G. Jouez votre premier morceau en seulement 10 séances.",
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
          <Chatbot />
          <Footer />
          <Analytics />
          <BookingModal />
        </BookingProvider>
      </body>
    </html>
  );
}