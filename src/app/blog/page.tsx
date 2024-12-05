import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/app/lib/blogUtils'
import { blogCategories } from '@/app/lib/blogPosts'
import { cn } from '../lib/utils'

export default function BlogPage() {
  const posts = getAllPosts()

  const getImagePath = (slug: string) => {
    switch (slug) {
      case 'pourquoi-un-prof':
        return '/jc.jpg'
      case 'la-trompette-a-30-ans':
        return '/ZE.webp'
      case 'secret-de-trompette':
        return '/valves.jpg'
      case 'choisir-trompette':
        return '/trompette.webp'
      case 'apprendre-trompette':
        return '/debutant.jpg'
      case 'apprendre-trompette-paris':
        return '/jc.jpg'
      case 'notes-aigues':
        return '/aigu.jpg'
      case 'entretien-trompette':
        return '/pavillon.jpg'
      case 'lexique-trompette':
        return '/lexique.jpg'
      case 'posture-trompette':
        return '/posture.jpg'
      case 'respiration-articulation':
        return '/respiration.webp'
      case 'trompette-premiers-pas':
        return '/corps.jpg'
      case 'piege-debutant':
        return '/prof.webp'
      case 'miles-davis':
        return '/miles.jpg'
      case 'cours-trompette-debutant-paris':
        return '/aigu.jpg'
      default:
        return '/aigu.jpg'
    }
  }

  const renderPostList = (category: typeof blogCategories[0]) => {
    const categoryPosts = posts.filter(post => 
      category.posts.some(p => p.slug === post.slug)
    )

    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">{category.name}</h2>
        <ul className="space-y-6">
          {categoryPosts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/category/${category.slug}/${post.slug}`}>
                <div className={cn(
                  "flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md",
                  "hover:shadow-lg transition-shadow"
                )}>
                  <div className="relative w-[100px] h-[100px] flex-shrink-0">
                    <Image
                      src={getImagePath(post.slug)}
                      alt={post.title}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                    <p className="text-gray-600 text-sm">{post.date}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-12">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogCategories.map(category => (
          <div key={category.slug}>
            {renderPostList(category)}
          </div>
        ))}
      </div>
    </div>
    
  )
}

