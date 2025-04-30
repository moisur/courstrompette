export interface BlogPost {
  slug: string
  title: string
  date: string
  image: string // Added image path field
}

export interface BlogCategory {
  name: string
  slug: string
  posts: BlogPost[]
}
