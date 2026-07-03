import { Metadata } from 'next';
import CoursProfil from "@/components/cours-profil";

export const metadata: Metadata = {
  title: "Cours de Trompette Jazz & Improvisation | Feeling & Aigus | JC Yervant",
  description: "Apprenez à jouer de la trompette Jazz et à improviser en toute liberté. Liberez-vous des partitions, débloquez vos aigus et développez votre feeling. 1er cours offert !",
  alternates: {
    canonical: "/cours-trompette-jazz",
  },
};

export default function JazzPage() {
  const problems = [
    {
      emoji: "📄",
      title: "Esclave de la partition papier",
      description: "Vous êtes incapable de jouer la moindre mélodie ou de faire une note si vous n'avez pas de partition sous les yeux ? Nous entraînons votre oreille relative pour vous libérer de la dépendance visuelle et jouer au feeling.",
      accent: "bg-amber-50 text-amber-600"
    },
    {
      emoji: "😫",
      title: "Des aigus étriqués lors des solos",
      description: "Dès que vous tentez de monter dans les chorus, votre gorge se serre, votre son s'étouffe ou vous devez passer en force avec vos lèvres. Nous vous apprenons à utiliser la compression du souffle pour monter sans effort.",
      accent: "bg-amber-50 text-amber-600"
    },
    {
      emoji: "🤖",
      title: "Un jeu trop rigide ou scolaire",
      description: "Vous connaissez vos gammes mais votre phrasé sonne 'classique' ou robotique. Le swing, le placement rythmique et les inflexions de notes caractéristiques du jazz demandent une autre approche du temps et du timbre.",
      accent: "bg-amber-50 text-amber-600"
    }
  ];

  const benefits = [
    "Apprentissage de l'improvisation dès les premiers cours sur des grilles simples",
    "Déblocage de l'endurance et du registre aigu par la vitesse d'air",
    "Travail du placement rythmique (swing, binaire/ternaire) et du phrasé jazz",
    "Étude des styles des grands maîtres (Chet Baker, Miles Davis, Lee Morgan)"
  ];

  const faqItems = [
    {
      question: "Faut-il avoir des années de classique derrière soi pour apprendre le Jazz ?",
      answer: "Absolument pas. L'enseignement classique et le jazz sont deux approches différentes. Le jazz repose sur l'oralité, le feeling et l'improvisation. Vous pouvez apprendre à swinger et à improviser dès vos premiers mois de trompette, en utilisant des grilles de blues simplifiées adaptées à votre niveau."
    },
    {
      question: "Comment travaillez-vous l'improvisation en cours ?",
      answer: "Nous utilisons des outils d'accompagnement dynamiques (backing tracks, application iReal Pro) qui recréent une section rythmique complète (contrebasse, batterie, piano) dans votre salon. Nous apprenons à repérer les accords à l'oreille et à construire des mélodies simples basées sur des tensions et résolutions."
    },
    {
      question: "Comment le style feutré de Chet Baker est-il enseigné ?",
      answer: "Le son légendaire de Chet Baker repose sur un jeu très timbré, proche du murmure vocal, souvent joué avec une sourdine Harmon ou très près du micro. Nous travaillons sur le relâchement total du masque facial et un débit d'air doux mais constant pour obtenir cette sonorité ronde et mélancolique sans forcer."
    },
    {
      question: "Puis-je suivre ces cours en visio ?",
      answer: "Tout à fait. La visio se prête merveilleusement bien au jazz, car nous travaillons beaucoup par 'appel et réponse' : je vous joue un motif mélodique ou rythmique, vous l'écoutez, puis vous me le renvoyez. C'est l'essence même de l'apprentissage traditionnel du jazz à l'oreille."
    }
  ];

  return (
    <main className="relative min-h-screen">
      <CoursProfil
        heroTitle={
          <>
            Libérez votre jeu avec la <br />
            <span className="font-semibold text-amber-100">trompette Jazz & l&apos;impro.</span>
            <span className="text-xl block mt-4 font-normal text-stone-300">(Apprenez à jouer au feeling, sans être l&apos;esclave des partitions)</span>
          </>
        }
        heroSubtitle="Développez votre oreille relative, apprenez à swinger et improvisez en toute décontraction. Notre méthode biomécanique débloque votre endurance pour libérer votre créativité sur vos standards favoris."
        problems={problems}
        whyTitle={<>Pourquoi la méthode JC est <span className="italic text-amber-600">idéale pour le Jazz</span></>}
        whySubtitle="Nous reconnectons votre souffle et vos sens à votre créativité plutôt qu'à la seule rigueur de la lecture."
        benefits={benefits}
        faqItems={faqItems}
      />
    </main>
  );
}
