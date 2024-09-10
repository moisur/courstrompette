import { BlogPost } from '@/app/types/blog'
import { allBlogPosts as blogPosts } from './blogPosts'

export function getAllPosts(): BlogPost[] {
  return blogPosts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
    return blogPosts.find((post: BlogPost) => post.slug === slug)
  }