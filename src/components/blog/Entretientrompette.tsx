/* eslint-disable react/no-unescaped-entities */


'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import AccessoiresTrompette from './AccessoireRecommandes';
import RelatedArticles from './RelatedArticles';

export default function EntretienTrompette() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Entretenir sa Trompette : Conseils pour un Instrument Brillant 🎺</h1>

      <Image
        src="https://m.media-amazon.com/images/I/71m+vRS7I7L._AC_SL1500_.jpg"
        alt="Un trompettiste nettoyant sa trompette"
        width={500}
        height={300}
        layout="responsive"
        className="rounded-lg mb-6"
      />

      <p className="mb-6">
        Un instrument bien entretenu est un instrument qui chante ! Pour
        assurer la brillance de votre trompette et garantir son bon
        fonctionnement, il est essentiel de lui apporter un entretien
        régulier. Voici quelques conseils pour nettoyer et lubrifier votre
        trompette :
      </p>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="nettoyage">
          <AccordionTrigger>1. Nettoyage : Un Instrument Propre, un Son Pur</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Le nettoyage régulier est primordial pour éviter l'accumulation
              de saletés et d'humidité, qui peuvent altérer le son et
              endommager l'instrument. 
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Nettoyez l'embouchure :</strong> Utilisez un chiffon
                doux et un nettoyant spécial embouchure pour la nettoyer
                après chaque utilisation.
              </li>
              <li className="mb-2">
                <strong>Nettoyez les valves :</strong> Utilisez un
                nettoyeur de valves et un chiffon doux pour nettoyer les
                valves et leur logement.
              </li>
              <li className="mb-2">
                <strong>Nettoyez le corps de la trompette :</strong> Utilisez
                un chiffon doux et sec pour essuyer l'intérieur et l'extérieur
                de la trompette.
              </li>
            </ul>
            <p>
              <strong>Conseils Pratiques :</strong> Nettoyez votre trompette
              après chaque utilisation. Évitez les produits abrasifs et
              l'eau pour nettoyer l'intérieur.  
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="lubrification">
          <AccordionTrigger>2. Lubrification : Un Mouvement Fluide, un Son Libre</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              La lubrification des valves est essentielle pour assurer un
              mouvement fluide et précis.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">
                <strong>Utilisez une huile de valves de qualité :</strong> Choisissez
                une huile spécialement conçue pour les valves de trompette.
              </li>
              <li className="mb-2">
                <strong>Lubrifiez les valves régulièrement :</strong> Appliquez
                une goutte d'huile sur chaque valve, en vous assurant que
                l'huile est bien répartie.
              </li>
              <li className="mb-2">
                <strong>Nettoyez l'excès d'huile :</strong> Retirez tout excès
                d'huile avec un chiffon doux.
              </li>
            </ul>
            <p>
              <strong>Conseils Pratiques :</strong> Lubrifiez les valves de
              votre trompette avant chaque utilisation. N'utilisez pas
              d'huile excessive.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2 className="text-2xl font-bold mb-4">Conclusion:</h2>
      <p className="mb-4">
        Un entretien régulier est la clé d'un instrument de musique qui
        fonctionne parfaitement et qui vous permet de jouer à votre
        plein potentiel. En suivant ces conseils simples, vous
        prolongerez la durée de vie de votre trompette et vous
        assurerez qu'elle continue à produire un son clair et
        brillant.
      </p>
      <p>
        <strong>N'hésitez pas à consulter un professionnel si vous avez
        des questions spécifiques ou si vous rencontrez des
        problèmes avec l'entretien de votre instrument.</strong>
      </p>
      <RelatedArticles />
      <AccessoiresTrompette />

    </article>
  );
}