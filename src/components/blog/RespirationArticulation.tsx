/* eslint-disable react/no-unescaped-entities */

'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import AccessoiresTrompette from './AccessoireRecommandes';
import RelatedArticles from './RelatedArticles';

export default function RespirationArticulation() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Exercices de Respiration et d'Articulation pour Débutants à la
        Trompette : Maîtrisez les Fondamentaux 🎺
      </h1>

      <Image
        src="/respiration.webp"
        alt="Un trompettiste débutant pratiquant des exercices"
        width={500}
        height={300}
        layout="responsive"
        className="rounded-lg mb-6"
      />

      <p className="mb-4">
        Vous avez décidé de vous lancer dans l'apprentissage de la trompette ?
        Félicitations ! C'est un instrument fascinant et gratifiant qui vous
        permettra d'explorer un large éventail de genres musicaux. Mais pour
        tirer le meilleur parti de votre instrument, il est essentiel de
        maîtriser les bases du souffle et de l'articulation.
      </p>

      <p className="mb-6">
        Ce guide vous présentera des exercices simples et efficaces pour
        développer votre technique de respiration et d'articulation, et
        s'accompagnera de démonstrations vidéo pour vous aider à visualiser
        les mouvements corrects.
      </p>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="respiration">
          <AccordionTrigger>1. Respiration : La Base du Son</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Une bonne respiration et un contrôle musculaire précis sont essentiels pour produire un son puissant et stable à la trompette. Voici une technique adaptée et des exercices pour maîtriser votre souffle et votre embouchure :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Inspiration « Dark Vador » :</strong> Inspirez profondément en formant un « O » avec la bouche, comme si vous imitiez l'inspiration de Dark Vador. Cette technique ouvre la gorge pour permettre un flux d'air optimal.
              </li>
              <li className="mb-2">
                <strong>Expiration chaude :</strong> Expirez en prononçant « tu » avec un souffle chaud et constant. Imaginez que vous soufflez sur une vitre pour la réchauffer.
              </li>
              <li className="mb-2">
                <strong>Tension au niveau des zygomatiques :</strong> Gardez les côtés de la bouche très serrés, comme une petite pince, en tirant vos zygomatiques vers l’extérieur de toutes vos forces. Cette zone est la seule partie du corps qui doit être tendue. Le reste du corps, notamment les épaules et le cou, doit rester complètement détendu.
              </li>
              <li className="mb-2">
                <strong>Exercice en mesures :</strong> Inspirez pendant 2 mesures avec la technique « Dark Vador », en maintenant la tension des zygomatiques, puis expirez pendant 2 mesures avec un flux d'air constant. Répétez plusieurs fois pour synchroniser votre souffle avec le rythme musical.
              </li>
            </ul>
            <p>
              <strong>Conseil :</strong> Pratiquez ces exercices quotidiennement pour développer une embouchure stable, une respiration fluide, et un contrôle musculaire optimal. Cette combinaison est la clé pour un son puissant et une endurance accrue.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="articulation">
          <AccordionTrigger>2. Articulation : La Clarté du Son</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              L'articulation est la manière dont vous commencez et terminez chaque note.
              Une bonne articulation permet d'obtenir un son clair et précis. Voici
              quelques exercices pour améliorer votre articulation :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Exercice de la syllabe "Tu" :</strong> Pratiquez en prononçant
                "Tu" tout en soufflant dans l'embouchure. Commencez par des notes longues,
                puis passez à des notes plus courtes.
              </li>
              <li className="mb-2">
                <strong>Exercice de staccato :</strong> Jouez une série de notes courtes
                et détachées en utilisant la syllabe "Tu". Concentrez-vous sur la précision
                et la régularité du rythme.
              </li>
              <li className="mb-2">
                <strong>Exercice de legato :</strong> Jouez une série de notes liées en
                utilisant la syllabe "Du". Essayez de rendre la transition entre les notes
                aussi fluide que possible.
              </li>
            </ul>
            <p>
              <strong>Conseil :</strong> Commencez lentement et augmentez progressivement
              la vitesse à mesure que vous vous améliorez. La précision est plus importante
              que la vitesse au début.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2 className="text-2xl font-bold mb-4">Conclusion:</h2>
      <p className="mb-4">
        La respiration et l'articulation sont des éléments fondamentaux pour
        toute technique de trompette. En travaillant ces bases, vous
        améliorez votre son, votre endurance et votre expression musicale.
        Continuez à pratiquer régulièrement et n'hésitez pas à consulter
        d'autres ressources pour approfondir votre technique.
      </p>
      <p>
        <strong>N'oubliez pas:</strong> Un bon instrument et un bon
        professeur sont les clés d'une expérience d'apprentissage
        enrichissante et motivante. Bienvenue dans le monde de la
        trompette !
      </p>
      <RelatedArticles />

      <AccessoiresTrompette />
    </article>
  );
}