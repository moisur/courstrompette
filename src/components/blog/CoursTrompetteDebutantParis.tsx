/* eslint-disable react/no-unescaped-entities */

/* eslint-disable react/no-unescaped-entities */

'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Remove direct import
import AccessoiresTrompette from './AccessoireRecommandes';
import RelatedArticles from './RelatedArticles';

// Dynamically import Accordion components with SSR disabled
const Accordion = dynamic(() => import('@/components/ui/accordion').then(mod => mod.Accordion), { ssr: false });
const AccordionItem = dynamic(() => import('@/components/ui/accordion').then(mod => mod.AccordionItem), { ssr: false });
const AccordionTrigger = dynamic(() => import('@/components/ui/accordion').then(mod => mod.AccordionTrigger), { ssr: false });
const AccordionContent = dynamic(() => import('@/components/ui/accordion').then(mod => mod.AccordionContent), { ssr: false });


export default function CoursDeTrompetteDebutantParis() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cours de Trompette pour Débutants à Paris 🎺</h1>

      <Image
        src="/aigu.jpg"
        alt="Un trompettiste débutant en cours à Paris"
        width={500}
        height={300}
        layout="responsive"
        className="rounded-lg mb-6"
      />

      <p className="mb-6">
        Vous avez toujours rêvé d'apprendre à jouer de la trompette, mais vous ne savez pas par où commencer ? À Paris, un univers musical riche vous attend. Je vous propose des cours de trompette adaptés aux débutants, où vous apprendrez les bases de cet instrument fascinant dans un cadre dynamique et bienveillant.
      </p>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="objectif">
          <AccordionTrigger>1. Quel est l'objectif des cours pour débutants ?</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              L’objectif de ces cours est de vous initier progressivement à la trompette, tout en vous donnant les clés nécessaires pour jouer vos premières mélodies. Que vous souhaitiez jouer des morceaux simples ou préparer des morceaux plus complexes, je m’adapte à vos besoins et à votre rythme.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Apprendre les bases :</strong> Les premières notes, la position des mains, et la respiration correcte.</li>
              <li><strong>Découvrir le rythme :</strong> Jouer en suivant un tempo et comprendre les différentes valeurs de note.</li>
              <li><strong>Appréhender la lecture de partitions :</strong> Apprendre à lire la musique pour jouer vos morceaux préférés.</li>
            </ul>
            <p>
              Chaque cours est conçu pour progresser à votre propre rythme, avec des exercices pratiques et théoriques pour vous aider à comprendre la musique et améliorer vos compétences.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pourquoiParis">
          <AccordionTrigger>2. Pourquoi prendre des cours de trompette à Paris ?</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Paris est une capitale musicale où vous trouverez une multitude d'opportunités d'apprentissage et de partage. En prenant des cours ici, vous êtes immergé dans un environnement où la musique est au cœur de la ville, avec de nombreux concerts, événements et rencontres musicales.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Environnement stimulant :</strong> Vous serez entouré de musiciens et d'artistes passionnés.</li>
              <li><strong>Accès à des ressources uniques :</strong> Paris offre une multitude d’orchestres, de concerts et de festivals pour vous inspirer.</li>
              <li><strong>Cours personnalisés :</strong> Profitez d'un suivi individualisé, conçu pour vous faire progresser rapidement.</li>
            </ul>
            <p>
              L’ambiance musicale unique de Paris vous aidera à rester motivé et inspiré tout au long de votre apprentissage.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="debutant">
          <AccordionTrigger>3. Comment se déroule un cours de trompette pour débutant ?</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Chaque cours est conçu pour vous faire progresser en douceur tout en vous amusant. Nous commencerons par les bases de l'instrument, en apprenant à souffler correctement, à produire un son clair, et à jouer des notes simples.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Échauffement :</strong> Des exercices de respiration et de travail des lèvres pour bien commencer chaque session.</li>
              <li><strong>Apprentissage des notes :</strong> Comprendre la position des notes et commencer à jouer avec des partitions simples.</li>
              <li><strong>Travail de la lecture musicale :</strong> Apprendre à lire les partitions et à jouer en rythme.</li>
            </ul>
            <p>
              À la fin de chaque cours, vous aurez appris quelque chose de nouveau et progressé à votre rythme. Je vous fournirai également des ressources pour pratiquer entre les cours.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tarifs">
          <AccordionTrigger>4. Tarifs des cours de trompette pour débutants</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Les tarifs des cours de trompette pour débutants varient en fonction de la durée et de la fréquence des séances. Je propose des cours individuels et des forfaits adaptés pour vous accompagner sur la durée.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Cours individuel :</strong> À partir de 35€ par heure.</li>
              <li><strong>Pack de 10 cours :</strong> 315€ (1 cours offert).</li>
              <li><strong>Pack de 5 cours :</strong> 170€.</li>
            </ul>
            <p>
              Des réductions sont possibles pour des forfaits plus longs. N'hésitez pas à me contacter pour discuter de vos besoins et de vos disponibilités.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <p className="mb-4">
        Prendre des cours de trompette pour débutants à Paris est une excellente manière de commencer votre aventure musicale. Grâce à un enseignement personnalisé et adapté à vos besoins, vous pourrez rapidement apprendre les bases de cet instrument et progresser à votre rythme.
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
