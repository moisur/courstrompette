import { getPostData, getAllPostSlugs, getSortedPostsData } from '@/lib/markdown';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RelatedArticles, { BlogPostLink } from '@/components/blog/RelatedArticles';
import AccessoiresTrompette from '@/components/blog/AccessoireRecommandes';
import { CalendarIcon, UserIcon, ClockIcon } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import BlogSidebar from '@/components/blog/BlogSidebar';
import MarkdownContent from '@/components/blog/MarkdownContent';
import JsonLd from '@/components/seo/JsonLd';

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
    const categoryName = params.category.replace(/-/g, ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const allPosts = getSortedPostsData();
    const categoryPosts = allPosts.filter((post: any) => post.category === params.category);
    const currentIndex = categoryPosts.findIndex((post: any) => post.slug === params.slug);

    const prevPost = currentIndex > 0 ? categoryPosts[currentIndex - 1] as BlogPostLink : null;
    const nextPost = currentIndex < categoryPosts.length - 1 ? categoryPosts[currentIndex + 1] as BlogPostLink : null;

    const relatedPostsRaw = categoryPosts.filter((post: any) => post.slug !== params.slug);
    const shuffled = [...relatedPostsRaw].sort(() => 0.5 - Math.random());
    const relatedPosts = shuffled.slice(0, 3) as BlogPostLink[];

    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Accueil",
          "item": "https://courstrompette.fr"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://courstrompette.fr/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": categoryName,
          "item": `https://courstrompette.fr/blog/${params.category}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": postData.frontmatter.title
        }
      ]
    };

    const articleData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": postData.frontmatter.title,
      "description": postData.frontmatter.description || postData.frontmatter.title,
      "image": postData.frontmatter.image ? [`https://courstrompette.fr${postData.frontmatter.image}`] : [],
      "datePublished": postData.frontmatter.date,
      "author": [{
        "@type": "Person",
        "name": postData.frontmatter.author || "Jean Christophe Yervant",
        "url": "https://courstrompette.fr"
      }]
    };

    return (
      <div className="min-h-screen bg-stone-50/50 pt-24 pb-16">
        <JsonLd data={breadcrumbData} />
        <JsonLd data={articleData} />
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 max-w-7xl mb-8">
          <Breadcrumb items={[
            { label: 'Accueil', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: categoryName, href: `/blog/${params.category}` },
            { label: postData.frontmatter.title }
          ]} />
        </div>

        <div className="container mx-auto px-6 max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Content Column */}
          <main className="lg:col-span-8">
            <article className="bg-white rounded-3xl shadow-sm overflow-hidden border border-stone-100">

              {/* Hero Image */}
              {postData.frontmatter.image && (
                <div className="relative h-64 md:h-[450px] w-full">
                  <Image
                    src={postData.frontmatter.image}
                    alt={postData.frontmatter.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 1000px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                    <span className="bg-amber-600 text-white text-xs md:text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                      {categoryName}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-8 md:p-12">
                {/* Header Info */}
                <header className="mb-12 border-b border-stone-100 pb-10">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-stone-900 leading-tight mb-8">
                    {postData.frontmatter.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-stone-500 text-sm md:text-base">
                    <div className="flex items-center">
                      <div className="bg-amber-50 p-2 rounded-full mr-3">
                        <UserIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="font-medium text-stone-900">{postData.frontmatter.author || 'Jean Christophe Yervant'}</span>
                    </div>

                    {postData.frontmatter.date && (
                      <div className="flex items-center">
                        <div className="bg-stone-100 p-2 rounded-full mr-3">
                          <CalendarIcon className="w-5 h-5 text-stone-600" />
                        </div>
                        <span>{new Date(postData.frontmatter.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}

                    <div className="flex items-center">
                      <div className="bg-stone-100 p-2 rounded-full mr-3">
                        <ClockIcon className="w-5 h-5 text-stone-600" />
                      </div>
                      <span>~5 min de lecture</span>
                    </div>
                  </div>
                </header>

                {/* Markdown Content - assuming this component renders accessible HTML/Tailwind */}
                <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:text-stone-900 prose-a:text-amber-700 prose-img:rounded-2xl">
                  <MarkdownContent content={postData.content} />
                </div>
              </div>
            </article>


            {/* Related Articles Component */}
            <div className="mt-16">
              <RelatedArticles
                prevPost={prevPost}
                nextPost={nextPost}
                relatedPosts={relatedPosts}
              />
            </div>

            {/* Accessories Component */}
            <div className="mt-16">
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
