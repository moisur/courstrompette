import { Metadata } from 'next'
import LogicielView from '@/components/logiciel/LogicielView'

export const metadata: Metadata = {
  title: "Logiciel d'Entraînement Trompette en Ligne | Jean Christophe Yervant",
  description: "Améliorez votre technique à la trompette avec notre logiciel de pratique interactif. Gammes, exercices Clarke et morceaux populaires avec métronome intégré.",
  keywords: ["logiciel trompette", "exercice trompette", "méthode clarke", "pratique musicale", "Jean Christophe Yervant"],
}

export default function LogicielPage() {
  return <LogicielView />
}
