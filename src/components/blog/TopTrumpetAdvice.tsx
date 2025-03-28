/* eslint-disable react/no-unescaped-entities */

"use client";

import Image from "next/image";
import AccessoiresTrompette from "./AccessoireRecommandes";
import RelatedArticles from "./RelatedArticles";

export default function WisdomFromTheMasters() {

  return (
    <article className="container max-w-4xl mx-auto px-6 lg:px-8 py-12 space-y-12 bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-primary leading-tight">
          Conseils de Top Trompettistes : Routine de Pratique & Sagesse des
          Maîtres
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Découvrez les routines de pratique des 17 plus grands trompettistes
          (Michael Sachs, Arturo Sandoval, Randy Brecker) pour améliorer votre
          jeu et votre routine de trompette.
        </p>
      </header>

      {/* Introductory Content */}
      <section className="prose prose-lg max-w-none text-gray-800 space-y-6">
        <Image
          src="/blog/TopTrumpetAdvice (1).webp" // REMPLACER PAR TON IMAGE
          alt="Trompette"
          width={800}
          height={400}
          className="rounded-lg shadow-lg mb-4"
          priority
        />
        <p>
          Alors que vous sortez votre livre d'Arban pour la énième fois, vous
          vous êtes probablement demandé ce que vos trompettistes préférés
          pratiquent. Vos héros s'appuient-ils également sur les mêmes études et
          les mêmes exercices de lèvres ? Combien d'heures par jour jouent-ils ?
          Découvrez comment les plus grands trompettistes abordent leur
          pratique.
        </p>
        <p>
          Le trompettiste et YouTuber{" "}
          <a
            href="https://www.youtube.com/c/JoshRzepkaMusic"
            target="_blank"
            rel="noopener noreferrer"
          >
            Josh Rzepka
          </a>{" "}
          avait les mêmes questions et a décidé de les poser. Dans une vidéo
          intitulée «
          <a
            href="https://www.youtube.com/watch?v=3vmTFumXOsI&list=PLSfMy6oITkkvEWisa13-xD82wgcFFMG3k&index=2"
            target="_blank"
            rel="noopener noreferrer"
          >
            À quoi ressemble votre journée de pratique typique ?
          </a>
           », Rzepka interviewe 17 trompettistes très différents, tous légendes
          et lauréats, sur leurs routines typiques — et idéales. Les interviews
          varient en longueur ; certains approfondissent les livres qu'ils
          utilisent et pendant combien de temps. D'autres sont plus généraux ou
          philosophiques. Ensemble, ils dressent un portrait illuminant des
          types de pratique qui contribuent à une carrière de trompettiste
          réussie. Découvrez les secrets de leur succès.
        </p>
        <p>Voici les trompettistes interviewés :</p>
        <ul>
          <li>
            <a
              href="https://www.instagram.com/michaelsachs_/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Michael Sachs
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/briaskonberg/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bria Skonberg
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/trumpeterchris/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chris Coletti
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/bijonwatsontpt/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bijon Watson
            </a>
          </li>
          <li>
            <a
              href="https://cso.org/about/performers/cso-musicians/brass/trumpet/tage-larsen/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tage Larsen
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/randybrecker/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Randy Brecker
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/ingridjensenmusic/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ingrid Jensen
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/brianlynchjazz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Brian Lynch
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/josesibajatpt/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Jose SIbaja
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/arturo_sandoval_arocha/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Arturo Sandoval
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/selinajasminott/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Selina Ott
            </a>
          </li>
          <li>
            <a
              href="https://en.wikipedia.org/wiki/Roger_Ingram"
              target="_blank"
              rel="noopener noreferrer"
            >
              Roger Ingram
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/lessievtrumpet/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Lessie Vonner
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/kblizo/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Karin Bliznik
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/pachofloresofficial/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pacho Flores
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/kennyrampton/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kenny Rampton
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/tinethinghelseth/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tine Thing Helseth
            </a>
          </li>
        </ul>
      </section>

      {/* Focus on Sound Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-primary">
          Focus sur le Son : L'importance capitale pour les Trompettistes
        </h2>
        <p className="text-gray-800">
          S'il y a une chose sur laquelle la plupart des personnes interrogées
          s'entendent, c'est qu'un bon son passe avant tout. De nombreux joueurs
          commencent la journée avec des exercices axés sur la production du
          son, du bourdonnement aux sons longs en passant par les études de flux
          et les études lyriques. Même les jazzmen et les pop stars comme Randy
          Brecker et Lessie Vonner incluent des études classiques dans leurs
          routines afin de garder leurs sons cohérents et résonnants. Améliorez
          votre technique de son à la trompette.
        </p>
      </section>

      {/* Fundamentals Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-primary">
          Fondamentaux de la Trompette : Flexibilité, Articulation & Gamme
          Essentielles
        </h2>
        <p className="text-gray-800">
          Il existe d'autres fondamentaux qui nécessitent également un travail
          quotidien, et presque tous les joueurs intègrent la flexibilité,
          l'articulation et la gamme dans leurs routines. Travaillez la
          flexibilité, l'articulation et la gamme pour une technique de
          trompette solide.
        </p>
        <ul>
          <li>
            Randy Brecker et{" "}
            <a
              href="https://www.jazz.org/JLCO/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kenny Rampton de l'Orchestre de Jazz du Lincoln Center
            </a>{" "}
            utilisent des exercices de la méthode{" "}
            <a
              href="https://www.amazon.com/Carmine-Caruso-Musical-Calisthenics-Brass/dp/0634046411/ref=asc_df_0634046411/?tag=hyprod-20&linkCode=df0&hvadid=312057344057&hvpos=&hvnetw=g&hvrand=9817929531908257561&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9018832&hvtargid=pla-526884870628&psc=1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Carmine Caruso
            </a>
            . Apprenez la méthode Carmine Caruso
          </li>
          <li>
            Michael Sachs de l'Orchestre de Cleveland et Karin Bliznik de
            l'Orchestre Symphonique de Saint-Louis ne jurent que par les{" "}
            <a
              href="https://charlescolin.com/product/articulation-studies/"
              target="_blank"
              rel="noopener noreferrer"
            >
              études d'articulation de Chris Gekker
            </a>
            . Découvrez les études de Chris Gekker.
          </li>
          <li>
            Pour la flexibilité, Sachs et le joueur de jazz acclamé Brian Lynch
            recommandent les exercices{" "}
            <a
              href="https://www.amazon.com/Lip-Flexibilities-All-Brass-Instruments/dp/0963085662"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bai Lin
            </a>
            . Utilisez les exercices de Bai Lin.
          </li>
          <li>
            Les classiques : presque tous les joueurs ont mentionné Arban,
            Clarke ou Schlossberg. Consultez les méthode Arban, Clarke ou
            Schlossberg
          </li>
        </ul>
      </section>

      {/* Customize Your Routine Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-primary">
          Personnalisez Votre Routine de Trompette : Conseils d'Experts
        </h2>
        <p className="text-gray-800">
          Et bien qu'ils s'inspirent de diverses méthodes populaires, les
          joueurs ont tous passé du temps à modifier et à personnaliser leurs
          routines pour qu'elles correspondent à leurs préférences et à leurs
          besoins personnels. Le joueur de premier plan acclamé Roger Ingram
          intègre un accordeur dans sa pratique de Schlossberg, et Lynch modifie
          les études de flux pour les rendre plus semblables aux modèles de
          jazz. Tage Larsen, de l'Orchestre Symphonique de Chicago, suivait
          strictement l'échauffement de 20 minutes de Michael Davis, mais il a
          modifié de nombreux aspects de la routine au fil des ans pour qu'elle
          corresponde à ses propres besoins (il s'amuse toujours à jouer avec
          l'accompagnement du CD inclus !). De nombreux joueurs divisent leur
          pratique en séances de longueurs variables, en veillant à intégrer{" "}
          <a
            href="https://www.trumpetwarmup.com/post/a-guide-to-fundamentals-building-a-great-foundation"
            target="_blank"
            rel="noopener noreferrer"
          >
            le repos et la récupération
          </a>{" "}
          dans la journée.
        </p>
      </section>

      {/* Practice Duration Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-primary">
          Combien de temps pratiquer ?
        </h2>
        <p className="text-gray-800">
          S'il y a une chose qui varie le plus entre toutes les interviews,
          c'est quand et pendant combien de temps les joueurs pratiquent.
          Certaines personnes sont constamment sur la route et n'ont jamais
          l'occasion de s'échauffer. D'autres limitent leurs séances de pratique
          à 90 minutes maximum, tandis qu'
          <strong>
            Arturo Sandoval prétend qu'il pratiquait huit heures par jour !
          </strong>
          . Ingram aime garder ses trompettes autour de la maison pour de
          courtes séances de pratique impromptues. Et tandis que de nombreux
          joueurs aiment s'échauffer tôt le matin, Brecker préfère s'échauffer
          l'après-midi et pratiquer tard dans la nuit. Trouvez le temps de
          pratique idéal pour vous.
        </p>
      </section>

      {/* Chris Coletti Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-primary">Chris Coletti</h2>
        <p className="text-gray-800">
          Chris Coletti, ancien membre du Canadian Brass, décrit une approche
          particulièrement intéressante de la structuration d'une routine.
          Inspiré par des investisseurs comme David Swensen, il a créé un
          diagramme à secteurs qui intègre les différents fondamentaux dans la
          mesure qu'il juge nécessaire. Chaque séance de pratique, quelle que
          soit sa durée, suit les proportions du diagramme à secteurs, et à la
          fin de la semaine, il ajuste le diagramme en fonction des domaines qui
          se sont le plus améliorés. Comme beaucoup d'autres joueurs, son
          approche systématique combine une cohérence hebdomadaire avec une
          réévaluation et une modification constantes. Adaptez votre routine
          comme Chris Coletti.
        </p>
      </section>

      {/* Just Play Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-primary">
          JOUEZ tout simplement !
        </h2>
        <p className="text-gray-800">
          Bien sûr, une journée de pratique idéale ne serait pas complète sans
          un peu de musique. Les routines de nombreux joueurs changent en
          fonction des représentations musicales à venir. Brecker aime jouer
          avec des disques pendant des heures chaque soir, augmentant son temps
          de jeu à l'approche d'un concert à haute intensité. Roger Ingram
          essaie de jouer dans un style différent chaque jour pour rester
          flexible et inspiré. La soliste de trompette norvégienne Tine Thing
          Helseth, qui admet qu'elle n'aime pas pratiquer, essaie de garder les
          choses fraîches, changeant complètement la plupart de sa routine en
          fonction des concerts à venir. Et José Sibaja du Boston Brass aime
          réserver du temps à la fin de sa journée de pratique « juste pour
          jouer ». N'oubliez pas de vous faire plaisir !
        </p>
      </section>

      {/* Conclusion Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-primary">
          Conclusion : Apprenez des meilleurs trompettistes
        </h2>
        <p className="text-gray-800">
          Il est clair que chaque joueur a réfléchi de manière critique et
          méthodique à sa routine de pratique, en s'efforçant d'adopter un
          régime qui corresponde à ses objectifs techniques, créatifs et
          personnels. Regardez la
          <a
            href="https://www.youtube.com/watch?v=3vmTFumXOsI&t=134s"
            target="_blank"
            rel="noopener noreferrer"
          >
            vidéo complète
          </a>
          pour en savoir plus auprès de ces grands trompettistes ! Et consultez
          le reste de la chaîne de
          <a
            href="https://www.youtube.com/channel/UCFxmvV7-hslNN_B3U4EA8rg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Josh
          </a>
          pour d'autres interviews, des conseils de trompette et de nombreux
          autres éléments liés à la trompette.
        </p>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Prêt à Vous Lancer ?
          </h2>
          <p className="text-xl text-gray-700 mb-6">
            Commencez votre apprentissage de la trompette dès aujourd'hui !
          </p>
          <a
            href="/#booking" // Remplacez par le lien correct
            className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
          >
            Trouver un Cours de Trompette
          </a>
        </div>
      </section>

      {/* Related Articles & Accessories */}
      <RelatedArticles />
      <AccessoiresTrompette />
    </article>
  );
}
