import { Metadata } from 'next';
import CoursProfil from "@/components/cours-profil";

export const metadata: Metadata = {
  title: "Cours de Trompette pour Enfant | Pédagogie Douce & Ludique | JC Yervant",
  description: "Initiez votre enfant à la trompette en douceur. Une pédagogie adaptée et sans force physique, avec l'utilisation du cornet à pistons léger. 1er cours offert !",
  alternates: {
    canonical: "/cours-trompette-enfant",
  },
};

export default function EnfantPage() {
  const problems = [
    {
      emoji: "🏋️",
      title: "L'instrument trop lourd pour le dos",
      description: "Une trompette classique pèse près d'un kilo et s'étend loin du corps, ce qui fatigue les bras et voûte le dos des plus jeunes. Pour y remédier, nous utilisons le cornet à pistons, plus court et maniable, qui préserve leur posture.",
      accent: "bg-amber-50 text-amber-600"
    },
    {
      emoji: "🦷",
      title: "La pression sur les dents en croissance",
      description: "La mâchoire et la dentition des enfants sont en plein développement. Une pression excessive de l'embouchure peut causer des douleurs ou déformer l'implantation dentaire. Notre méthode biomécanique exclut tout jeu en force.",
      accent: "bg-amber-50 text-amber-600"
    },
    {
      emoji: "🥱",
      title: "L'ennui face au solfège théorique",
      description: "Rien ne décourage plus un enfant que des heures de théorie papier avant de pouvoir faire chanter son instrument. Nous apprenons le solfège de manière intuitive, par le rythme, le mime et le plaisir du son immédiat.",
      accent: "bg-amber-50 text-amber-600"
    }
  ];

  const benefits = [
    "Utilisation du cornet à pistons, court et léger, idéal pour les petites mains",
    "Méthode basée sur le souffle : zéro pression sur la dentition de l'enfant",
    "Apprentissage ludique par mimétisme corporel et jeux de rythme amusants",
    "Progression valorisante avec un premier morceau simple joué rapidement"
  ];

  const faqItems = [
    {
      question: "À partir de quel âge mon enfant peut-il débuter la trompette ?",
      answer: "L'âge idéal pour commencer se situe autour de 7 ou 8 ans. À cet âge, l'enfant possède la capacité pulmonaire requise et peut tenir un instrument léger comme le cornet à pistons. C'est également la période où l'apprentissage de la musique s'intègre le plus naturellement dans son développement."
    },
    {
      question: "Pourquoi utilisez-vous le cornet à pistons plutôt que la trompette ?",
      answer: "Le cornet à pistons joue exactement les mêmes notes et possède le même doigté que la trompette. Cependant, ses tubes sont enroulés de façon plus serrée : l'instrument est donc plus court. Cela permet à l'enfant de ramener le poids plus près de son torse, ce qui évite de fatiguer ses bras et de courber son dos, tout en facilitant l'accès aux pistons."
    },
    {
      question: "Mon enfant est en train de perdre ses dents de lait. Peut-il jouer ?",
      answer: "Oui, tout à fait. Comme notre pédagogie repose sur la physique du souffle et non sur l'écrasement des lèvres contre les dents, la perte des dents de lait ne l'empêchera pas de jouer. L'embouchure s'appuie sur les muscles extérieurs du masque facial, qui restent parfaitement opérationnels."
    },
    {
      question: "Comment encourager mon enfant à pratiquer à la maison ?",
      answer: "À la maison, l'entraînement ne doit pas être une contrainte. Nous conseillons de courtes sessions de 5 à 10 minutes par jour sous forme de jeu. L'objectif est d'instaurer une habitude ludique : jouer sa mélodie préférée pour ses parents ou imiter des bruits rigolos (sirène, éléphant) avec l'embouchure."
    }
  ];

  return (
    <main className="relative min-h-screen">
      <CoursProfil
        heroTitle={
          <>
            Initiez votre enfant <br />
            <span className="font-semibold text-amber-100">à la trompette en douceur.</span>
            <span className="text-xl block mt-4 font-normal text-stone-300">(Sans forcer sur son souffle, son dos ni sur ses dents)</span>
          </>
        }
        heroSubtitle="Une pédagogie ludique et physiologique pensée pour les jeunes musiciens. Nous utilisons le cornet à pistons, plus léger, pour préserver la posture de votre enfant. Premier cours offert."
        problems={problems}
        whyTitle={<>Une pédagogie <span className="italic text-amber-600">spécialement conçue</span> pour les enfants</>}
        whySubtitle="Nous respectons la physiologie des enfants pour que l'apprentissage de la musique reste toujours un plaisir."
        benefits={benefits}
        faqItems={faqItems}
      />
    </main>
  );
}
