import { BlogPost, BlogCategory } from '@/app/types/blog'

export const blogCategories: BlogCategory[] = [
  {
    name: "Guide d'apprentissage trompette",
    slug: "guide-apprentissage",
    posts: [
      {
        slug: 'la-trompette-a-30-ans',
        title: 'Apprendre la trompette à 30 ans et plus !',
        date: '2024-12-04',
      },
      {
        slug: 'secret-de-trompette',
        title: 'LE secret pour devenir un bon trompettiste',
        date: '2024-11-24',
      },  
      {
        slug: 'cours-trompette-debutant-paris',
        title: 'Cours de trompette pour débutants à Paris',
        date: '2024-11-22',
      },   
      {
        slug: 'apprendre-trompette-paris',
        title: 'Apprendre la trompette à Paris',
        date: '2024-11-14',
      },    
      {
        slug: 'choisir-trompette',
        title: 'Choisir sa trompette : Guide complet',
        date: '2023-05-28',
      },         
      {
        slug: 'apprendre-trompette',
        title: 'Apprendre la trompette : Le Guide Complet pour Débutants et Confirmés',
        date: '2023-05-28',
      },      
      {
        slug: 'notes-aigues',
        title: 'Atteindre les notes aigues',
        date: '2023-01-28',
      },
      {
        slug: 'entretien-trompette',
        title: 'Entretenir sa Trompette : Conseils pour un Instrument Brillant',
        date: '2023-05-30',
      },      
      {
        slug: 'lexique-trompette',
        title: 'Lexique Trompette : Quel est notre champ Lexical ?',
        date: '2023-05-30',
      },
      {
        slug: 'posture-trompette',
        title: 'Posture et Tenue de la Trompette : Jouer avec Confort et Précision',
        date: '2023-06-11',
      },
      {
        slug: 'respiration-articulation',
        title: "Exercices de Respiration et d'Articulation pour Débutants à la Trompette",
        date: '2023-05-29',
      },
      {
        slug: 'trompette-premiers-pas',
        title: 'Premiers Pas à la Trompette : Apprenez à Jouer !',
        date: '2023-06-14',
      },
      {
        slug: 'piege-debutant',
        title: 'Les pièges : Quels piège éviter quand on est débutant ?',
        date: '2023-06-14',
      },
    ]
  },

  {
    name: "Biographies de trompettistes célèbres",
    slug: "biographies-trompettistes",
    posts: [
      {
        slug: 'miles-davis',
        title: 'Miles Davis : Le Géant du Jazz',
        date: '2023-06-05',
      },
    ]
  },

]

export const allBlogPosts: BlogPost[] = blogCategories.flatMap(category => category.posts)
