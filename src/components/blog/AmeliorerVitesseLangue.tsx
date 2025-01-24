'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AccessoiresTrompette from './AccessoireRecommandes';
import RelatedArticles from './RelatedArticles';

export default function AmeliorerVitesseLangueTrompette() {
  return (
    <article className="container max-w-4xl mx-auto px-6 lg:px-8 py-12 space-y-12 bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-primary leading-tight">
          Améliorez votre vitesse de langue à la trompette : technique simple et efficace
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Découvrez une méthode éprouvée pour booster votre vitesse de détaché et la clarté de votre articulation.
        </p>
      </header>

      {/* Introductory Content */}
      <section className="prose prose-lg max-w-none text-gray-800 space-y-6">
        <p>
          Dans cet article, nous allons explorer une technique simple, mais efficace, pour améliorer la vitesse de votre langue à la trompette.  Cette méthode, que j'ai personnellement utilisée et que je recommande vivement, se concentre sur l'amélioration progressive de votre articulation.
        </p>
        <p>
          Bien que l'exercice puisse paraître répétitif, il constitue un outil précieux pour développer une articulation plus rapide et plus propre.
        </p>
      </section>

      {/* Le Metronome Section */}
      <section className="bg-gray-100 p-6 rounded-lg shadow-inner space-y-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">Le métronome : votre allié essentiel</h2>
        <div className="space-y-4">
            <p>
              L'utilisation du métronome est <b>primordiale</b> pour cet exercice.  Considérez-le comme un partenaire d'entraînement rigoureux, mais <b>indispensable</b>.  Il vous fournira un retour objectif sur votre régularité rythmique et vous guidera vers une amélioration constante.  <i>Faire du métronome votre ami</i> est un investissement à long terme pour votre progression musicale.
            </p>
            <p>
              Le principe de l'exercice est simple : commencer à un tempo confortable pour le détaché simple en croches.  Nous parlons ici spécifiquement du <b>détaché simple</b>. Choisissez un tempo où vous pouvez articuler des croches de manière régulière et contrôlée.
            </p>
            <p>
              À titre d'exemple, nous commencerons cet exercice à 120 bpm.  Cependant, il est crucial de choisir un tempo adapté à votre niveau actuel.  L'important est de commencer là où vous vous sentez à l'aise.  Durant la pratique de cet exercice, deux éléments fondamentaux doivent retenir votre attention.
            </p>
        </div>
      </section>

      {/* Airstream et Rythme Section */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">Les clés de la réussite : flux d'air et précision rythmique</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <div className="space-y-2">
                <h3 className="font-semibold">Maintenir un flux d'air constant</h3>
                <p>Dans cet exercice, le flux d'air est d'une importance <b>capitale</b>.  Assurez-vous de maintenir un flux d'air <b>stable et continu</b>.  Cela permettra à votre langue de se déplacer avec agilité et légèreté. Un flux d'air irrégulier rendra l'exercice beaucoup plus difficile, voire contre-productif.</p>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <div className="space-y-2">
                <h3 className="font-semibold">Être précis sur le plan rythmique</h3>
                <p>Portez une attention constante à la <b>précision rythmique</b>.  Écoutez attentivement le métronome, intégrez son tempo et travaillez à subdiviser le temps.  La subdivision consiste à ressentir et à visualiser mentalement les divisions du temps : doubles croches, triples croches, etc., à l'intérieur de chaque battement du métronome.</p>
              </div>
            </li>
          </ul>
        </div>
        <Image
          src="/blog/AmeliorerVitesseLangueTrompette (2).webp"
          alt="Métronome pour la pratique de la trompette"
          width={500}
          height={300}
          className="rounded-lg shadow-lg"
          priority
        />
      </section>

            {/* Augmentation Graduelle Section */}
            <section className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-primary">Astuce n°1 : Augmenter progressivement le tempo</h2>
                    <p>
                      L'objectif de cet exercice est d'éduquer vos muscles à fonctionner dans un cadre temporel précis. En entraînant vos muscles à maintenir une régularité rythmique à un tempo donné, vous facilitez l'augmentation progressive de la vitesse d'articulation.
                    </p>
                    <p>
                      Nous débuterons à 120 bpm en détachant des croches.  L'approche consiste à augmenter graduellement le tempo du métronome.  Si vous parvenez à maintenir un tempo constant et régulier, augmentez légèrement la vitesse.
                    </p>
                    <p>
                      L'augmentation doit être <b>progressive</b>.  Pour les besoins de cette démonstration, nous allons procéder par paliers plus importants.  Cependant, dans votre pratique personnelle, privilégiez une progression graduelle.  Nous passons maintenant à 160 bpm.  Je maintiens toujours un flux d'air constant et je me concentre sur la précision rythmique des croches entre les battements.
                    </p>
                    <p>
                      Nous allons monter à 200 bpm.  Si vous atteignez la limite supérieure de votre métronome tout en conservant une articulation régulière, vous pouvez envisager de réduire le tempo de moitié et de passer aux doubles croches.  Par exemple, si vous étiez à 200 bpm en croches, redescendez à 100 bpm et travaillez les doubles croches.
                    </p>
                </div>
                <Image
                    src="/blog/AmeliorerVitesseLangueTrompette (3).webp"
                    alt="Illustration de l'augmentation graduelle du tempo"
                    width={1500}
                    height={1500}
                    className="rounded-lg shadow-lg"
                    priority
                />
            </section>

            {/* Depasser ses Limites Section */}
            <section className="grid md:grid-cols-2 gap-8 items-center">
                <Image
                    src="/blog/AmeliorerVitesseLangueTrompette (1).webp"
                    alt="Illustration de ne pas dépasser ses limites"
                    width={1500}
                    height={1500}
                    className="rounded-lg shadow-lg"
                    priority
                />
                <div className="space-y-6 bg-gray-100 p-6 rounded-lg shadow-inner space-y-6">
                    <h2 className="text-2xl font-semibold text-primary">Astuce n°2 : Ne pas forcer, respecter ses limites</h2>
                    <div className="space-y-4">
                        <p>
                          Continuons l'augmentation progressive du tempo.  Suivez attentivement les indications.  Nous sommes à 120 bpm.  Nous atteignons un tempo où je commence à ressentir un certain confort.  Augmentons à 160 bpm.  Observons ce qu'il se passe lorsque l'on dépasse ses limites.
                        </p>
                        <p>
                          À ce stade, vous pouvez entendre que je perds en précision rythmique.  Je ne parviens plus à maintenir un rythme constant.  Il est possible que vous constatiez également une perte de régularité dans votre articulation.  Si vous n'articulez plus des doubles croches régulières et que votre rythme devient irrégulier, il est impératif de <b>revenir en arrière</b>.  Réduisez le tempo du métronome jusqu'à retrouver un point où vous pouvez maintenir une régularité rythmique stable et précise, aussi longtemps que possible.
                        </p>
                        <p>
                          Une fois que vous avez retrouvé ce tempo stable, maintenez-le.  Consacrez du temps à consolider votre articulation à cette vitesse.  N'hésitez pas à faire de courtes pauses régulières, mais concentrez-vous sur la précision rythmique et la constance du flux d'air.
                        </p>
                        <p>
                          Pour renforcer votre sens du rythme, vous pouvez accentuer légèrement les temps forts.  Cela vous aidera à ancrer votre articulation dans le tempo du métronome.  L'objectif n'est pas d'atteindre une perfection absolue sur chaque note, mais de développer la capacité à articuler en rythme avec un flux d'air constant et maîtrisé.
                        </p>
                        <p>
                          Il est essentiel de comprendre que la fatigue est un facteur limitant.  Avec la pratique prolongée, vous ressentirez inévitablement de la fatigue et une perte de précision.  Dès que vous constatez que vous ne parvenez plus à maintenir la régularité rythmique (croches, doubles croches, etc.), il est temps de faire une pause ou de réduire à nouveau le tempo.  Le repos fait partie intégrante du processus d'apprentissage.
                        </p>
                    </div>
                </div>
            </section>

        {/* Call to Action */}
        <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-4">Prêt à commencer ?</h2>
            <p className="text-xl text-gray-700 mb-6">
              Votre premier cours d'essai est gratuit. Aucun engagement, juste la musique.
            </p>
            <a
              href="/#booking"
              className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
            >
              Réserver mon cours gratuit
            </a>
          </div>

      {/* Conclusion et Appel à l'Action */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-primary mb-4">Conclusion : simplicité, efficacité, nécessité</h2>
        <p className="text-xl text-gray-700 mb-6">
          Cette méthode, bien que simple en apparence, est d'une <b>efficacité redoutable</b> pour développer la vitesse et la clarté de votre détaché simple.
        </p>
        <p className="text-gray-700 mb-6">
          L'essentiel réside dans la constance du flux d'air, la précision rythmique et l'écoute active du métronome.  En vous concentrant sur ces éléments clés et en augmentant progressivement le tempo, vous constaterez des progrès significatifs dans votre vitesse d'articulation.  Cette amélioration se traduira par une plus grande aisance technique et une musicalité accrue, quel que soit le style musical abordé : classique, jazz, improvisation, etc.
        </p>

        <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger>Envie d'aller plus loin ?</AccordionTrigger>
                <AccordionContent>
                    <ul className="list-disc list-inside space-y-3 text-gray-700">
                        <li>N'hésitez pas à <a href="https://www.ridgewoodschoolofmusic.com/" className="text-primary hover:underline">visiter notre site web</a> pour explorer nos cours en ligne ou en présentiel à Brooklyn, Queens et dans la grande région de New York.</li>
                        <li>Suivez <a href="https://www.instagram.com/bobspellman/" className="text-primary hover:underline">Bobby Spellman sur Instagram</a>, <a href="https://www.facebook.com/bobbyspellmanmusic/" className="text-primary hover:underline">Facebook</a>, et <a href="https://twitter.com/bobbyspellman" className="text-primary hover:underline">Twitter</a> pour accéder à davantage de contenu pédagogique et musical.</li>
                        <li>Si cet article vous a été utile, vous pouvez soutenir notre travail en faisant un <a href="https://venmo.com/ridgewoodmusic" className="text-primary hover:underline">don sur Venmo @ridgewood music</a>.  Votre contribution nous aide à créer davantage de ressources éducatives.</li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </div>

      {/* Related Articles & Accessories */}
      <RelatedArticles />
      <AccessoiresTrompette />
    </article>
  );
}
