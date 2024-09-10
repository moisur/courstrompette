'use client'

import Cours from "@/components/cours"
import Chatbot from "@/components/Chatbot"

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <meta name="google-site-verification" content="jBElafHqU3eAux7x5QbUblWVpm3kVEjzME6ZKlXzglU" />
      <div className="z-0">
        <Cours />
      </div>
      <div className="z-50">
        <Chatbot />
      </div>
    </main>
  )
}