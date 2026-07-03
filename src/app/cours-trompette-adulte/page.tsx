import { Metadata } from 'next';
import CoursProfil from "@/components/cours-profil";

export const metadata: Metadata = {
  title: "Cours de Trompette pour Adultes | Sans Solfège & Sans Force | JC Yervant",
  description: "Découvrez notre méthode de trompette biomécanique conçue spécialement pour les adultes. Apprenez à jouer sans douleur et sans solfège théorique lourd. 1er cours offert !",
  alternates: {
    canonical: "/cours-trompette-adulte",
  },
};

export default function AdultePage() {
  const problems = [
    {
      emoji: "⏳",
      title: "Peur d'apprendre trop tard",
      description: "Beaucoup pensent qu'à 40 ans ou plus il est trop tard pour commencer la trompette. C'est un mythe : votre maturité, votre compréhension et votre discipline d'adulte sont au contraire des atouts exceptionnels.",
      accent: "bg-amber-50 text-amber-600"
    },
    {
      emoji: "📅",
      title: "L'agenda chargé d'un actif",
      description: "Pas le temps de pratiquer des heures ? Notre méthode est entièrement optimisée pour des sessions de 15 minutes régulières par jour. La régularité bat toujours l'intensité à la trompette.",
      accent: "bg-amber-50 text-amber-600"
    },
    {
      emoji: "🧠",
      title: "La frustration de l'imitation",
      description: "En tant qu'adulte, vous avez besoin de comprendre rationnellement comment votre corps produit le son. Finie la pédagogie classique passive du 'fais comme moi' sans explications mécaniques.",
      accent: "bg-amber-50 text-amber-600"
    }
  ];

  const benefits = [
    "Une explication biomécanique rationnelle de chaque geste",
    "Apprentissage rapide de vos morceaux favoris (Jazz, Pop, Blues)",
    "Créneaux flexibles adaptés à votre vie professionnelle et familiale",
    "Garantie satisfait ou remboursé : premier morceau en 10 séances"
  ];

  const faqItems = [
    {
      question: "Est-il vraiment possible de commencer après 40, 50 ou 60 ans ?",
      answer: "Absolument ! Plus de la moitié de mes élèves ont débuté à l'âge adulte, parfois après 50 ou 60 ans. La trompette n'est pas une question de force physique pure, mais de coordination et d'efficacité du souffle. Votre maturité d'adulte (que vous ayez 40, 50, 60 ans ou plus) vous permet d'intégrer les concepts biomécaniques bien plus vite qu'un enfant."
    },
    {
      question: "Combien de temps de pratique est demandé par jour ?",
      answer: "Le secret de la trompette réside dans la régularité. Seulement 15 minutes par jour de pratique décontractée suffisent à muscler vos lèvres sans les fatiguer et à ancrer la mémoire corporelle. Pas besoin d'y passer vos week-ends !"
    },
    {
      question: "Que faire pour le bruit vis-à-vis des voisins ?",
      answer: "C'est l'angoisse n°1 de l'adulte en appartement. Nous apprenons dès le départ à soutenir le souffle à bas volume (pianissimo). De plus, il existe aujourd'hui d'excellentes sourdines d'étude électroniques (comme le Silent Brass de Yamaha) qui réduisent le volume extérieur au niveau d'un simple chuchotement tout en vous permettant d'entendre votre son au casque."
    },
    {
      question: "Dois-je apprendre le solfège théorique ?",
      answer: "Non, pas de solfège académique rigide dans ma méthode. Nous apprenons à lire la musique de manière intuitive et pratique, directement avec l'instrument en main. Le but est de vous faire plaisir rapidement avec des partitions simplifiées de standards de Jazz, Pop ou Blues."
    }
  ];

  return (
    <main className="relative min-h-screen">
      <CoursProfil
        heroTitle={
          <>
            Apprenez la trompette <br />
            <span className="font-semibold text-amber-100">à l&apos;âge adulte.</span>
            <span className="text-xl block mt-4 font-normal text-stone-300">(Sans solfège théorique lourd ni voisins fâchés)</span>
          </>
        }
        heroSubtitle="Découvrez la méthode JC : une approche progressive basée sur la physique du souffle, le relâchement du masque et le plaisir immédiat. Jouez vos premiers standards à Paris ou en ligne."
        problems={problems}
        whyTitle={<>Pourquoi la méthode JC est <span className="italic text-amber-600">adaptée aux adultes</span></>}
        whySubtitle="Nous ne formons pas des enfants de conservatoire, nous libérons votre potentiel corporel de manière logique."
        benefits={benefits}
        faqItems={faqItems}
      />
    </main>
  );
}
