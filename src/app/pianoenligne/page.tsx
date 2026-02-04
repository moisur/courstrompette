import { Metadata } from 'next'
import PianoView from '@/components/piano/PianoView'

export const metadata: Metadata = {
    title: "Piano Virtuel pour Trompettiste | Accordeur et Métronome en Ligne",
    description: "Utilisez notre piano virtuel gratuit pour accorder votre trompette ou pratiquer vos gammes avec un métronome intégré. Idéal pour tous les musiciens.",
    keywords: ["piano virtuel", "accordeur trompette", "métronome en ligne", "pratique musicale", "Jean Christophe Yervant"],
}

export default function PianoPage() {
    return <PianoView />
}