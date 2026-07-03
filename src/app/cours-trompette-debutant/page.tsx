import { Metadata } from 'next';
import CoursProfil from "@/components/cours-profil";

export const metadata: Metadata = {
  title: "Cours de Trompette Débutant | Zéro Douleur & Premier Son | JC Yervant",
  description: "Vous débutez de zéro ? Découvrez notre méthode biomécanique pour obtenir un premier son propre sans forcer sur vos lèvres et sans mauvaises habitudes. 1er cours offert !",
  alternates: {
    canonical: "/cours-trompette-debutant",
  },
};

export default function DebutantPage() {
  const problems = [
    {
      emoji: "🦆",
      title: "Le son 'canard' strident",
      description: "Au début, le son est souvent instable, nasillard ou agressif. C'est simplement parce que la colonne d'air ne circule pas librement et que vos lèvres sont trop crispées. Nous corrigeons cela dès la première heure.",
      accent: "bg-amber-50 text-amber-600"
    },
    {
      emoji: "🚧",
      title: "Le piège des mauvaises habitudes",
      description: "S'auto-former conduit souvent à écraser l'embouchure contre ses dents pour arracher les notes. C'est ce qu'on appelle un 'optimum local' : vous sortez la note aujourd'hui, mais vous bloquez votre progression pour les 10 prochaines années.",
      accent: "bg-amber-50 text-amber-600"
    },
    {
      emoji: "🛒",
      title: "Le labyrinthe du matériel",
      description: "Quel instrument choisir ? Quelle taille d'embouchure ? Les débutants achètent souvent des trompettes low-cost injouables sur internet qui les dégoûtent de la musique. Nous vous guidons pour louer ou acheter le bon outil.",
      accent: "bg-amber-50 text-amber-600"
    }
  ];

  const benefits = [
    "Obtention d'un timbre propre et rond dès les premières séances",
    "Pédagogie sans forcer : protection absolue de vos tissus labiaux",
    "Conseil et aide personnalisée pour le choix ou la location de votre trompette",
    "Morceaux d'apprentissage motivants et simplifiés adaptés à votre niveau"
  ];

  const faqItems = [
    {
      question: "Dois-je acheter une trompette avant mon premier cours ?",
      answer: "Non, c'est inutile ! Pour le cours découverte offert, je mets à votre disposition un instrument propre et désinfecté. Si vous décidez de poursuivre l'aventure, je vous accompagnerai pour trouver une location ou un achat d'occasion de qualité, à un tarif adapté à votre budget."
    },
    {
      question: "Est-ce que jouer de la trompette fait mal aux lèvres ou aux dents ?",
      answer: "Absolument pas, si la technique est bonne. La douleur n'est pas un passage obligatoire, c'est le signal d'un geste erroné. Notre méthode enseigne comment sceller l'embouchure pour assurer l'étanchéité sans jamais écraser la lèvre supérieure qui doit rester libre de vibrer."
    },
    {
      question: "Combien de temps faut-il pour jouer une chanson simple ?",
      answer: "Grâce à notre approche axée sur le plaisir immédiat et des exercices ciblés, vous serez en mesure de jouer votre premier morceau (comme un thème de jazz ou de variété simple) au bout de 10 séances d'apprentissage régulier."
    },
    {
      question: "Je n'ai aucune notion de musique ni de solfège. Est-ce un problème ?",
      answer: "Aucun ! Plus de la moitié des élèves débutants partent d'une feuille blanche. Nous apprenons le rythme et la lecture de notes de façon organique, au fur et à mesure de la pratique sur l'instrument, sans jamais passer par de la théorie pure et ennuyeuse."
    }
  ];

  return (
    <main className="relative min-h-screen">
      <CoursProfil
        heroTitle={
          <>
            Démarrez la trompette <br />
            <span className="font-semibold text-amber-100">du bon pied.</span>
            <span className="text-xl block mt-4 font-normal text-stone-300">(Zéro douleur, zéro mauvaise habitude dès le départ)</span>
          </>
        }
        heroSubtitle="Faites chanter votre instrument dès les premières séances. Notre méthode biomécanique douce pose des fondations saines pour jouer avec aisance et décontraction. Premier cours offert."
        problems={problems}
        whyTitle={<>Pourquoi la méthode JC est <span className="italic text-amber-600">idéale pour débuter</span></>}
        whySubtitle="Nous éliminons les blocages classiques dès les premières minutes pour que l'apprentissage reste un plaisir."
        benefits={benefits}
        faqItems={faqItems}
      />
    </main>
  );
}
