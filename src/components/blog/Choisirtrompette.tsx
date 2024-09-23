/* eslint-disable react/no-unescaped-entities */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import AccessoiresTrompette from './AccessoireRecommandes';

export default function ChoisirTrompette() {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const handleAccordionChange = (value: string) => {
    setOpenAccordion(value === openAccordion ? null : value);
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Choisir sa première trompette : le guide complet pour débutants 🎺</h1>

      <Card className="mb-8">
        <CardContent className="p-0">
          <Image
            src="https://m.media-amazon.com/images/I/51N37m6MAIL._AC_SL1200_.jpg"
            alt="Une trompette idéale pour les débutants"
            width={800}
            height={480}
            layout="responsive"
            className="rounded-t-lg"
          />
        </CardContent>
      </Card>

      <p className="mb-4">
        Vous avez décidé de vous lancer dans l'apprentissage de la trompette ?
        Félicitations ! C'est un instrument fascinant et gratifiant qui vous
        permettra d'explorer un large éventail de genres musicaux. Mais avant de
        vous précipiter en magasin, il est important de bien choisir votre
        première trompette.
      </p>

      <p className="mb-8">
        Ce guide complet vous accompagnera dans votre choix, en vous donnant
        des conseils pour sélectionner un instrument adapté à votre niveau, votre
        budget et vos ambitions.
      </p>

      <Accordion type="single" collapsible>
        <AccordionItem value="niveau-budget">
          <AccordionTrigger>1. Niveau et budget : trouver l'équilibre parfait</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Votre niveau d'expérience et votre budget sont deux facteurs
              déterminants dans le choix de votre première trompette.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Débutant:</strong> Si vous débutez, il n'est pas
                nécessaire d'investir dans une trompette haut de gamme. Un modèle
                d'entrée de gamme, plus abordable, vous permettra de vous
                familiariser avec l'instrument et de développer vos compétences.
              </li>
              <li className="mb-2">
                <strong>Intermédiaire:</strong> Si vous avez déjà une certaine
                expérience, vous pouvez opter pour une trompette de qualité
                moyenne. Elle vous offrira un son plus riche et une meilleure
                jouabilité.
              </li>
              <li className="mb-2">
                <strong>Avancé:</strong> Pour les musiciens expérimentés, une
                trompette professionnelle haut de gamme est le meilleur choix.
                Elle offre une précision et une fiabilité exceptionnelles.
              </li>
            </ul>
            <p>
              <strong>N'oubliez pas:</strong> Il est important de trouver un
              équilibre entre le niveau, le budget et les fonctionnalités de la
              trompette.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="types-trompettes">
          <AccordionTrigger>2. Types de trompettes : standard, piccolo, et autres</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Il existe plusieurs types de trompettes, chacune ayant ses propres
              caractéristiques et utilisations.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Trompette standard:</strong> C'est le type de trompette le
                plus courant. Elle est polyvalente et convient à la plupart des
                genres musicaux.
              </li>
              <li className="mb-2">
                <strong>Trompette piccolo:</strong> Plus petite et plus aiguë que
                la trompette standard, elle est utilisée dans des orchestres ou
                des groupes de jazz.
              </li>
              <li className="mb-2">
                <strong>Trompette "pocket" ou "travel":</strong> Encore plus
                petite et portable, elle est idéale pour les déplacements.
              </li>
              <li className="mb-2">
                <strong>Trompette à pistons ou à coulisses:</strong> Les
                trompettes à pistons sont les plus courantes pour les
                débutants, tandis que les trompettes à coulisses sont plus
                appréciées par les musiciens professionnels.
              </li>
            </ul>
            <p className="mb-4">
              <strong>Pour les débutants:</strong> Une trompette standard à
              pistons est généralement le meilleur choix.
            </p>
            <Image
              src="/types-trompette.jpg"
              alt="Différents types de trompettes"
              width={500}
              height={300}
              layout="responsive"
              className="rounded-lg"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="marques-recommandees">
          <AccordionTrigger>3. Marques recommandées pour les débutants</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Voici quelques marques de trompettes réputées pour leur qualité et
              leur prix abordable pour les débutants:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Yamaha:</strong> Une marque reconnue pour sa fiabilité
                et son son chaleureux.
              </li>
              <li className="mb-2">
                <strong>Conn-Selmer:</strong> Une marque historique, offrant des
                instruments de qualité.
              </li>
              <li className="mb-2">
                <strong>Bach:</strong> Une marque de référence pour les
                trompettistes professionnels, avec des modèles d'entrée de gamme
                accessibles.
              </li>
              <li className="mb-2">
                <strong>Getzen:</strong> Une marque appréciée pour sa
                construction solide et son son puissant.
              </li>
            </ul>
            <Image
              src="/marques-trompette.jpg"
              alt="Marques de trompettes recommandées"
              width={500}
              height={300}
              layout="responsive"
              className="rounded-lg"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="accessoires-essentiels">
          <AccordionTrigger>4. Accessoires essentiels pour débutants</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              En plus de la trompette, vous aurez besoin de quelques
              accessoires essentiels :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Une embouchure:</strong> Choisissez une embouchure
                adaptée à la taille de vos lèvres et à votre niveau. Par exemple, une{' '}
                <Link href="https://amzn.to/3TGm4kR" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  embouchure de trompette 1 1/2 C
                </Link>{' '}
                est un bon choix pour de nombreux débutants.
              </li>
              <li className="mb-2">
                <strong>Une huile pour valves:</strong> Pour lubrifier les
                valves et faciliter leur fonctionnement.
              </li>
              <li className="mb-2">
                <strong>Un chiffon de nettoyage:</strong> Pour nettoyer
                l'intérieur de la trompette.
              </li>
              <li className="mb-2">
                <strong>Un étui de transport:</strong> Pour protéger votre
                instrument.
              </li>
            </ul>
            <Image
              src="/accessoires-trompette.jpg"
              alt="Accessoires essentiels pour trompettiste"
              width={500}
              height={300}
              layout="responsive"
              className="rounded-lg"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <h2 className="text-2xl font-bold mt-8 mb-4">Conclusion:</h2>
      <p className="mb-4">
        Choisir sa première trompette peut sembler un défi, mais avec ce guide
        complet, vous êtes maintenant mieux préparé. N'hésitez pas à poser vos
        questions à un professionnel et à prendre le temps d'essayer plusieurs
        modèles pour trouver l'instrument idéal pour votre voyage musical.
      </p>
      <p className="mb-8">
        <strong>N'oubliez pas:</strong> Un bon instrument et un bon
        professeur sont les clés d'une expérience d'apprentissage
        enrichissante et motivante. Bienvenue dans le monde de la
        trompette !
      </p>

      <AccessoiresTrompette />


   </article>
  );
}