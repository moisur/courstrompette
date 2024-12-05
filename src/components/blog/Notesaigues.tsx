/* eslint-disable react/no-unescaped-entities */

'use client';

import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'; // Importer Link
import AccessoiresTrompette from './AccessoireRecommandes';
import RelatedArticles from './RelatedArticles';

export default function NotesAiguës() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notes Aiguës à la Trompette : Le Guide Complet pour les Débutants</h1>

      <Card className="mb-6">
        <CardContent className="p-0">
          <Image
            src="/aigu.jpg"
            alt="Trompettiste jouant des notes aiguës"
            width={500}
            height={300}
            layout="responsive"
            className="rounded-t-lg"
          />
        </CardContent>
      </Card>

      <p className="mb-6">
        Tu rêves de jouer des notes aiguës à la trompette, mais tu as l'impression que tes lèvres ne veulent pas coopérer ? Ne t'inquiète pas, c'est un problème courant ! Beaucoup de trompettistes débutants se sentent bloqués lorsqu'ils essaient de monter dans les aigus.
      </p>

      <h2 className="text-2xl font-bold mb-4">Oublie la tension :</h2>

      <p className="mb-6">
        La plupart des trompettistes pensent qu'il faut serrer les lèvres pour jouer des notes aiguës. Mais c'est faux ! En fait, la tension excessive fatigue les lèvres et rend le jeu difficile.
      </p>

      <Card className="mb-6">
        <CardContent className="p-0">
          <Image
            src="/aigu2.webp" 
            alt="Trompettiste avec une expression tendue"
            width={500}
            height={300}
            layout="responsive"
            className="rounded-t-lg"
          />
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">La clé : la fréquence !</h2>

      <p className="mb-6">
        La méthode M.D.A.S. utilise une approche différente. Elle se concentre sur la fréquence de vibration des lèvres. Plus les lèvres vibrent rapidement, plus la note est aiguë.
      </p>

      <h2 className="text-2xl font-bold mb-4">Le "turbo" de l'embouchure :</h2>

      <p className="mb-6">
        La méthode M.D.A.S. utilise un "turbo" naturel de l'embouchure appelé HFA. Imagine que c'est comme un petit moteur qui permet aux lèvres de vibrer plus rapidement et plus facilement.
      </p>

      <h2 className="text-2xl font-bold mb-4">Comment activer le HFA ?</h2>

      <p className="mb-6">
        Le HFA se trouve entre tes dents supérieures et ta lèvre inférieure. Il est naturellement petit et ne nécessite pas de tension pour fonctionner. En ajustant légèrement la position de ta lèvre inférieure, tu peux contrôler la taille du HFA et ainsi changer la fréquence de vibration.
      </p>



      <h2 className="text-2xl font-bold mb-4">Jouer avec plus de facilité :</h2>

      <p className="mb-6">
        La méthode M.D.A.S. te permettra de jouer des notes aiguës sans te fatiguer, avec un son plus clair et plus puissant.
      </p>

      <h2 className="text-2xl font-bold mb-4">C'est simple, non ?</h2>

      <p className="mb-6">
        N'hésite pas à tester la méthode M.D.A.S. et à voir par toi-même à quel point elle peut t'aider à progresser !
      </p>
      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Prêt à Commencer ?</h2>
        <p className="text-xl text-gray-700 mb-6">
          Votre premier cours d&apos;essai est gratuit. Aucun engagement, juste la musique.
        </p>
        <a 
          href="/#booking" 
          className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
          >
          Réserver mon cours gratuit
        </a>
      </div>
      <RelatedArticles />
      <AccessoiresTrompette />

    </article>
  );
}
