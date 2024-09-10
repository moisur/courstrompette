/* eslint-disable react/no-unescaped-entities */


'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function PostureTrompette() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Posture et Tenue de la Trompette : Jouer avec Confort et Précision 🎺</h1>

      <Image
        src="/posture-trompette.jpg"
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
              Une bonne tenue de la trompette est essentielle pour une
              précision optimale et un confort accru.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Main gauche :</strong> Placez votre main gauche sur
                la première valve, en gardant vos doigts légèrement
                arqués. Utilisez votre pouce pour soutenir la
                trompette sur le côté gauche.
              </li>
              <li className="mb-2">
                <strong>Main droite :</strong> Placez votre main droite sur
                la troisième valve, en gardant vos doigts
                légèrement arqués. Utilisez votre pouce pour soutenir
                la trompette sur le côté droit.
              </li>
              <li className="mb-2">
                <strong>Embouchure :</strong> Placez l'embouchure contre
                vos lèvres de manière ferme, mais confortable. Évitez
                de serrer trop fort ou de relâcher l'embouchure.
              </li>
            </ul>
            <p>
              <strong>Conseils Pratiques :</strong> N'hésitez pas à ajuster
              votre tenue pour trouver la position la plus confortable.
              Utilisez un miroir pour vérifier votre tenue et
              s'assurer que vos doigts sont positionnés correctement.
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
    </article>
  );
}