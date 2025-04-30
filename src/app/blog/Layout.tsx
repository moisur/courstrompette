import Head from 'next/head'
import React from 'react'
import { Analytics } from "@vercel/analytics/react"

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export default function Layout({ children, title, description }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title} - Cours de Trompette</title>
        <meta name="description" content={description} />
      </Head>
      <main className="container mx-auto px-4 py-20">
        {children}
      </main>
      <footer className="text-center py-4">
        <p>© {new Date().getFullYear()} Cours de Trompette</p>
        <p>
          <a href="#">Contact</a> | <a href="#">Mentions légales</a>
        </p>
      </footer>
    </>
  )
}
