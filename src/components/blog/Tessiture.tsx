'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import AccessoiresTrompette from './AccessoireRecommandes';
import RelatedArticles from './RelatedArticles';

export default function TessitureTrompette() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        La Tessiture à la Trompette : Les Secrets des Notes Aiguës 🎺
      </h1>

      <Image
        src="/tessiture.webp"
        alt="Un trompettiste jouant dans le registre aigu"
        width={500}
        height={300}
        layout="responsive"
        className="rounded-lg mb-6"
      />

      <div className="prose prose-lg max-w-none mb-8">
        <p className="mb-4">
          Ah, la tessiture ! Je parie que beaucoup d&apos;entre vous sont venus directement à ce chapitre. 
          C&apos;est typique des trompettistes - ils adorent jouer dans l&apos;aigu. Et ce n&apos;est pas un mystère : ça sonne tellement bien !
        </p>

        <p className="mb-6">
          Soyons clairs d&apos;emblée : la trompette peut tout faire. Je le dis pour ceux qui jouent d&apos;autres instruments 
          et qui nous regardent. Mais personnellement, je trouve que la trompette est particulièrement impressionnante 
          dans l&apos;aigu. Elle possède cette énergie extraordinaire que peu d&apos;instruments peuvent égaler.
        </p>
      </div>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="principes">
          <AccordionTrigger>Les Principes Fondamentaux</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Beaucoup de trompettistes rêvent de jouer dans l&apos;aigu, mais c&apos;est souvent source de difficultés. 
              Pourtant, c&apos;est simple - oui, je le répète, c&apos;est simple ! Une fois que vous aurez compris quelques 
              principes de base, tout s&apos;éclaircira.
            </p>

            <h3 className="text-xl font-semibold mb-3">La Physique du Buzz</h3>
            <p className="mb-4">
              Commençons par comprendre ce qui se passe réellement. On pense souvent qu&apos;on &quot;fait vibrer&quot; nos lèvres, 
              mais c&apos;est une erreur ! En réalité, c&apos;est l&apos;air qui, en passant entre nos lèvres, les fait vibrer.
            </p>

            <ul className="list-disc pl-6 mb-4">
              <li>Vous ne &quot;buzzez&quot; pas activement</li>
              <li>Vous soufflez de l&apos;air</li>
              <li>Les lèvres vibrent naturellement</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="secret-hauteur">
          <AccordionTrigger>Le Secret de la Hauteur des Notes</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              La hauteur des notes dépend de la vitesse de vibration :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Vibration lente = note grave</li>
              <li>Vibration rapide = note aiguë</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">L&apos;Analogie de la Voiture et du Papier</h3>
            <p className="mb-4">
              Imaginez une feuille de papier tenue à la fenêtre d&apos;une voiture :
            </p>
            <ol className="list-decimal pl-6 mb-4">
              <li>Quand vous tenez la feuille par le bord avant, elle se met à vibrer</li>
              <li>À vitesse lente, elle produit une vibration basse</li>
              <li>Plus la voiture accélère, plus la vibration devient rapide</li>
              <li>Point crucial : si vous ne tenez pas assez fermement le papier quand la vitesse augmente, il s&apos;envole !</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="controle">
          <AccordionTrigger>Le Contrôle de l&apos;Ouverture</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4">
              Si je souffle, mes lèvres ont naturellement tendance à s&apos;ouvrir. Les muscles de l&apos;embouchure servent 
              à les maintenir dans la bonne position. Si je garde cette ouverture constante et que j&apos;augmente le débit d&apos;air :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>L&apos;air doit passer plus vite dans la même ouverture</li>
              <li>Cette vitesse accrue fait vibrer les lèvres plus rapidement</li>
              <li>Le résultat est une note plus aiguë</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">L&apos;Analogie du Tuyau d&apos;Arrosage</h3>
            <p className="mb-4">
              Une comparaison utile est celle du tuyau d&apos;arrosage avec un embout ajustable :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Le robinet représente votre diaphragme (source d&apos;air)</li>
              <li>L&apos;embout ajustable représente vos lèvres</li>
              <li>Position large = beaucoup d&apos;eau, peu de distance (notes graves)</li>
              <li>Position fine = jet puissant, grande distance (notes aiguës)</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="problemes">
          <AccordionTrigger>Les Problèmes Courants et Leurs Solutions</AccordionTrigger>
          <AccordionContent>
            <h3 className="text-xl font-semibold mb-3">Le Son &quot;Craché&quot;</h3>
            <p className="mb-4">
              Ce son caractéristique que tous les trompettistes connaissent survient souvent quand on essaie 
              de monter dans l&apos;aigu.
            </p>

            <h4 className="font-semibold mb-2">Causes :</h4>
            <ul className="list-disc pl-6 mb-4">
              <li>Pression excessive de l&apos;embouchure contre les lèvres</li>
              <li>Comme si vous teniez les deux extrémités du papier à la fenêtre de la voiture</li>
            </ul>

            <h4 className="font-semibold mb-2">Solution :</h4>
            <ul className="list-disc pl-6 mb-4">
              <li>Relâchez légèrement la pression de l&apos;instrument</li>
              <li>Laissez vos lèvres vibrer plus librement</li>
              <li>Concentrez-vous sur la vitesse de l&apos;air plutôt que sur la pression</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">La Fatigue et la Douleur</h3>
            <p className="mb-4">Il y a deux types de fatigue très différents :</p>
            <ol className="list-decimal pl-6 mb-4">
              <li className="mb-2">
                <strong>La douleur intérieure des lèvres</strong>
                <ul className="list-disc pl-6 mt-1">
                  <li>Causée par la pression excessive de l&apos;embouchure</li>
                  <li>Signe d&apos;une mauvaise technique</li>
                  <li>Peut causer des blessures</li>
                </ul>
              </li>
              <li>
                <strong>La fatigue musculaire externe</strong>
                <ul className="list-disc pl-6 mt-1">
                  <li>Comme après un bon exercice</li>
                  <li>Signe de développement musculaire</li>
                  <li>Mène au progrès</li>
                </ul>
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="conseils">
          <AccordionTrigger>Conseils pour Progresser</AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal pl-6 mb-4">
              <li className="mb-4">
                <strong>Acceptez une perte temporaire de tessiture</strong>
                <ul className="list-disc pl-6 mt-1">
                  <li>Normal pendant la transition vers la bonne technique</li>
                  <li>Durée approximative : un mois</li>
                  <li>Les résultats dépasseront votre niveau précédent</li>
                </ul>
              </li>
              <li className="mb-4">
                <strong>Développement musculaire correct</strong>
                <ul className="list-disc pl-6 mt-1">
                  <li>Évitez de compenser avec la pression de l&apos;instrument</li>
                  <li>Laissez les muscles externes de l&apos;embouchure travailler</li>
                  <li>La fatigue est normale, la douleur ne l&apos;est pas</li>
                </ul>
              </li>
              <li>
                <strong>Technique progressive</strong>
                <ul className="list-disc pl-6 mt-1">
                  <li>Commencez dans le registre confortable</li>
                  <li>Augmentez graduellement la vitesse de l&apos;air</li>
                  <li>Maintenez toujours une position stable des lèvres</li>
                </ul>
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2 className="text-2xl font-bold mb-4">Conclusion</h2>
      <div className="prose prose-lg max-w-none mb-8">
        <p className="mb-4">
          Nous avons tous nos limites naturelles, comme en course à pied. Certains joueront plus haut que d&apos;autres, 
          mais avec cette technique, vous atteindrez votre potentiel maximal. Le plus important est de comprendre que :
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>La hauteur vient de la vitesse de l&apos;air, pas de la tension des lèvres</li>
          <li>Les muscles doivent retenir les lèvres, pas les serrer</li>
          <li>La pratique régulière avec la bonne technique mène au progrès</li>
        </ul>
        <p>
          Tous les trompettistes devraient pouvoir jouer suffisamment haut pour tenir la partie lead dans un big band - 
          c&apos;est juste une question de technique appropriée et de pratique régulière.
        </p>
      </div>

      <RelatedArticles />
      <AccessoiresTrompette />
    </article>
  );
}
