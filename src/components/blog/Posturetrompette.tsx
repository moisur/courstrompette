/* eslint-disable react/no-unescaped-entities */


'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import AccessoiresTrompette from './AccessoireRecommandes';
import RelatedArticles from './RelatedArticles';

export default function PostureTrompette() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Posture et Tenue de la Trompette : Jouer avec Confort et Précision 🎺</h1>

      <Image
        src="/posture.jpg"
        alt="Un trompettiste avec une posture correcte"
        width={500}
        height={300}
        layout="responsive"
        className="rounded-lg mb-6"
      />

      <p className="mb-4">
        Une posture et une tenue correctes sont essentielles pour jouer de la
        trompette avec confort et précision. Une mauvaise posture peut
        entraîner des tensions musculaires, des douleurs au dos, des
        problèmes d'intonation et de fatigue.
      </p>

      <p className="mb-6">
        Ce guide vous fournira des conseils pour adopter une posture
        idéale et une tenue optimale, vous permettant de jouer de manière
        confortable et efficace.
      </p>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="posture">
          <AccordionTrigger>1. Posture : La Base du Confort</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Adoptez une posture droite et détendue, en gardant le dos
              droit et les épaules basses. Évitez de vous pencher en avant
              ou de cambrer le dos.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Pieds :</strong> Placez vos pieds à la largeur des
                épaules, en vous assurant que votre poids est réparti de
                manière égale.
              </li>
              <li className="mb-2">
                <strong>Torse :</strong> Gardez votre torse droit, mais
                décontracté. N'hésitez pas à bouger légèrement votre
                corps pour trouver une position confortable.
              </li>
              <li className="mb-2">
                <strong>Tête :</strong> Maintenez votre tête droite et
                regardant vers l'avant. Évitez de baisser le menton ou
                de pencher la tête sur le côté.
              </li>
            </ul>
            <p>
              <strong>Conseils Pratiques :</strong> Faites des exercices de
              stretching pour améliorer votre posture et soulager les
              tensions musculaires. Utilisez un miroir pour vérifier
              votre posture et s'assurer que vous êtes bien droit.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tenue">
          <AccordionTrigger>2. Tenue de la Trompette : Pour une Précision Optimale</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Une bonne tenue de la trompette est essentielle pour une précision optimale et un confort accru.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Main gauche :</strong> Placez votre pouce gauche dans l’anneau sous la première coulisse, et passez votre doigt annulaire dans l’anneau de la coulisse de la troisième valve. Les autres doigts entourent doucement le corps de la trompette pour stabiliser l’instrument.
              </li>
              <li className="mb-2">
                <strong>Main droite :</strong> Positionnez votre pouce droit sous la tige de la première coulisse, entre la première et la deuxième valve. Placez vos index, majeur, et annulaire sur les pistons correspondants, en gardant les doigts légèrement arqués. Laissez l’auriculaire droit reposer sur le crochet ou flotter sans forcer.
              </li>
              <li className="mb-2">
                <strong>Embouchure :</strong> Placez l’embouchure au centre de vos lèvres de manière ferme mais confortable. Appliquez une pression modérée pour assurer l’étanchéité sans écraser les lèvres.
              </li>
            </ul>
            <p>
              <strong>Conseils Pratiques :</strong> Tenez-vous droit avec les épaules détendues, et gardez la trompette légèrement inclinée vers le bas. Utilisez un miroir pour vérifier votre posture et vos positions, et pratiquez une respiration abdominale pour un soutien optimal.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2 className="text-2xl font-bold mb-4">Conclusion:</h2>
      <p className="mb-4">
        Une bonne posture et une tenue optimale sont essentielles pour
        jouer de la trompette avec confort et précision. Prenez le
        temps de vous entraîner et d'ajuster votre posture et votre
        tenue pour trouver la position qui vous convient le mieux.
      </p>
      <p>
        <strong>N'hésitez pas à consulter un professeur de musique
        pour obtenir des conseils personnalisés. Un bon professeur
        peut vous aider à corriger vos erreurs et à améliorer votre
        technique.</strong>
      </p>
      <RelatedArticles />

      <AccessoiresTrompette /> 
    </article>
  );
}