import Link from 'next/link'
import { getAllPosts } from '@/app/lib/blogUtils'

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-12">Blog</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>
              <div className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-600">{post.date}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}