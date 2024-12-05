'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AccessoiresTrompette from './AccessoireRecommandes';
import RelatedArticles from './RelatedArticles';

export default function TrompetteApres30() {
  return (
    <article className="container max-w-4xl mx-auto px-6 lg:px-8 py-12 space-y-12 bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-primary leading-tight">
          Découvrez la trompette après 30 ans : votre passion, votre rythme
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Transformez votre rêve musical en réalité, quels que soient votre âge et votre expérience.
        </p>
      </header>

      {/* Introductory Content */}
      <section className="prose prose-lg max-w-none text-gray-800 space-y-6">
        <p>
          Le son envoûtant de la trompette vous fascine depuis toujours ? Vous rêvez de <i><b>maîtriser</b></i> cet instrument, 
          de faire vibrer ses notes <i><b>puissantes</b></i> et <i><b>expressives</b></i> ? Mais entre les responsabilités 
          du quotidien et le poids des années, ce rêve est resté enfoui, comme une mélodie inachevée.
        </p>
        <p>
          Passé 30 ans, on se dit souvent qu&apos;il est <i><b>trop tard</b></i> pour se lancer dans l&apos;apprentissage d&apos;un instrument 
          aussi <i><b>exigeant</b></i> que la trompette. Le manque de temps, la peur du ridicule, le doute sur ses capacités... 
          Autant de freins qui nous empêchent de franchir le pas.
        </p>
      </section>

      {/* Challenges Section */}
      <section className="bg-gray-100 p-6 rounded-lg shadow-inner">
        <h2 className="text-2xl font-semibold text-primary mb-4">Les défis, vous les connaissez :</h2>
        <ul className="list-disc list-inside space-y-3 text-gray-700">
          <li>Concilier vie professionnelle, vie familiale et <i><b>pratique musicale</b></i>.</li>
          <li>Trouver la <i><b>motivation</b></i> après une longue journée de travail.</li>
          <li>Se confronter à la <i><b>technique</b></i> de l&apos;instrument.</li>
        </ul>
      </section>

      {/* Image and Motivation Section */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <Image
          src="/ZE.webp" 
          alt="Un adulte apprenant la trompette avec passion"
          width={500}
          height={300}
          className="rounded-lg shadow-lg"
        />
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">Pourquoi Maintenant ?</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              Maturité et motivation à votre portée.
            </li>
            <li className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              Apprentissage personnalisé et bienveillant.
            </li>
            <li className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              Flexibilité totale selon votre emploi du temps.
            </li>
          </ul>
        </div>
      </section>

      {/* Accordion Section */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="method">
          <AccordionTrigger className="text-xl font-semibold text-primary">La Méthode JC</AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-2 gap-6 text-gray-800">
              <div>
                <h3 className="text-lg font-medium mb-3">Cours sur mesure</h3>
                <p>Chaque leçon est adaptée à votre niveau, vos objectifs et votre rythme d&apos;apprentissage.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Accompagnement personnalisé</h3>
                <p>Un suivi individualisé qui vous encourage et vous motive à chaque étape.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Prêt à commencer ?</h2>
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

      {/* Related Articles & Accessories */}
      <RelatedArticles />
      <AccessoiresTrompette />
    </article>
  );
}
