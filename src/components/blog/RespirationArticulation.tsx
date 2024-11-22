/* eslint-disable react/no-unescaped-entities */

'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import AccessoiresTrompette from './AccessoireRecommandes';

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
              Une bonne respiration est essentielle pour produire un son de qualité
              et maintenir une endurance lors du jeu. Voici quelques exercices pour
              améliorer votre technique de respiration :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Respiration abdominale :</strong> Allongez-vous sur le dos,
                placez une main sur votre ventre et inspirez profondément en
                gonflant votre ventre. Expirez lentement en laissant votre ventre
                se dégonfler. Répétez 10 fois.
              </li>
              <li className="mb-2">
                <strong>Respiration en carré :</strong> Inspirez pendant 4 secondes,
                retenez votre souffle pendant 4 secondes, expirez pendant 4 secondes,
                puis attendez 4 secondes avant de recommencer. Répétez 5 fois.
              </li>
              <li className="mb-2">
                <strong>Souffler dans l'embouchure :</strong> Pratiquez la respiration
                abdominale en soufflant dans l'embouchure seule. Concentrez-vous sur
                la production d'un son stable et continu.
              </li>
            </ul>
            <p>
              <strong>Conseil :</strong> Pratiquez ces exercices quotidiennement pour
              renforcer vos muscles respiratoires et améliorer votre contrôle du souffle.
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
      <AccessoiresTrompette />
    </article>
  );
}