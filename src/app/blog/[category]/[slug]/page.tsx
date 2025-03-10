import { blogCategories } from '@/app/lib/blogPosts'
import { getAllPosts, getPostBySlug } from '@/app/lib/blogUtils'
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
import RespirationArticulation from '@/components/blog/RespirationArticulation'
import SecretTrompette from '@/components/blog/SecretTrompette'
import TrompetteAstucesSon from '@/components/blog/TrompetteAstucesSon'
import TrompettePremiersPas from '@/components/blog/Trompettepremierspas'
import AmeliorerVitesseLangueTrompette from '@/components/blog/AmeliorerVitesseLangue'
import TopTrumpetAdvice from '@/components/blog/TopTrumpetAdvice'
import { notFound } from 'next/navigation'

import type { Metadata } from 'next'


const articleComponents: { [key: string]: React.ComponentType } = {
  'top-trumpet-advice': TopTrumpetAdvice,
  'ameliorer-vitesse-langue-trompette': AmeliorerVitesseLangueTrompette,
  "trompette-astuce-son": TrompetteAstucesSon,
  'pourquoi-un-prof': PourquoiUnProfesseur,
  'la-trompette-a-30-ans': TrompetteApres30,
  'secret-de-trompette': SecretTrompette,
  'choisir-trompette': ChoisirTrompette,
  'entretien-trompette': EntretienTrompette,
  'lexique-trompette': LexiqueTrompette,
  'miles-davis': MilesDavis,
  'piege-debutant': PiegeDebutant,
  'posture-trompette': PostureTrompette,
  'respiration-articulation': RespirationArticulation,
  'trompette-premiers-pas': TrompettePremiersPas,
  'notes-aigues': NotesAiguesTrompette,
  'apprendre-trompette': ApprendreTrompette,
  'apprendre-trompette-paris': ApprendreTrompetteParis,
  'cours-trompette-debutant-paris': CoursDeTrompetteDebutantParis,
}
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
  const post = getPostBySlug(params.slug)
  const category = blogCategories.find(cat => cat.slug === params.category)

  if (!post || !category || !category.posts.some(p => p.slug === params.slug)) {
    notFound()
  }

  const ArticleComponent = articleComponents[params.slug]

  if (!ArticleComponent) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <ArticleComponent />
    </div>
  )
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.flatMap((post) =>
    blogCategories.map(category => ({
      category: category.slug,
      slug: post.slug,
    }))
  )
}
