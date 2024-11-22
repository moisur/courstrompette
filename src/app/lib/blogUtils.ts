import { BlogPost } from '@/app/types/blog'
import { allBlogPosts } from './blogPosts'

export function getAllPosts(): BlogPost[] {
  return allBlogPosts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allBlogPosts.find((post: BlogPost) => post.slug === slug)
}

