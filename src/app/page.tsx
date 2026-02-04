import Cours from "@/components/cours"

export const metadata = {
  title: "Cours de Trompette à Paris, en Ligne ou à Domicile | Jean Christophe Yervant",
  description: "Apprenez la trompette à Paris ou en ligne avec Jean Christophe Yervant. Méthode Z2G : jouez votre premier morceau en 10 séances. Cours pour tous niveaux.",
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
