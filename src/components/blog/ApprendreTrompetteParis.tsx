/* eslint-disable react/no-unescaped-entities */

'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import AccessoiresTrompette from './AccessoireRecommandes';

export default function ApprendreTrompetteParis() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Pourquoi apprendre la trompette à Paris ? 🎺</h1>

      <Image
        src="/jc.jpg"
        alt="Un trompettiste dans un cadre parisien"
        width={500}
        height={300}
        layout="responsive"
        className="rounded-lg mb-6"
      />

      <p className="mb-6">
        Paris est une ville vibrante, pleine de vie et d’opportunités pour les musiciens. Que vous soyez passionné de jazz, de musique électronique ou de reggae, Paris est l’endroit idéal pour développer vos compétences musicales, notamment la trompette.
        L'effervescence de la ville et la diversité de ses styles musicaux en font un terrain de jeu parfait pour les trompettistes en herbe. 
      </p>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="benefits">
          <AccordionTrigger>1. Les avantages des cours particuliers de trompette</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Un cours particulier est l'occasion de progresser rapidement, tout en bénéficiant d'un enseignement personnalisé. Avec un professeur dédié, vous éviterez les erreurs courantes et apprendrez à maîtriser l'instrument dès les premières notes.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Progrès accéléré :</strong> Vous obtenez des conseils adaptés à votre niveau et vos besoins.</li>
              <li><strong>Correction instantanée :</strong> Un professeur vous aide à ajuster votre posture et votre souffle dès le début.</li>
              <li><strong>Approche sur-mesure :</strong> Un enseignement qui s’adapte à votre rythme et à vos objectifs musicaux.</li>
            </ul>
            <p>
              La trompette est un instrument complexe. C'est pourquoi il est essentiel d'être accompagné par un expert dès le début pour vous éviter des erreurs techniques qui risquent de freiner votre évolution.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="whoAmI">
          <AccordionTrigger>2. Qui suis-je ?</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Je suis JC, trompettiste depuis plus de 20 ans et passionné par l'enseignement. Mon parcours m'a permis de jouer dans plusieurs pays européens, en passant par l'Allemagne, la Belgique, et même un tour de France à vélo, où j’ai joué de la musique village après village.
              Depuis plus de 2 ans, je suis installé à Paris, où je partage ma passion et mes connaissances avec mes élèves.
            </p>
            <p>
              Mon objectif est simple : vous faire progresser rapidement tout en vous transmettant ma passion de la trompette. Chaque élève est unique, et je m'adapte à chacun de vous pour vous aider à atteindre vos objectifs.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="instrument">
          <AccordionTrigger>3. Quel instrument choisir ?</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Pour commencer, je recommande une trompette Yamaha. Ce modèle est parfait pour les débutants, offrant une bonne qualité de son et une facilité d’utilisation. 
              Il n’est pas nécessaire d’investir dans un modèle haut de gamme au début de votre apprentissage.
            </p>
            <p>
              <strong>Conseil :</strong> N'oubliez pas qu'une bonne trompette est un investissement sur le long terme, mais commencez par un modèle abordable pour maîtriser les bases.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="practiceTips">
          <AccordionTrigger>4. Conseils pour progresser rapidement</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              La clé de la réussite réside dans la régularité. Voici quelques conseils pour bien démarrer :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Pratique régulière :</strong> Mieux vaut jouer 15 à 30 minutes chaque jour que de longues séances occasionnelles.</li>
              <li><strong>Maîtrise des bases :</strong> Travaillez d'abord les notes de base et les gammes simples pour vous familiariser avec l’instrument.</li>
              <li><strong>Patience et persévérance :</strong> L'apprentissage de la trompette prend du temps, alors soyez patient avec vous-même.</li>
            </ul>
            <p>
              En suivant ces conseils, vous pourrez rapidement améliorer votre technique et apprécier davantage votre progression.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2 className="text-2xl font-bold mb-4">Conclusion</h2>
      <p className="mb-4">
        Apprendre la trompette à Paris est une expérience unique, enrichie par l’effervescence musicale de la ville. Que vous soyez passionné par le jazz ou l’électro, vous trouverez ici de nombreuses opportunités pour vous immerger dans la scène musicale.
        En choisissant un cours particulier, vous bénéficiez d'un apprentissage rapide et efficace, avec un professeur à votre écoute.
      </p>
      <p>
        <strong>Prêt à commencer ?</strong> Je suis impatient de vous accompagner dans votre aventure musicale à Paris !
      </p>

      <AccessoiresTrompette />
    </article>
  );
}
