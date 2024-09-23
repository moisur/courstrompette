/* eslint-disable react/no-unescaped-entities */

'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AccessoiresTrompette from './AccessoireRecommandes';
export default function LexiqueTrompette() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lexique du Trompettiste Débutant : Décryptage des Termes Essentiels 🎺</h1>

      <Image
        src="/lexique.jpg"
        alt="Une trompette avec ses différentes parties"
        width={500}
        height={300}
        layout="responsive"
        className="rounded-lg mb-6"
      />

      <p className="mb-6">
        Pour un débutant, le monde de la trompette peut paraître
        complexe avec son vocabulaire spécifique. Ce lexique vous
        aidera à comprendre les termes techniques essentiels pour
        décrypter les conseils et les instructions, et pour mieux
        appréhender votre instrument.
      </p>

      <h2 className="text-2xl font-bold mb-4">Les Parties Essentielles de la Trompette</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Embouchure</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Pièce en métal placée contre les lèvres pour produire le son. Il existe différentes tailles et formes d'embouchures, adaptées aux lèvres et au niveau du trompettiste.</p>
            <div className="relative w-10 p-[50%]   rounded-lg">
              <Image
                src="/embouchure.jpg"
                alt="Une embouchure de trompette"
                fill
                style={{ 
                  objectFit: 'cover',
                  objectPosition: 'top '
                }}
                className="rounded-lg"
              />
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valves</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Les trois valves de la trompette permettent de modifier la longueur du tube et donc la hauteur des notes. En pressant une ou plusieurs valves, vous changez la hauteur du son.</p>
            <Image
              src="/valves.jpg"
              alt="Les valves d'une trompette"
              width={200}
              height={100}
              layout="responsive"
              className="rounded-lg mt-4"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Corps de la trompette</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Le tube principal de la trompette, qui est parcouru par l'air. Il existe différentes longueurs de corps de trompette, ce qui influence la hauteur du son.</p>
            <Image
              src="/corps.jpg"
              alt="Le corps d'une trompette"
              width={200}
              height={100}
              layout="responsive"
              className="rounded-lg mt-4"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pavillon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>L'extrémité évasée de la trompette, qui amplifie le son. La forme du pavillon influence le timbre du son.</p>
            <Image
              src="/pavillon.jpg"
              alt="Le pavillon d'une trompette"
              width={200}
              height={100}
              layout="responsive"
              className="rounded-lg mt-4"
            />
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Notions Essentielles</h2>

      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          <strong>Diapason :</strong> Un diapason est un instrument qui produit une note précise (la) et qui sert à ajuster l'intonation de la trompette.
        </li>
        <li className="mb-2">
          <strong>Gamme :</strong> Une gamme est une séquence de notes qui sont jouées dans un ordre précis. Il existe différentes gammes, comme la gamme majeure et la gamme mineure.
        </li>
        <li className="mb-2">
          <strong>Accord :</strong> Un accord est un ensemble de deux ou plusieurs notes qui sont jouées simultanément.
        </li>
        <li className="mb-2">
          <strong>Rythme :</strong> Le rythme est l'organisation des sons dans le temps. Il est défini par la durée de chaque note et par la position des silences.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mb-4">Conclusion:</h2>
      <p className="mb-4">
        Ce lexique vous a permis de découvrir quelques termes
        techniques essentiels pour comprendre le langage des
        trompettistes. N'hésitez pas à revenir consulter ce
        lexique si vous rencontrez un terme inconnu.
      </p>
      <p>
        <strong>Continuez à explorer le monde de la trompette et
        vous découvrirez de nouveaux termes et de nouvelles
        techniques.</strong>
      </p>
      <AccessoiresTrompette />
    </article>
    
  );
}