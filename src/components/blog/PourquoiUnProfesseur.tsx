/* eslint-disable react/no-unescaped-entities */


'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AccessoiresTrompette from './AccessoireRecommandes';
import RelatedArticles from './RelatedArticles';

export default function PourquoiUnProfesseur() {
  return (
    <article className="container max-w-4xl mx-auto px-6 lg:px-8 py-12 space-y-12 bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-primary leading-tight">
          Pourquoi un professeur de trompette est-il indispensable ?
        </h1>
      </header>

      {/* Introductory Content */}
      <section className="prose prose-lg max-w-none text-gray-800 space-y-6">
        <p>
          Vous rêvez de faire résonner les notes claires et puissantes d'une trompette ? L'attrait de cet instrument est indéniable, mais entre les tutoriels en ligne et les méthodes autodidactes, une question se pose : est-il <i><b>vraiment nécessaire</b></i> de prendre des cours avec un professeur ?
        </p>
        <p>La réponse, sans détour, est <i><b>oui</b></i>, et voici pourquoi :</p>
      </section>


      {/* Accordion Section */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="mauvaisesHabitudes">
          <AccordionTrigger className="text-xl font-semibold text-primary">Éviter les mauvaises habitudes, un gain de temps précieux</AccordionTrigger>
          <AccordionContent>
            <p>Apprendre seul, c'est s'exposer au risque de développer de mauvaises habitudes, parfois invisibles au début, mais qui peuvent devenir de véritables freins à votre progression. "Sans personne pour vous dire ce que vous faites de mal, […] vous pourriez finir par faire quelque chose de <i><b>très mal</b></i> sans jamais vous en rendre compte", témoigne un trompettiste. Un professeur, avec son œil expert, repérera et corrigera ces erreurs dès le départ, vous évitant ainsi des mois, voire des années, de frustration. "J'avais l'habitude de parler avec ma gorge jusqu'à ce que mon professeur de groupe l'attrape", confirme un autre musicien. Imaginez le temps perdu à ancrer une mauvaise technique !</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="accompagnement">
          <AccordionTrigger className="text-xl font-semibold text-primary">Un accompagnement personnalisé, la clé du succès</AccordionTrigger>
          <AccordionContent>
            <p>Chaque individu est différent. La forme de votre bouche, l'épaisseur de vos lèvres, votre morphologie… tous ces éléments influencent votre façon de jouer. "La façon dont vous jouez sera différente de la façon dont quelqu'un d'autre joue en raison de l'état de votre corps", explique un musicien expérimenté. Un professeur adaptera sa pédagogie à vos spécificités, vous offrant un accompagnement <i><b>personnalisé</b></i> et <i><b>optimisé</b></i> pour votre progression. Les tutoriels en ligne, aussi complets soient-ils, ne peuvent pas offrir cette individualisation.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="motivation">
          <AccordionTrigger className="text-xl font-semibold text-primary">Motivation et inspiration, le carburant de votre apprentissage</AccordionTrigger>
          <AccordionContent>
            <p>Un professeur, c'est bien plus qu'un simple correcteur de technique. C'est un mentor, un guide, une source d'inspiration. Il vous encouragera, vous motivera et vous aidera à surmonter les inévitables moments de doute. Il partagera avec vous sa passion pour la musique et vous ouvrira de nouveaux horizons. "Il est possible d'apprendre par vous-même en ligne, mais avoir quelqu'un assis à vos côtés pour critiquer votre jeu et vous aider à améliorer ces compétences est <i><b>plus gratifiant</b></i> à long terme", témoigne un musicien.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ressources">
          <AccordionTrigger className="text-xl font-semibold text-primary">Des ressources en ligne, un complément, pas un substitut</AccordionTrigger>
          <AccordionContent>
            <p>Certes, il existe d'excellentes ressources en ligne, comme les méthodes "Du mystère à la maîtrise" ou "Power Player Trompette". Elles peuvent être un complément <i><b>utile</b></i> à l'enseignement d'un professeur, mais ne peuvent en aucun cas le remplacer. "Même si les ressources en ligne peuvent être utiles dans une certaine mesure, <i><b>OBTENEZ UN PROFESSEUR</b></i>".</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>


      {/* Call to Action */}
      <div className="text-center">
        <p className="text-xl text-gray-700 mb-6">
          Si vous êtes <i><b>sérieux</b></i> dans votre désir d’apprendre la trompette, investir dans un professeur est la <i><b>meilleure décision</b></i> que vous puissiez prendre. C’est un investissement en vous-même, en votre passion, en votre avenir musical. Alors, n’hésitez plus, trouvez le professeur qui vous correspond et lancez-vous dans cette merveilleuse aventure !
        </p>        <a
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