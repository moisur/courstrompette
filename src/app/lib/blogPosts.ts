import { BlogCategory, BlogPost } from '@/app/types/blog';

export const blogCategories: BlogCategory[] = [
  {
    name: "Guide d'apprentissage trompette",
    slug: "guide-apprentissage",
    posts: [
      {
        slug: "cours-trompette-paris-guide-debutants-erreurs-a-eviter",
        title: "Cours de Trompette Paris : Le Guide Définitif pour Débutants (Évitez ces 5 Erreurs qui Bloquent 90% des Élèves !)",
        date: "2025-04-30",
        image: "/blog/5trucscourstrompette.webp", // Added image
      },
      {
        slug: "professeur-recommandes",
        title: "Professeurs de trompette recommandés",
        date: "2025-03-09",
        image: "/blog/ProfesseurRecommandes (1).webp", // Added image
      },
      // Removed top-trumpet-advice entry
      {
        slug: "ameliorer-vitesse-langue-trompette",
        title: "Améliorer la vitesse de la langue à la trompette : 3 exercices efficaces",
        date: "2025-01-02",
        image: "/blog/AmeliorerVitesseLangueTrompette (1).webp", // Added image
      },
      {
        slug: "trompette-astuce-son",
        title: "3 Astuces pour Améliorer Immédiatement Votre Son à la Trompette",
        date: "2025-01-02",
        image: "/blog/TrompetteAstucesSon (1).webp", // Added image
      },
      {
        slug: "pourquoi-un-prof",
        title: "Pourquoi choisir un prof de trompette ?",
        date: "2024-12-04",
        image: "/jc.jpg", // Added image
      },
      {
        slug: "la-trompette-a-30-ans",
        title: "Apprendre la trompette à 30 ans et plus !",
        date: "2024-12-04",
        image: "/ZE.webp", // Added image
      },
      {
        slug: "secret-de-trompette",
        title: "LE secret pour devenir un bon trompettiste",
        date: "2024-11-24",
        image: "/valves.jpg", // Added image
      },
      {
        slug: "cours-trompette-debutant-paris",
        title: "Cours de trompette pour débutants à Paris",
        date: "2024-11-22",
        image: "/aigu.jpg", // Added image
      },
      {
        slug: "apprendre-trompette-paris",
        title: "Apprendre la trompette à Paris",
        date: "2024-11-14",
        image: "/jc.jpg", // Added image
      },
      {
        slug: "choisir-trompette",
        title: "Choisir sa trompette : Guide complet",
        date: "2023-05-28",
        image: "/trompette.webp", // Added image
      },
      {
        slug: "apprendre-trompette",
        title: "Apprendre la trompette : Le Guide Complet pour Débutants et Confirmés",
        date: "2023-05-28",
        image: "/debutant.jpg", // Added image
      },
      {
        slug: "notes-aigues",
        title: "Atteindre les notes aigues",
        date: "2023-01-28",
        image: "/aigu2.webp", // Corrected image path
      },
      {
        slug: "entretien-trompette",
        title: "Entretenir sa Trompette : Conseils pour un Instrument Brillant",
        date: "2023-05-30",
        image: "/pavillon.jpg", // Added image
      },
      {
        slug: "lexique-trompette",
        title: "Lexique Trompette : Quel est notre champ Lexical ?",
        date: "2023-05-30",
        image: "/lexique.jpg", // Added image
      },
      {
        slug: "posture-trompette",
        title: "Posture et Tenue de la Trompette : Jouer avec Confort et Précision",
        date: "2023-06-11",
        image: "/posture.jpg", // Added image
      },
      {
        slug: "respiration-articulation",
        title: "Exercices de Respiration et d'Articulation pour Débutants à la Trompette",
        date: "2023-05-29",
        image: "/respiration.webp", // Added image
      },
      {
        slug: "trompette-premiers-pas",
        title: "Premiers Pas à la Trompette : Apprenez à Jouer !",
        date: "2023-06-14",
        image: "/corps.jpg", // Added image
      },
      {
        slug: "piege-debutant",
        title: "Les pièges : Quels piège éviter quand on est débutant ?",
        date: "2023-06-14",
        image: "/prof.webp", // Added image
      },
    ],
  },

  {
    name: "Biographies de trompettistes célèbres",
    slug: "biographies-trompettistes",
    posts: [
      {
        slug: "miles-davis",
        title: "Miles Davis : Le Géant du Jazz",
        date: "2023-06-05",
        image: "/miles.jpg", // Added image
      },
    ],
  },
];

export const allBlogPosts: BlogPost[] = blogCategories.flatMap(category => category.posts)
