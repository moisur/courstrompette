/* eslint-disable react/no-unescaped-entities */

'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AccessoiresTrompette from './AccessoireRecommandes';
import RelatedArticles from './RelatedArticles';

export default function SecretTrompette() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6"><em>Le secret Ultime pour apprendre la trompette</em> 🎺</h1>

      <Image
        src="/aigu.jpg"
        alt="Un trompettiste débutant en cours à Paris"
        width={500}
        height={300}
        layout="responsive"
        className="rounded-lg mb-6"
      />

      <p className="mb-6">
        Vous avez toujours rêvé d'apprendre à jouer de la trompette, mais vous ne savez pas par où commencer ? <br />Voici mes  <strong>8 conseils</strong>, pour apprendre les bases de cet instrument.
      </p>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="approcheIntuitive">
          <AccordionTrigger>1. Jouer de la trompette : une approche intuitive</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Imaginez que jouer de la trompette, c'est comme apprendre à lancer une fléchette : vous visez le centre de la cible, vous lancez, et vous voyez directement si vous avez touché juste ou pas. Eh bien, pour la trompette, c'est pareil ! Chaque note que vous jouez, c'est comme un lancer de fléchette, et votre <strong>oreille</strong> vous dit immédiatement si le son est bon ou pas. Du coup, au lieu de vous prendre la tête à réfléchir à <em>comment</em> jouer, essayez plutôt de <strong><em>ressentir</em></strong> ce que vous faites.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="posture">
          <AccordionTrigger>2. Écoutez votre corps : la posture</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              <strong>Concrètement</strong>, qu'est-ce que ça veut dire ? <strong>Soyez attentifs à votre posture.</strong> Pas besoin de vous forcer à vous tenir droit comme un piquet, mais <em>sentez</em> comment vous êtes assis, comment votre corps est positionné. Si vous sentez des tensions dans vos épaules, votre cou, ou même votre mâchoire, <strong>relâchez-les</strong>. Plus vous êtes <strong>détendus</strong>, plus vous jouerez <em>facilement</em>. D'ailleurs, se détendre, ce n'est pas quelque chose que vous pouvez forcer. C'est plutôt un effet secondaire de la <strong><em>concentration</em> sur vos sensations</strong> : la posture, mais aussi comment vous <em>respirez</em>, comment vos <em>doigts</em> se posent sur les pistons.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="oreille">
          <AccordionTrigger>3. L'oreille, votre meilleur allié</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Ensuite, <strong>écoutez-vous <em>attentivement</em></strong>. <strong>Comparez le son que vous produisez avec le son que vous avez dans votre tête.</strong> Est-ce que c'est pareil ? Si non, qu'est-ce qui est différent ? L'important, ce n'est pas de vous juger, de vous dire "c'est nul" ou "c'est génial", mais juste <em>d'observer</em>, comme un scientifique qui fait une expérience. Et plus vous écoutez attentivement, plus vous remarquerez les <em>petites nuances</em>, et plus vous pourrez <strong>ajuster votre jeu</strong> pour obtenir le son que vous voulez.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="visualiser">
          <AccordionTrigger>4. Visualisez le son</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Et justement, le son que vous voulez, il faut <strong><em>l'avoir bien en tête avant de jouer</em></strong>. C'est comme avoir une image dans votre tête avant de dessiner. Si vous savez <em>exactement</em> ce que vous voulez, vous avez plus de chances d'y arriver.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="corps">
          <AccordionTrigger>5. Laissez faire votre corps</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Et quand vous jouez, <strong>ne pensez pas à la technique, aux doigtés, à tout ça</strong>. Laissez votre <em>corps</em> faire le travail. <strong><em>Concentrez-vous sur les sensations</em></strong>, et la musique viendra <em>naturellement</em>.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="trac">
          <AccordionTrigger>6. Domptez le trac</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Le trac, c'est <em>l'ennemi du musicien</em>. Mais si vous arrivez à <strong>vous concentrer sur vos sensations, sur votre respiration, sur ce que vous voyez autour de vous</strong> (même sans fixer votre regard), ça vous aidera à <em>rester ancré dans le présent</em> et à moins vous laisser envahir par le stress.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="lenteur">
          <AccordionTrigger>7. La lenteur, clé de la réussite</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Un dernier conseil : <strong>travaillez <em>lentement</em> !</strong> Prenez le temps de bien <em>sentir chaque note</em>, de <em>l’écouter attentivement</em>. C'est comme ça que vous progresserez <strong><em>vraiment</em></strong>. C'est peut-être moins excitant que de jouer vite et fort, mais c'est <strong><em>beaucoup plus efficace</em></strong>.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="effortlessness">
          <AccordionTrigger>8. L'objectif : S'amuser en toute détente</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Au final, l'objectif, c'est de jouer avec tellement <em>d'aisance</em> que vous avez l'impression de ne pas faire d'effort, comme si la musique sortait toute seule. Et ça, ça demande du temps, de la <em>patience</em>, et surtout, de <strong>l'attention</strong>.
            </p>
          </AccordionContent>
        </AccordionItem>


      </Accordion>

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