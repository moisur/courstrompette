import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from '@/components/Footer'
import Chatbot from "@/components/Chatbot"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cours de trompette PARIS",
  description: "Apprenez la trompette à Paris avec la méthode Z2G - Jouez votre premier morceau en 10 séances. Cours pour débutants, amateurs et passionnés",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Header />
        {children}
        <Chatbot />
        <Footer />
      </body>
    </html>
  );
}