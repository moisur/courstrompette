import { getPostData, getAllPostSlugs, getSortedPostsData } from '@/lib/markdown'; // Added getSortedPostsData
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RelatedArticles, { BlogPostLink } from '@/components/blog/RelatedArticles'; // Import generic type
import AccessoiresTrompette from '@/components/blog/AccessoireRecommandes';
import { CalendarIcon, UserIcon, ClockIcon } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import BlogSidebar from '@/components/blog/BlogSidebar';
import MarkdownContent from '@/components/blog/MarkdownContent';

interface Props {
  params: {
    category: string;
    slug: string;
  };
}

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths.map((path) => path.params);
}

export async function generateMetadata({ params }: Props) {
  try {
    const postData = getPostData(params.category, params.slug);
    return {
      title: postData.frontmatter.title,
      description: postData.frontmatter.description || postData.frontmatter.title,
      openGraph: {
        images: [postData.frontmatter.image],
      },
    };
  } catch (error) {
    return {
      title: 'Article non trouvé',
    };
  }
}

export default function Post({ params }: Props) {
  try {
    const postData = getPostData(params.category, params.slug);
    const categoryName = params.category.replace(/-/g, ' ');

    // 1. Get all posts to determine Prev/Next and Related
    const allPosts = getSortedPostsData();

    // 2. Filter posts for the current category (to keep continuity)
    const categoryPosts = allPosts.filter((post: any) => post.category === params.category);

    // 3. Find current index
    const currentIndex = categoryPosts.findIndex((post: any) => post.slug === params.slug);

    // 4. Define Prev and Next (Note: posts are sorted by date DESC)
    // Next in list = Older post = "Article suivant" logic usually? 
    // Or do we want Chronological "Previous" (older) and "Next" (newer)?
    // Usually:
    // "Previous Post" = Newer post (index - 1)
    // "Next Post" = Older post (index + 1)

    // Safety check if index not found
    if (currentIndex === -1) {
      // Fallback or handle error, but we are inside try block of getPostData so it should exist
    }

    const prevPost = currentIndex > 0 ? categoryPosts[currentIndex - 1] as BlogPostLink : null;
    const nextPost = currentIndex < categoryPosts.length - 1 ? categoryPosts[currentIndex + 1] as BlogPostLink : null;

    // 5. Calculate Related Posts
    // Get posts from same category, exclude current, shuffle and take 3
    const relatedPostsRaw = categoryPosts
      .filter((post: any) => post.slug !== params.slug);

    // Server-side shuffle for consistency (simple version)
    // Since this is a server component, this randomness happens at build time for static pages
    // or request time for dynamic ones. For purely static, it's fine.
    const shuffled = [...relatedPostsRaw].sort(() => 0.5 - Math.random());
    const relatedPosts = shuffled.slice(0, 3) as BlogPostLink[];

    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 max-w-7xl mb-8">
          <Breadcrumb items={[
            { label: 'Accueil', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: categoryName, href: `/blog/${params.category}` },
            { label: postData.frontmatter.title }
          ]} />
        </div>

        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Content Column */}
          <main className="lg:col-span-8">
            <article className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">

              {/* Hero Image */}
              {postData.frontmatter.image && (
                <div className="relative h-64 md:h-96 w-full">
                  <Image
                    src={postData.frontmatter.image}
                    alt={postData.frontmatter.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                    <span className="bg-orange-600 text-white text-xs md:text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {categoryName}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 md:p-10">
                {/* Header Info */}
                <header className="mb-10 border-b border-gray-100 pb-10">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                    {postData.frontmatter.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm md:text-base">
                    <div className="flex items-center">
                      <div className="bg-orange-100 p-2 rounded-full mr-3">
                        <UserIcon className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="font-medium text-gray-900">{postData.frontmatter.author || 'JC Trompette'}</span>
                    </div>

                    {postData.frontmatter.date && (
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <CalendarIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <span>{new Date(postData.frontmatter.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}

                    {/* Placeholder for reading time if we had it */}
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <ClockIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <span>~5 min de lecture</span>
                    </div>
                  </div>
                </header>

                {/* Markdown Content */}
                <MarkdownContent content={postData.content} />
              </div>
            </article>


            {/* Related Articles Component (Dynamic) */}
            <div className="mt-12">
              <RelatedArticles
                prevPost={prevPost}
                nextPost={nextPost}
                relatedPosts={relatedPosts}
              />
            </div>

            {/* Accessories Component (Existing) */}
            <div className="mt-12">
              <AccessoiresTrompette />
            </div>

          </main>

          {/* New Interactive Sidebar */}
          <BlogSidebar />

        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
