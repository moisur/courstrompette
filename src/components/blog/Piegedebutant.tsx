/* eslint-disable react/no-unescaped-entities */

'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import AccessoiresTrompette from './AccessoireRecommandes';
export default function PiegesDebutant() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Déjouer les Pièges du Débutant à la Trompette 🎺</h1>

      <Image
        src="/debutant.jpg"
        alt="Un trompettiste débutant rencontrant des difficultés"
        width={500}
        height={300}
        layout="responsive"
        className="rounded-lg mb-6"
      />

      <p className="mb-6">
        Apprendre à jouer de la trompette est une aventure passionnante,
        mais elle peut parfois se transformer en parcours semé d'embûches
        pour les débutants. Des erreurs courantes aux problèmes
        d'embouchure, il existe des pièges à éviter pour progresser
        plus facilement et prendre plaisir à jouer.
      </p>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="erreurs-courantes">
          <AccordionTrigger>1. Éviter les Erreurs Courantes</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Les débutants font souvent des erreurs qui peuvent être
              frustrantes et ralentir leur progression. Voici quelques
              conseils pour les éviter:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Ne pas respirer correctement :</strong> Une
                respiration insuffisante ou mal contrôlée peut
                entraîner des difficultés à produire un son clair et
                à jouer longtemps. Pratiquer les exercices de
                respiration est essentiel.
              </li>
              <li className="mb-2">
                <strong>Serrer l'embouchure trop fort :</strong> Une
                embouchure trop serrée peut causer des douleurs,
                des tensions et limiter le son. Apprenez à placer
                l'embouchure de manière ferme, mais détendue.
              </li>
              <li className="mb-2">
                <strong>Ne pas utiliser les valves correctement :</strong> Ne pas
                utiliser les valves correctement peut entraîner des
                notes fausses et des difficultés à jouer des
                gammes et des morceaux. Apprenez à presser
                les valves de manière précise et fluide.
              </li>
            </ul>
            <p>
              <strong>Conseils Pratiques :</strong> N'hésitez pas à
              demander de l'aide à un professeur de musique. Un
              bon professeur peut vous aider à identifier et
              à corriger vos erreurs.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="problemes-embouchure">
          <AccordionTrigger>2. Dompter les Problèmes d'Embouchure</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              L'embouchure est un élément crucial de la technique de
              la trompette, et les débutants peuvent rencontrer des
              difficultés à la maîtriser. 
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Choisir la bonne embouchure :</strong> Une
                embouchure trop petite ou trop grande peut causer des
                douleurs, des tensions et des difficultés à produire
                un son. Demandez conseil à un professeur pour
                choisir la bonne embouchure.
              </li>
              <li className="mb-2">
                <strong>Placement de l'embouchure :</strong> Placer
                l'embouchure de manière correcte est essentiel. Elle
                doit être placée fermement, mais sans tension,
                contre les lèvres.
              </li>
              <li className="mb-2">
                <strong>Contrôle de la pression :</strong> Apprenez à
                contrôler la pression que vous exercez sur
                l'embouchure. Une pression excessive peut causer
                des douleurs et limiter votre son.
              </li>
            </ul>
            <p>
              <strong>Conseils Pratiques :</strong> Entraînez-vous
              régulièrement à placer l'embouchure de manière
              correcte. Demandez conseil à un professeur pour
              améliorer votre technique d'embouchure.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2 className="text-2xl font-bold mb-4">Conclusion:</h2>
      <p className="mb-4">
        Apprendre à jouer de la trompette demande de la patience et de
        la persévérance. En apprenant à éviter les erreurs
        courantes et en maîtrisant la technique d'embouchure, vous
        améliorez votre technique et vous prenez plaisir à jouer.
      </p>
      <p>
        <strong>N'hésitez pas à consulter un professeur de musique
        pour obtenir des conseils personnalisés. Un bon professeur
        peut vous aider à corriger vos erreurs et à améliorer votre
        technique.</strong>
      </p>
      <AccessoiresTrompette />  
    </article>
  );
}