import Cours from "@/components/cours"

export const metadata = {
  title: "Apprenez la trompette à Paris – Aigus, technique, musicalité | JC Yervant",
  description: "Débloquez vos aigus, gagnez en puissance et jouez votre 1er morceau en 10 séances. Méthode unique JC – débutants, amateurs et pros. Cours à Paris, domicile ou en ligne. Places limitées.",
  verification: {
    google: "jBElafHqU3eAux7x5QbUblWVpm3kVEjzME6ZKlXzglU",
  },
  other: {
    "trustpilot-one-time-domain-verification-id": "54137254-11d5-43e0-8675-77ebb324d3b0",
  },
};

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <div className="z-0">
        <Cours />
      </div>
    </main>
  )
}
