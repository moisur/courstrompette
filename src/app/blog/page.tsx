import { getSortedPostsData, categoryNames } from '@/lib/markdown';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import BlogCTA from '@/components/BlogCTA';

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

  // We sort categories to maybe match a desired order, or just simple loop
  // Here we can force specific order if we match the keys manually
  const orderedCategories = ['guide-apprentissage', 'biographies-trompettistes'].filter(c => categories.includes(c));
  // Add any remaining categories that were not in the explicit list
  categories.forEach(c => {
    if (!orderedCategories.includes(c)) orderedCategories.push(c);
  });


  return (
    <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
      <div className="mb-8">
        <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Blog' }]} />
      </div>

      <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-8 text-gray-900 leading-tight">
        Bienvenue sur notre <span className="text-orange-600">Blog</span>
      </h1>

      <BlogCTA />

      <div className="space-y-16">
        {orderedCategories.map(categorySlug => {
          const categoryName = categoryNames[categorySlug] || categorySlug.replace(/-/g, ' ');
          const categoryPosts = groupedPosts[categorySlug];

          if (!categoryPosts || categoryPosts.length === 0) return null;

          return (
            <section key={categorySlug} className="mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-900 border-b-2 border-orange-500 pb-4 capitalize">
                {categoryName}
              </h2>

              {/* Special display for learning guide: Show level cards instead of all posts */}
              {categorySlug === 'guide-apprentissage' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Débutant', 'Intermédiaire', 'Avancé'].map((level) => (
                    <Link
                      key={level}
                      href={`/blog/guide-apprentissage?level=${level}`}
                      className="group block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${level === 'Débutant' ? 'from-green-500 to-green-700' :
                        level === 'Intermédiaire' ? 'from-blue-500 to-blue-700' :
                          'from-purple-500 to-purple-700'
                        } opacity-90 group-hover:opacity-100 transition-opacity`} />

                      <div className="relative p-8 h-full flex flex-col items-center text-center justify-center min-h-[200px] text-white">
                        <div className="text-6xl mb-4 filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">
                          {level === 'Débutant' && '🌱'}
                          {level === 'Intermédiaire' && '🚀'}
                          {level === 'Avancé' && '🏆'}
                        </div>
                        <h3 className="text-3xl font-bold mb-2 tracking-tight">
                          Niveau {level}
                        </h3>
                        <p className="font-medium text-white/90 uppercase tracking-widest text-sm bg-white/20 px-4 py-1 rounded-full">
                          Accéder aux cours
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* Default display for other categories */
                <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {categoryPosts.map((post: any) => (
                    <li key={post.slug}>
                      <Link href={`/blog/${post.category}/${post.slug}`} passHref>
                        <div
                          className={cn(
                            "block overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white",
                            "group"
                          )}
                        >
                          <div className="relative h-48 w-full">
                            {post.image ? (
                              <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <p className="absolute bottom-4 left-4 text-white text-xs font-medium bg-orange-600 px-3 py-1 rounded-full">
                              {categoryName}
                            </p>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-gray-500 text-sm">{post.date}</p>
                          </div>
                        </div>
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