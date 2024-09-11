import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPosts } from '@/app/lib/blogUtils'
import ChoisirTrompette from '@/components/blog/Choisirtrompette'
import EntretienTrompette from '@/components/blog/Entretientrompette'
import LexiqueTrompette from '@/components/blog/Lexiquetrompette'
import MilesDavis from '@/components/blog/Milesdavis'
import PiegeDebutant from '@/components/blog/Piegedebutant'
import PostureTrompette from '@/components/blog/Posturetrompette'
import RespirationArticulation from '@/components/blog/RespirationArticulation'
import TrompettePremiersPas from '@/components/blog/Trompettepremierspas'
import NotesAiguesTrompette from '@/components/blog/Notesaigues'

const articleComponents = {
  'choisir-trompette': ChoisirTrompette,
  'entretien-trompette': EntretienTrompette,
  'lexique-trompette': LexiqueTrompette,
  'miles-davis': MilesDavis,
  'piege-debutant': PiegeDebutant,
  'posture-trompette': PostureTrompette,
  'respiration-articulation': RespirationArticulation,
  'trompette-premiers-pas': TrompettePremiersPas,
  'notes-aigues' : NotesAiguesTrompette,
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const ArticleComponent = articleComponents[post.slug as keyof typeof articleComponents]

  return (
    <div className="container mx-auto px-4 py-20">
      <ArticleComponent />
    </div>
  )
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}