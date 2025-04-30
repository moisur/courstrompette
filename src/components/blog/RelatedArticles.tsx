'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { blogCategories, allBlogPosts } from '@/app/lib/blogPosts';
import { BlogPost } from '@/app/types/blog';
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function RelatedArticles() {
  const params = useParams();
  const currentSlug = params.slug as string;
  const currentCategory = params.category as string;

  const currentPost = allBlogPosts.find(post => post.slug === currentSlug);
  const currentCategoryPosts = blogCategories.find(cat => cat.slug === currentCategory)?.posts || [];

  const getRelatedPosts = (posts: BlogPost[], currentSlug: string, limit: number) => {
    return posts
      .filter(post => post.slug !== currentSlug)
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
  };

  // Removed getImagePath function

  const relatedPosts = getRelatedPosts(currentCategoryPosts, currentSlug, 3);

  const currentIndex = currentCategoryPosts.findIndex(post => post.slug === currentSlug);
  const prevPost = currentCategoryPosts[currentIndex - 1];
  const nextPost = currentCategoryPosts[currentIndex + 1];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-12 space-y-8">
            <section className="border-t pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          {prevPost && (
            <Link 
              href={`/blog/category/${currentCategory}/${prevPost.slug}`}
              className="flex items-center group hover:text-primary"
            >
              <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              <div>
                <div className="text-sm text-muted-foreground">Article précédent</div>
                <div className="font-medium">{prevPost.title}</div>
              </div>
            </Link>
          )}
          {nextPost && (
            <Link 
              href={`/blog/category/${currentCategory}/${nextPost.slug}`}
              className="flex items-center group hover:text-primary text-right sm:ml-auto"
            >
              <div>
                <div className="text-sm text-muted-foreground">Article suivant</div>
                <div className="font-medium">{nextPost.title}</div>
              </div>
              <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-6">Articles connexes</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {relatedPosts.map((post) => (
            <Card key={post.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/blog/category/${currentCategory}/${post.slug}`}>
                <div className="relative h-48 w-full">
                  <Image
                    src={post.image} // Use post.image directly
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-2 mb-2">{post.title}</h3>
                  <time className="text-sm text-muted-foreground">
                    {formatDate(post.date)}
                  </time>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}
