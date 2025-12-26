import { getSortedPostsData, categoryNames } from '@/lib/markdown';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import BlogCTA from '@/components/BlogCTA';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Blog - Cours de Trompette',
  description: 'Découvrez nos articles de blog sur la trompette, des conseils pour débutants aux astuces pour les pros, en passant par l\'entretien de votre instrument et l\'histoire des grands trompettistes.',
};

function groupPostsByCategory(posts: any[]) {
  return posts.reduce((groups, post) => {
    const category = post.category || 'Non classé';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(post);
    return groups;
  }, {});
}

export default function BlogPage() {
  const allPosts = getSortedPostsData();
  const groupedPosts = groupPostsByCategory(allPosts);
  const categories = Object.keys(groupedPosts);

  const orderedCategories = ['guide-apprentissage', 'biographies-trompettistes'].filter(c => categories.includes(c));
  categories.forEach(c => {
    if (!orderedCategories.includes(c)) orderedCategories.push(c);
  });


  return (
    <div className="container mx-auto px-6 pt-24 pb-16 max-w-7xl">
      <div className="mb-12">
        <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Blog' }]} />
      </div>

      <div className="text-center mb-16">
        <span className="text-amber-700 font-medium tracking-widest text-sm uppercase">
          Ressources & Conseils
        </span>
        <h1 className="text-4xl md:text-6xl font-serif text-stone-900 mt-4 mb-6">
          Bienvenue sur notre <span className="italic text-stone-500">Blog</span>
        </h1>
        <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full opacity-60"></div>
      </div>

      <div className="mb-24">
        <BlogCTA />
      </div>

      <div className="space-y-24">
        {orderedCategories.map(categorySlug => {
          const categoryName = categoryNames[categorySlug] || categorySlug.replace(/-/g, ' ');
          const categoryPosts = groupedPosts[categorySlug];

          if (!categoryPosts || categoryPosts.length === 0) return null;

          return (
            <section key={categorySlug} className="mb-12">
              <div className="flex items-center gap-4 mb-10 border-b border-stone-200 pb-4">
                <h2 className="text-3xl font-serif text-stone-900 capitalize">
                  {categoryName}
                </h2>
                <div className="flex-grow h-px bg-stone-100"></div>
              </div>

              {/* Special display for learning guide: Show level cards instead of all posts */}
              {categorySlug === 'guide-apprentissage' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {['Débutant', 'Intermédiaire', 'Avancé'].map((level) => (
                    <Link
                      key={level}
                      href={`/blog/guide-apprentissage?level=${level}`}
                      className="group block relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className={`absolute inset-0 bg-stone-900 transition-colors cursor-pointer border-2 border-transparent group-hover:border-amber-500/30`} />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-900 opacity-100" />

                      <div className="relative p-10 h-full flex flex-col items-center text-center justify-center min-h-[260px] text-white">
                        <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                          {level === 'Débutant' && '🌱'}
                          {level === 'Intermédiaire' && '🚀'}
                          {level === 'Avancé' && '🏆'}
                        </div>
                        <h3 className="text-2xl font-serif mb-3 tracking-wide text-white group-hover:text-amber-400 transition-colors">
                          Niveau {level}
                        </h3>
                        <p className="font-medium text-stone-300 text-sm tracking-wider uppercase border border-stone-700 px-6 py-2 rounded-full group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all">
                          Accéder aux cours
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* Default display for other categories */
                <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {categoryPosts.map((post: any) => (
                    <li key={post.slug}>
                      <Link href={`/blog/${post.category}/${post.slug}`} passHref>
                        <Card className="h-full border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white group overflow-hidden">
                          <div className="relative h-56 w-full overflow-hidden">
                            {post.image ? (
                              <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">
                                No Image
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                            <span className="absolute bottom-4 left-4 text-xs font-medium bg-amber-500 text-white px-3 py-1 rounded-full uppercase tracking-wider">
                              {categoryName}
                            </span>
                          </div>
                          <CardContent className="p-6">
                            <h3 className="text-xl font-serif text-stone-900 mb-3 group-hover:text-amber-700 transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-stone-400 text-sm font-medium">{post.date}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}