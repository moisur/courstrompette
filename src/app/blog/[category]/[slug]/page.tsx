import { blogCategories } from '@/app/lib/blogPosts'
import { getPostBySlug } from '@/app/lib/blogUtils'
import AmeliorerVitesseLangueTrompette from '@/components/blog/AmeliorerVitesseLangue'
import ApprendreTrompette from '@/components/blog/ApprendreTrompette'
import ApprendreTrompetteParis from '@/components/blog/ApprendreTrompetteParis'
import ChoisirTrompette from '@/components/blog/Choisirtrompette'
import CoursDeTrompetteDebutantParis from '@/components/blog/CoursTrompetteDebutantParis'
import EntretienTrompette from '@/components/blog/Entretientrompette'
import TrompetteApres30 from '@/components/blog/Latrompettea30ans'
import LexiqueTrompette from '@/components/blog/Lexiquetrompette'
import MilesDavis from '@/components/blog/Milesdavis'
import NotesAiguesTrompette from '@/components/blog/Notesaigues'
import PiegeDebutant from '@/components/blog/Piegedebutant'
import PostureTrompette from '@/components/blog/Posturetrompette'
import PourquoiUnProfesseur from '@/components/blog/PourquoiUnProfesseur'
import ProfesseurRecommandes from '@/components/blog/ProfesseurRecommandes'
import RespirationArticulation from '@/components/blog/RespirationArticulation'
import SecretTrompette from '@/components/blog/SecretTrompette'
import TrompetteAstucesSon from '@/components/blog/TrompetteAstucesSon'
import TrompettePremiersPas from '@/components/blog/Trompettepremierspas'

import { notFound } from 'next/navigation'

import type { Metadata } from 'next'
import erreurs from '@/components/blog/5erreurs'


const articleComponents: { [key: string]: React.ComponentType } = {
  "cours-trompette-paris-guide-debutants-erreurs-a-eviter": erreurs,
  "professeur-recommandes": ProfesseurRecommandes,
  // Removed top-trumpet-advice mapping
  "ameliorer-vitesse-langue-trompette": AmeliorerVitesseLangueTrompette,
  "trompette-astuce-son": TrompetteAstucesSon,
  "pourquoi-un-prof": PourquoiUnProfesseur,
  "la-trompette-a-30-ans": TrompetteApres30,
  "secret-de-trompette": SecretTrompette,
  "choisir-trompette": ChoisirTrompette,
  "entretien-trompette": EntretienTrompette,
  "lexique-trompette": LexiqueTrompette,
  "miles-davis": MilesDavis,
  "piege-debutant": PiegeDebutant,
  "posture-trompette": PostureTrompette,
  "respiration-articulation": RespirationArticulation,
  "trompette-premiers-pas": TrompettePremiersPas,
  "notes-aigues": NotesAiguesTrompette,
  "apprendre-trompette": ApprendreTrompette,
  "apprendre-trompette-paris": ApprendreTrompetteParis,
  "cours-trompette-debutant-paris": CoursDeTrompetteDebutantParis,
};
type Props = {
  params: { category: string; slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return { title: 'Article not found' }

  return {
    title: post.title,
    description: `Notre nouvel article ${post.title} du blog JC prof de Trompette à Paris.`,
    openGraph: {
      title: post.title,
      description: `Notre nouvel article ${post.title} du blog JC prof de Trompette à Paris`,
      type: 'article',
      publishedTime: post.date,
      authors: ['JC Trompette'],
    },
  }
}

export default function ArticlePage({ params }: { params: { category: string, slug: string } }) {
  console.log(`--- ArticlePage Rendu pour: category=${params.category}, slug=${params.slug} ---`); // Log entry

  const post = getPostBySlug(params.slug);
  console.log("Post trouvé:", post ? post.slug : 'Non trouvé'); // Log post

  const category = blogCategories.find(cat => cat.slug === params.category);
  console.log("Catégorie trouvée:", category ? category.slug : 'Non trouvée'); // Log category

  if (!post) {
    console.log("Erreur: Post non trouvé par slug.");
    notFound();
  }

  if (!category) {
    console.log("Erreur: Catégorie non trouvée par slug.");
    notFound();
  }

  // Vérifier si le post appartient à la catégorie AVANT d'appeler notFound
  const postInCategory = category.posts.some(p => p.slug === params.slug);
  console.log(`Le post '${params.slug}' est-il dans la catégorie '${params.category}' ?`, postInCategory); // Log check

  if (!postInCategory) {
     console.log("Erreur: Le post trouvé n'appartient pas à la catégorie trouvée.");
     notFound();
  }

  const ArticleComponent = articleComponents[params.slug];
  console.log("Composant trouvé pour le slug:", ArticleComponent ? 'Oui' : 'Non'); // Log component

  if (!ArticleComponent) {
    console.log("Erreur: Composant d'article non trouvé pour le slug.");
    notFound();
  }

  console.log("--- Rendu du composant ArticleComponent ---"); // Log success
  // The container div is removed, layout.tsx will handle the main structure
  return <ArticleComponent />;
}

export async function generateStaticParams() {
  console.log("Génération des chemins statiques pour les articles de blog...");
  const paths = blogCategories.flatMap(category =>
    category.posts.map(post => ({
      category: category.slug, // Utiliser le slug de la catégorie actuelle
      slug: post.slug,         // Utiliser le slug du post dans cette catégorie
    }))
  );
  console.log("Chemins générés :", JSON.stringify(paths, null, 2)); // Log pour voir les chemins
  return paths;
}
