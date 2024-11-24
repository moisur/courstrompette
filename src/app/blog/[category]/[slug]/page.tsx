import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPosts } from '@/app/lib/blogUtils'
import { blogCategories } from '@/app/lib/blogPosts'
import ChoisirTrompette from '@/components/blog/Choisirtrompette'
import EntretienTrompette from '@/components/blog/Entretientrompette'
import LexiqueTrompette from '@/components/blog/Lexiquetrompette'
import MilesDavis from '@/components/blog/Milesdavis'
import PiegeDebutant from '@/components/blog/Piegedebutant'
import PostureTrompette from '@/components/blog/Posturetrompette'
import RespirationArticulation from '@/components/blog/RespirationArticulation'
import TrompettePremiersPas from '@/components/blog/Trompettepremierspas'
import NotesAiguesTrompette from '@/components/blog/Notesaigues'
import ApprendreTrompette from '@/components/blog/ApprendreTrompette'
import ApprendreTrompetteParis from '@/components/blog/ApprendreTrompetteParis'
import CoursDeTrompetteDebutantParis from '@/components/blog/CoursTrompetteDebutantParis'
import SecretTrompette from '@/components/blog/SecretTrompette'

const articleComponents: { [key: string]: React.ComponentType } = {
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

