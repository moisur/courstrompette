/* eslint-disable react/no-unescaped-entities */


'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import AccessoiresTrompette from './AccessoireRecommandes';
import RelatedArticles from './RelatedArticles';

export default function PremiersPasTrompette() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Premiers Pas à la Trompette : Apprenez à Jouer ! 🎺</h1>

      <Image
        src="/debutant.jpg"
        alt="Un trompettiste débutant jouant une note"
        width={500}
        height={300}
        layout="responsive"
        className="rounded-lg mb-6"
      />

      <p className="mb-6">
        Vous venez de vous offrir une trompette et vous brûlez d'envie de
        commencer à jouer ? Félicitations ! Ce guide vous guidera à travers
        les premiers pas pour apprendre à jouer de la trompette, en vous
        présentant les notes, les gammes et des morceaux simples à
        maîtriser.
      </p>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="notes">
          <AccordionTrigger>1. Les Notes : La Base du Langage Musical</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              La trompette, comme tout instrument, utilise un système de notes
              musicales. Voici les notes de base que vous devez
              apprendre:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Do :</strong> La note la plus basse de la gamme majeure.</li>
              <li><strong>Ré :</strong> La deuxième note de la gamme majeure.</li>
              <li><strong>Mi :</strong> La troisième note de la gamme majeure.</li>
              <li><strong>Fa :</strong> La quatrième note de la gamme majeure.</li>
              <li><strong>Sol :</strong> La cinquième note de la gamme majeure.</li>
              <li><strong>La :</strong> La sixième note de la gamme majeure.</li>
              <li><strong>Si :</strong> La septième note de la gamme majeure.</li>
            </ul>
            <p>
              <strong>Conseils Pratiques :</strong> Pratiquez chaque note
              individuellement, en vous concentrant sur la production
              d'un son clair et précis. Utilisez un diapason pour
              vous aider à ajuster l'intonation.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="gammes">
          <AccordionTrigger>2. Les Gammes : Apprendre à Jouer en Suite</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Les gammes sont des séquences de notes qui vous aident à
              développer votre technique et votre oreille musicale. Voici
              la gamme majeure la plus simple à apprendre:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Gamme de Do Majeur:</strong> Do, Ré, Mi, Fa, Sol,
                La, Si, Do.
              </li>
            </ul>
            <p>
              <strong>Conseils Pratiques :</strong> Pratiquez chaque
              gamme lentement et en vous concentrant sur la clarté
              de chaque note. Répétez chaque gamme plusieurs
              fois.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="morceaux">
          <AccordionTrigger>3. Les Premiers Morceaux : Jouer de la Musique !</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Une fois que vous maîtrisez les notes de base et quelques
              gammes, vous pouvez commencer à apprendre des
              morceaux simples. Voici quelques exemples:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>"Hot Cross Buns" :</strong> Une mélodie populaire
                facile à jouer.
              </li>
              <li>
                <strong>"Mary Had a Little Lamb" :</strong> Une autre
                mélodie classique et simple.
              </li>
              <li>
                <strong>"Ode à la Joie" :</strong> Un extrait de la 9ème symphonie de Beethoven,
                adapté pour les débutants.
              </li>
              <li>
                <strong>"Au Clair de la Lune" :</strong> Une chanson française traditionnelle,
                parfaite pour les débutants.
              </li>
            </ul>
            <p>
              <strong>Conseils Pratiques :</strong> Choisissez des
              morceaux qui vous plaisent et qui sont adaptés à votre
              niveau. Pratiquez chaque morceau lentement et
              en vous concentrant sur la précision et la clarté
              de chaque note.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2 className="text-2xl font-bold mb-4">Conclusion:</h2>
      <p className="mb-4">
        Félicitations pour vos premiers pas à la trompette! En suivant
        ces étapes, vous avez fait un grand pas vers la maîtrise de
        cet instrument fascinant. Continuez à pratiquer
        régulièrement et n'hésitez pas à explorer de nouvelles
        mélodies et de nouveaux défis. 
      </p>
      <p>
        <strong>N'oubliez pas:</strong> La pratique est la clé du succès !  
      </p>
      <RelatedArticles />
      <AccessoiresTrompette />
    </article>
  );
}