import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import AppShell from '@/components/AppShell';
import JsonLd from '@/components/seo/JsonLd';
import { BookingProvider } from '@/context/BookingContext';
import { getBlogMenuData } from '@/lib/markdown';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://courstrompette.fr/'),
  title: 'Cours de Trompette en ligne ou a domicile',
  description:
    'Decouvrez nos cours de Trompette pour apprendre a jouer de la trompette a votre rythme avec Jean Christophe Yervant, le meilleur professeur de trompette.',
  keywords: [
    'cours de trompette',
    'trompette paris',
    'apprendre la trompette',
    'methode JC',
    'professeur de trompette',
    'Jean Christophe Yervant',
  ],
  openGraph: {
    title: 'Cours de Trompette en ligne ou a domicile',
    description:
      'Decouvrez nos cours de Trompette pour apprendre a jouer de la trompette a votre rythme avec Jean Christophe Yervant, le meilleur professeur de trompette.',
    url: 'https://courstrompette.fr/',
    siteName: 'Cours de Trompette',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cours de Trompette en ligne ou a domicile',
    description:
      'Decouvrez nos cours de Trompette pour apprendre a jouer de la trompette a votre rythme avec Jean Christophe Yervant, le meilleur professeur de trompette.',
  },
  verification: {
    google: 'jBElafHqU3eAux7x5QbUblWVpm3kVEjzME6ZKlXzglU',
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
          <AppShell menuItems={getBlogMenuData()}>{children}</AppShell>
        </BookingProvider>
      </body>
    </html>
  );
}