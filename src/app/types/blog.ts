export interface BlogPost {
  slug: string
  title: string
  date: string
}

export interface BlogCategory {
  name: string
  slug: string
  posts: BlogPost[]
}