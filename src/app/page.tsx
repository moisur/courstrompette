'use client'

import Cours from "@/components/cours"
import Chatbot from "@/components/Chatbot"

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <meta name="google-site-verification" content="jBElafHqU3eAux7x5QbUblWVpm3kVEjzME6ZKlXzglU" />
      <meta
          name="trustpilot-one-time-domain-verification-id"
          content="54137254-11d5-43e0-8675-77ebb324d3b0"
        />
      <div className="z-0">
        <Cours />
      </div>
      <div className="z-50">
        <Chatbot />
      </div>
    </main>
  )
}