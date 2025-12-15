export interface BlogPost {
  slug: string
  title: string
  date: string
  image: string
  niveau?: string // Added difficulty level
}

export interface BlogCategory {
  name: string
  slug: string
  posts: BlogPost[]
}
