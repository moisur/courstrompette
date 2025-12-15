import { getSortedPostsData } from '@/lib/markdown';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, ChevronLeftIcon } from 'lucide-react'; // Ajout de ChevronLeftIcon pour le bouton retour
import { notFound } from 'next/navigation';

import Breadcrumb from '@/components/Breadcrumb';
import BlogCTA from '@/components/BlogCTA';

// Fonction pour générer les métadonnées dynamiquement
export async function generateMetadata({ params }: { params: { category: string } }) {
    const categoryName = params.category.replace(/-/g, ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '); // Met en majuscule la première lettre de chaque mot

    return {
        title: `${categoryName} - Blog Cours de Trompette`,
        description: `Tous les articles de blog sur la catégorie "${categoryName}" - Retrouvez nos conseils, astuces et analyses sur la trompette.`,
    };
}
// ... (omitting unchanged parts for brevity if handled by tool logic, but here I must match context for replace)
// Actually I need to do two edits: import and the second return block. I will do import first or combined if context allows.
// The context is too far apart. I will do import first.

// wait, the previous tool call didn't add the import to [category]/page.tsx. Use replacing header to add import too? No, imports are at top.
// I will just add the import now.

// Fonction pour générer les chemins statiques pour les catégories
export function generateStaticParams() {
    const posts = getSortedPostsData();
    const categories = Array.from(new Set(posts.map((post: any) => post.category).filter(Boolean))) as string[];
    return categories.map((category) => ({ category }));
}

export default function CategoryPage({ params, searchParams }: { params: { category: string }, searchParams: { level?: string } }) {
    const { category } = params;
    const currentLevel = searchParams.level; // Get level from URL query, e.g. ?level=Débutant
    const allPosts = getSortedPostsData();
    const categoryPosts = allPosts.filter((post: any) => post.category === category);

    if (categoryPosts.length === 0) {
        notFound();
    }

    // Formate le nom de la catégorie
    const formattedCategoryName = category.replace(/-/g, ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const levelsOrder = ['Débutant', 'Intermédiaire', 'Avancé'];

    const normalizeLevel = (level: string | undefined) => {
        if (!level) return 'Autre';
        if (level.includes('DÃ©butant') || level.includes('butant') || level.includes('Débutant')) return 'Débutant';
        if (level.includes('IntermÃ©diaire') || level.includes('termÃ©diaire') || level.includes('rmédiaire') || level.includes('Intermédiaire')) return 'Intermédiaire';
        if (level.includes('AvancÃ©') || level.includes('Avanc') || level.includes('Avancé')) return 'Avancé';
        return 'Autre';
    };

    if (category === 'guide-apprentissage') {
        const postsByLevel: { [key: string]: any[] } = {
            'Débutant': [],
            'Intermédiaire': [],
            'Avancé': [],
            'Autre': []
        };

        categoryPosts.forEach((post: any) => {
            const level = normalizeLevel(post.niveau);
            if (postsByLevel[level]) {
                postsByLevel[level].push(post);
            } else {
                postsByLevel['Autre'].push(post);
            }
        });

        // If a level is selected via query, we only show that level
        const levelsToShow = currentLevel ? [currentLevel] : levelsOrder;

        return (
            <div className="bg-gray-50 min-h-screen pt-32 md:pt-24 pb-16 font-sans">
                <div className="container mx-auto px-4 max-w-7xl">

                    {/* Breadcrumb Section */}
                    <div className="mb-8">
                        <Breadcrumb items={[
                            { label: 'Accueil', href: '/' },
                            { label: 'Blog', href: '/blog' },
                            { label: formattedCategoryName }
                        ]} />
                    </div>

                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                            Guide <span className="text-orange-600">d&apos;Apprentissage</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Votre feuille de route complète pour maîtriser la trompette, étape par étape.
                        </p>
                    </div>

                    <BlogCTA />

                    {/* Navigation Cards (Filters) */}
                    {/* Compact Filter Tabs */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        <Link
                            href={`/blog/${category}`}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border ${!currentLevel
                                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                        >
                            Tous
                        </Link>
                        {levelsOrder.map((level) => {
                            const isSelected = currentLevel === level;
                            const levelColor =
                                level === 'Débutant' ? 'text-green-600' :
                                    level === 'Intermédiaire' ? 'text-blue-600' :
                                        'text-purple-600';

                            return (
                                <Link
                                    key={level}
                                    href={isSelected ? `/blog/${category}` : `/blog/${category}?level=${level}`}
                                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border flex items-center gap-2 ${isSelected
                                        ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                                        : `bg-white text-gray-700 border-gray-200 hover:border-orange-200 hover:bg-orange-50`
                                        }`}
                                >
                                    <span>{level}</span>
                                    {!isSelected && (
                                        <span className={`text-xs ${levelColor}`}>●</span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-24">
                        {levelsToShow.map((level) => {
                            const posts = postsByLevel[level];
                            if (!posts || posts.length === 0) return null; // Don't show empty sections (unless filtered? maybe show empty state?)

                            // Define section colors
                            const sectionColor =
                                level === 'Débutant' ? 'text-green-600 border-green-500' :
                                    level === 'Intermédiaire' ? 'text-blue-600 border-blue-500' :
                                        'text-purple-600 border-purple-500';

                            return (
                                <section key={level} id={level.toLowerCase()} className="scroll-mt-32">
                                    <div className="flex items-center mb-10">
                                        <h2 className={`text-4xl font-extrabold ${sectionColor} border-l-8 pl-6 flex items-center`}>
                                            {level === 'Débutant' && '🌱 '}
                                            {level === 'Intermédiaire' && '🚀 '}
                                            {level === 'Avancé' && '🏆 '}
                                            <span className="ml-4 text-gray-900">Niveau {level}</span>
                                        </h2>
                                        <div className="flex-grow h-px bg-gray-200 ml-8 transform translate-y-2"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                        {posts.map((post: any) => (
                                            <Card
                                                key={post.slug}
                                                className="group border-none shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-white flex flex-col h-full ring-1 ring-gray-100 hover:ring-orange-200"
                                            >
                                                <Link href={`/blog/${post.category}/${post.slug}`} className="block relative h-64 overflow-hidden">
                                                    {post.image ? (
                                                        <Image
                                                            src={post.image}
                                                            alt={post.title}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                                    <div className="absolute top-4 right-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm bg-white text-gray-900`}>
                                                            {level}
                                                        </span>
                                                    </div>
                                                </Link>

                                                <CardContent className="p-8 flex-grow flex flex-col pt-6">
                                                    <div className="flex items-center text-xs font-semibold text-orange-600 mb-4 uppercase tracking-wide">
                                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                                        {post.date}
                                                    </div>

                                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-orange-600 transition-colors">
                                                        <Link href={`/blog/${post.category}/${post.slug}`}>
                                                            {post.title}
                                                        </Link>
                                                    </h3>

                                                    <p className="text-gray-600 line-clamp-3 mb-6 flex-grow leading-relaxed">
                                                        {post.description}
                                                    </p>

                                                    <Link
                                                        href={`/blog/${post.category}/${post.slug}`}
                                                        className="inline-flex items-center text-orange-600 font-bold hover:text-orange-800 transition-colors text-sm uppercase tracking-wider mt-auto"
                                                    >
                                                        Lire l&apos;article
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                        </svg>
                                                    </Link>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen pt-32 md:pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-8">
                    <Breadcrumb items={[
                        { label: 'Accueil', href: '/' },
                        { label: 'Blog', href: '/blog' },
                        { label: formattedCategoryName }
                    ]} />
                </div>
                <div className="mb-12 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 capitalize mb-4 leading-tight">
                        Catégorie : <span className="text-orange-600">{formattedCategoryName}</span>
                    </h1>
                </div>

                <BlogCTA />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryPosts.map((post: any) => (
                        <Card
                            key={post.slug}
                            className="relative overflow-hidden group h-full flex flex-col rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-none"
                        >
                            <Link href={`/blog/${post.category}/${post.slug}`} className="block relative h-52 overflow-hidden">
                                {post.image ? (
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg font-medium">
                                        Pas d&apos;image disponible
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                                    <span className="text-white text-sm font-semibold bg-orange-600 px-3 py-1 rounded-full opacity-90">
                                        {formattedCategoryName}
                                    </span>
                                </div>
                            </Link>

                            <CardContent className="p-6 flex-grow flex flex-col justify-between">
                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                    <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
                                    {post.date}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-orange-600 transition-colors duration-200">
                                    <Link href={`/blog/${post.category}/${post.slug}`} className="hover:underline">
                                        {post.title}
                                    </Link>
                                </h3>
                                <p className="text-gray-700 line-clamp-3 mb-5 flex-grow text-base leading-relaxed">
                                    {post.description}
                                </p>
                                <Link
                                    href={`/blog/${post.category}/${post.slug}`}
                                    className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-800 transition-colors duration-200 mt-auto text-lg"
                                >
                                    Lire la suite
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div >
    );
}