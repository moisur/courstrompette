import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/app/lib/blogUtils'
import { blogCategories } from '@/app/lib/blogPosts'
import { cn } from '../../lib/utils'

export default function BlogPage() {
  const posts = getAllPosts()

  const renderPostList = (categorySlug: string) => {
    const categoryPosts = posts.filter(post => 
      blogCategories.find(cat => cat.slug === categorySlug)?.posts.some(p => p.slug === post.slug)
    )

    return (
      <ul className="space-y-6">
        {categoryPosts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${categorySlug}/${post.slug}`}>
              <div className={cn(
                "flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md",
                "hover:shadow-lg transition-shadow"
              )}>
                <Image
                  src={`/images/blog/${post.slug}.jpg`}
                  alt={post.title}
                  width={100}
                  height={100}
                  className="rounded-md object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-gray-600 text-sm">{post.date}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-12">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Guide d&apos;apprentissage</h2>
          {renderPostList('guide-apprentissage')}
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-6">Biographies de trompettistes célèbres</h2>
          {renderPostList('biographies-trompettistes')}
        </div>
      </div>
    </div>
  )
}

