import { Metadata } from 'next';
import CoursProfil from "@/components/cours-profil";

export const metadata: Metadata = {
  title: "Cours de Trompette en Ligne | Analyse Vidéo & Autonomie | JC Yervant",
  description: "Suivez nos cours de trompette en ligne par visio. Une méthode biomécanique adaptée à la distance avec diagnostic vidéo au ralenti et exercices d'auto-correction. 1er cours offert !",
  alternates: {
    canonical: "/cours-trompette-en-ligne",
  },
};

export default function EnLignePage() {
  const problems = [
    {
      emoji: "📶",
      title: "La peur de la latence visio",
      description: "Jouer ensemble en même temps est impossible en ligne à cause du décalage réseau. Notre méthode contourne ce problème par une pédagogie alternée dynamique (appel/réponse) qui renforce votre sens du tempo et de l'écoute.",
      accent: "bg-amber-50 text-amber-600"
    },
    {
      emoji: "🔍",
      title: "Crainte d'un manque de précision",
      description: "Comment corriger un geste sans être à côté ? Grâce à notre protocole d'auto-observation guidé et à l'analyse visuelle détaillée (mouvements de la mâchoire, tension du cou), aucun défaut n'échappe à l'écran.",
      accent: "bg-amber-50 text-amber-600"
    },
    {
      emoji: "🎙️",
      title: "La compression audio des micros",
      description: "Les logiciels de visio coupent ou étouffent souvent le son puissant de la trompette qu'ils prennent pour un bruit parasite. Nous vous fournissons un guide simple pour régler vos logiciels en mode 'Son d'origine pour la musique'.",
      accent: "bg-amber-50 text-amber-600"
    }
  ];

  const benefits = [
    "Flexibilité géographique : apprenez avec un expert parisien où que vous soyez",
    "Gain de temps et d'énergie : aucun déplacement requis",
    "Développement accéléré de votre autonomie et de votre oreille critique",
    "Exercices d'auto-correction précis à réaliser chez vous entre les séances"
  ];

  const faqItems = [
    {
      question: "Comment se déroule concrètement une séance de trompette en visio ?",
      answer: "Puisque nous ne pouvons pas jouer simultanément, nous fonctionnons par alternance. Je joue une phrase pour vous montrer le modèle (physique et sonore), vous la reproduisez, et je réalise un diagnostic immédiat à l'écran. Nous nous concentrons sur des repères corporels précis (relâchement des épaules, position de l'embouchure, débit d'air) très faciles à observer à la caméra."
    },
    {
      question: "De quel équipement ai-je besoin pour commencer ?",
      answer: "Une simple tablette ou un ordinateur avec webcam et une connexion internet stable suffisent pour démarrer. Nous vous recommandons d'activer l'option 'Son d'origine pour musiciens' dans Zoom ou Google Meet. Plus tard, l'achat d'un petit micro USB externe (environ 30-40€) améliorera grandement le confort d'écoute."
    },
    {
      question: "La visio est-elle adaptée pour un débutant complet ?",
      answer: "Absolument. Commencer en ligne est très efficace car la méthode biomécanique repose sur la compréhension de sa propre physique corporelle. Le fait d'être à distance vous oblige à être acteur de votre apprentissage en observant vos propres sensations, ce qui accélère votre autonomie par rapport à un cours classique."
    },
    {
      question: "Proposes-tu des retours vidéos en dehors des heures de cours ?",
      answer: "Oui ! Mes forfaits en ligne incluent un suivi asynchrone : vous pouvez m'envoyer de courtes vidéos de vos séances d'entraînement en milieu de semaine, et je vous réponds avec des conseils correctifs précis pour vous assurer de ne pas travailler sur des tensions."
    }
  ];

  return (
    <main className="relative min-h-screen">
      <CoursProfil
        heroTitle={
          <>
            Cours de trompette en ligne <br />
            <span className="font-semibold text-amber-100">par visio.</span>
            <span className="text-xl block mt-4 font-normal text-stone-300">(La rigueur de la méthode biomécanique directement chez vous)</span>
          </>
        }
        heroSubtitle="Bénéficiez d'un coaching de niveau professionnel parisien sans contrainte de transport. Notre protocole d'auto-correction vous garantit une progression rapide et autonome. Premier cours offert."
        problems={problems}
        whyTitle={<>Pourquoi notre formule en ligne est <span className="italic text-amber-600">redoutablement efficace</span></>}
        whySubtitle="Nous transformons la distance en un puissant outil d'écoute, d'auto-observation et de liberté."
        benefits={benefits}
        faqItems={faqItems}
      />
    </main>
  );
}
