/* eslint-disable react/no-unescaped-entities */

"use client";

import AccessoiresTrompette from "./AccessoireRecommandes"; // Conserve l'import
import RelatedArticles from "./RelatedArticles"; // Conserve l'import
import { useState } from "react"; //Ajout useState pour le bouton

export default function ProfesseurRecommandes() {
  // Changement du nom du composant
  const [showMoreMatos, setShowMoreMatos] = useState(false);
  return (
    <article className="container max-w-4xl mx-auto px-6 lg:px-8 py-12 space-y-12 bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-primary leading-tight">
          Cours de trompette débutant : Le guide complet pour bien commencer
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Tout ce que vous devez savoir pour démarrer la trompette : choix de
          l'instrument, embouchure, premières notes, et plus encore !
        </p>
      </header>

      {/* Introductory Content */}
      <section className="prose prose-lg max-w-none text-gray-800 space-y-6">
        <p>
          Vous rêvez d'apprendre la trompette ? Ce guide est fait pour vous !
          Nous allons vous accompagner dans vos premiers pas, en abordant tous
          les aspects essentiels des{" "}
          <strong>cours de trompette pour débutants</strong>.
        </p>
        <p>
          De la sélection de votre premier instrument à la production de vos
          premiers sons, en passant par des conseils sur l'
          <strong>embouchure de trompette pour débutant</strong>, vous trouverez
          ici toutes les informations nécessaires pour bien commencer.
        </p>
      </section>

      {/* Le Matériel Essentiel */}
      <section className="bg-gray-100 p-6 rounded-lg shadow-inner space-y-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Le Matériel Indispensable pour Débuter la Trompette
        </h2>
        <div className="space-y-4">
          <p>
            Pour vos <strong>leçons de trompette pour débutants</strong>, voici
            les éléments clés :
          </p>
          <ul className="list-disc list-inside text-gray-700">
            <li>
              <strong>Trompette :</strong> Optez pour une trompette d'étude en
              Sib (Bb). La location est une bonne option pour un{" "}
              <strong>débutant en trompette</strong>.
            </li>
            <li>
              <strong>Embouchure :</strong>{" "}
              <a href="#embouchure" className="text-blue-500 hover:underline">
                Une 1 1/2 C
              </a>{" "}
              est un standard pour commencer. Nous parlerons plus en détail de
              l'
              <strong>embouchure trompette débutant</strong>.
            </li>
            <li>
              <strong>Huile pour pistons :</strong> Essentiel pour l'entretien.
            </li>
            <li>
              <strong>Graisse pour coulisses :</strong> Pour un bon
              fonctionnement.
            </li>
            <li>
              <strong>Chiffon :</strong> Pour nettoyer après chaque utilisation.
            </li>
            <li>
              <strong>Pupitre (facultatif) :</strong> Pour lire vos partitions.
            </li>
          </ul>
          {showMoreMatos && (
            <div className="mt-4 space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Options et Recommandations
              </h3>
              <p>
                Si vous envisagez d'acheter votre première{" "}
                <strong>trompette pour débutant</strong>, certaines marques sont
                réputées pour leurs instruments d'étude de qualité, comme
                Yamaha, Bach (gamme étudiante), Jupiter et Getzen (gamme
                étudiante). N'hésitez pas à demander conseil à un vendeur
                spécialisé.
              </p>
              <p>
                Pour l'<strong>embouchure trompette débutant</strong>, si la 1
                1/2C ne vous convient pas, votre professeur pourra vous guider
                vers d'autres options.
              </p>
            </div>
          )}
          <button
            onClick={() => setShowMoreMatos(!showMoreMatos)}
            className="text-blue-500 hover:underline"
          >
            {showMoreMatos
              ? "Voir moins de détails"
              : "Voir plus de détails sur le matériel"}
          </button>
        </div>
      </section>

      {/* La Position de la Bouche (Embouchure) */}
      <section id="embouchure-debutant" className="p-6 rounded-lg space-y-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Trouver votre souffle naturel : La clé Ultime pour bien débuter à la
          trompette
        </h2>
        <div className="space-y-4">
          <p>
            Les <strong>professeurs de trompette</strong>, parlent souvent de
            "bonne" <strong>position de la bouche</strong>. Mais l'important,
            c'est de trouver votre{" "}
            <strong>position d'embouchure de trompette confortable</strong>.
          </p>
          <p>
            Le <strong>relâchement</strong> est primordial.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Votre corps, votre guide pour un son parfaite
        </h3>
        <div className="space-y-4">
          <p>
            Pas de{" "}
            <strong>position de bouche universelle pour la trompette</strong>
          </p>
          <ul className="list-disc list-inside text-gray-700">
            <li>
              <strong>Détente :</strong> Lèvres souples, comme pour dire "M".
            </li>
            <li>
              <strong>Air :</strong> Le son vient du souffle, pas de la
              pression.
            </li>
            <li>
              <strong>Essais :</strong> Trouvez la zone sur vos lèvres qui vibre
              le mieux.
            </li>
            <li>
              <strong>Patience :</strong> Votre embouchure se développera avec
              le temps.
            </li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Un professeur passionné pour vous guider
        </h3>
        <div className="space-y-4">
          <p>
            Un bon prof de <strong>cours de trompette pour débutant</strong>{" "}
            vous aidera à trouver *votre* <strong>souffle naturel,</strong> avec
            des <strong>conseils</strong> personnalisés. Il vous observera et
            vous guidera vers le confort.
          </p>
          <p>
            Pas de méthode rigide ! Un bon enseignement vous permettra de
            développer un <strong>souffle de trompette efficace et sain</strong>
            .
          </p>
        </div>
      </section>

      {/* Produire Votre Premier Son */}
      <section
        id="premier-son"
        className="bg-gray-100 p-6 rounded-lg shadow-inner space-y-6"
      >
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Réussir votre premier son à la trompette : le guide Ultime
        </h2>
        <div className="space-y-4">
          <p>Prêt(e) pour votre premier son ? Suivez ces étapes :</p>
          <ol className="list-decimal list-inside text-gray-700">
            <li>
              <strong>Respiration :</strong> Inspirez profondément en faisant le
              son "hoo" (comme dark vador !), respirez avec le bas du ventre.
            </li>
            <li>
              <strong>Embouchure :</strong> Placez-la au centre, lèvres
              détendues.
            </li>
            <li>
              <strong>"Buzz" :</strong> Soufflez naturellement en faisant "ffff"
              et rapprochez vos lèvre jusqu'à faire vibrer vos lèvres ("zzzz").
              Essayez d'abord sans la trompette.
            </li>
            <li>
              <strong>Avec la trompette :</strong> Refaites le "zzzz" avec
              l'embouchure sur la trompette.
            </li>
            <li>
              <strong>Patience :</strong> Les premiers sons sont parfois
              difficiles. Persévérez !
            </li>
          </ol>
        </div>
      </section>

      {/* Premières Notes et Exercices */}
      <section
        id="premieres-notes"
        className="prose prose-lg max-w-none text-gray-800 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Vos Premières Notes et Exercices pour Trompette Débutant
        </h2>
        <p>Vous produisez un son ? Voici quelques exercices :</p>
        <ul className="list-disc list-inside text-gray-700">
          <li>
            <strong>Sons tenus :</strong> Gardez une note stable le plus
            longtemps possible.
          </li>
          <li>
            <strong>Montées et descentes :</strong> Variez légèrement la hauteur
            du son.
          </li>
          <li>
            <strong>Respiration :</strong> Continuez à bien respirer, c'est la
            base !
          </li>
        </ul>
        <p>
          Vous trouverez des{" "}
          <strong>exercices de trompette pour débutant</strong> en ligne ou dans
          des livres.
        </p>
      </section>

      {/* Trouver un Professeur */}
      <section
        id="trouver-professeur"
        className="bg-gray-100 p-6 rounded-lg shadow-inner space-y-6"
      >
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Trouver un Professeur de Trompette : Un Vrai Plus
        </h2>
        <div className="space-y-4">
          <p>
            Les ressources en ligne, c'est bien, mais un prof, c'est encore
            mieux pour vos <strong>cours de trompette</strong> ! Il pourra :
          </p>
          <ul className="list-disc list-inside text-gray-700">
            <li>Vous aider pour l'embouchure.</li>
            <li>Corriger vos erreurs.</li>
            <li>Adapter les exercices à votre niveau.</li>
            <li>Répondre à vos questions et vous encourager.</li>
          </ul>
        </div>
      </section>

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

      {/* Conserve les composants importés, même s'ils ne sont pas directement liés au sujet */}
      <RelatedArticles />
      <AccessoiresTrompette />
    </article>
  );
}
