import { getSortedPostsData } from '@/lib/markdown';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, ChevronLeftIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import BlogCTA from '@/components/BlogCTA';
import { cn } from '@/app/lib/utils';
import InlineCTA from '@/components/blog/InlineCTA';

export async function generateMetadata({ params }: { params: { category: string } }) {
    const categoryName = params.category.replace(/-/g, ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return {
        title: `${categoryName} - Blog Cours de Trompette`,
        description: `Tous les articles de blog sur la catégorie "${categoryName}" - Retrouvez nos conseils, astuces et analyses sur la trompette.`,
    };
}

export function generateStaticParams() {
    const posts = getSortedPostsData();
    const categories = Array.from(new Set(posts.map((post: any) => post.category).filter(Boolean))) as string[];
    return categories.map((category) => ({ category }));
}

export default function CategoryPage({ params, searchParams }: { params: { category: string }, searchParams: { level?: string } }) {
    const { category } = params;
    const currentLevel = searchParams.level;
    const allPosts = getSortedPostsData();
    const categoryPosts = allPosts.filter((post: any) => post.category === category);

    if (categoryPosts.length === 0) {
        notFound();
    }

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

        const levelsToShow = currentLevel ? [currentLevel] : levelsOrder;

        return (
            <div className="bg-stone-50/50 min-h-screen pt-32 md:pt-24 pb-16 font-sans">
                <div className="container mx-auto px-6 max-w-7xl">

                    <div className="mb-4">
                        <Breadcrumb items={[
                            { label: 'Accueil', href: '/' },
                            { label: 'Blog', href: '/blog' },
                            { label: formattedCategoryName }
                        ]} />
                    </div>

                    <div className="text-center mb-10">
                        <span className="text-amber-700 font-medium tracking-widest text-sm uppercase">
                            Apprentissage
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mt-2 mb-4">
                            Guide <span className="italic text-stone-500">d&apos;Apprentissage</span>
                        </h1>
                        <div className="w-20 h-1 bg-amber-600 mx-auto rounded-full opacity-60 mb-4"></div>
                        <p className="text-stone-600 max-w-2xl mx-auto leading-relaxed text-lg">
                            Votre feuille de route complète pour maîtriser la trompette, étape par étape.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        <Link
                            href={`/blog/${category}`}
                            scroll={false}
                            className={cn(
                                "px-6 py-3 rounded-full text-sm font-medium transition-all duration-300",
                                !currentLevel
                                    ? "bg-stone-900 text-white shadow-md"
                                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:border-amber-200"
                            )}
                        >
                            Tous
                        </Link>
                        {levelsOrder.map((level) => {
                            const isSelected = currentLevel === level;
                            return (
                                <Link
                                    key={level}
                                    href={isSelected ? `/blog/${category}` : `/blog/${category}?level=${level}`}
                                    scroll={false}
                                    className={cn(
                                        "px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                                        isSelected
                                            ? "bg-stone-900 text-white shadow-md"
                                            : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:border-amber-200"
                                    )}
                                >
                                    <span>{level}</span>
                                    {isSelected && <span className="text-amber-400">●</span>}
                                </Link>
                            );
                        })}
                    </div>



                    <div className="space-y-12 mb-20">
                        {levelsToShow.map((level, index) => {
                            const posts = postsByLevel[level];
                            if (!posts || posts.length === 0) return null;

                            return (
                                <div key={level}>
                                    <section id={level.toLowerCase()} className="scroll-mt-32 mb-20">
                                        <div className="flex items-center gap-4 mb-10 border-b border-stone-200 pb-4">
                                            <h2 className="text-3xl font-serif text-stone-900 flex items-center gap-3">
                                                {level === 'Débutant' && '🌱'}
                                                {level === 'Intermédiaire' && '🚀'}
                                                {level === 'Avancé' && '🏆'}
                                                <span className="ml-2">Niveau {level}</span>
                                            </h2>
                                            <div className="flex-grow h-px bg-stone-100"></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {posts.map((post: any) => (
                                                <Card
                                                    key={post.slug}
                                                    className="group border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white flex flex-col h-full overflow-hidden"
                                                >
                                                    <Link href={`/blog/${post.category}/${post.slug}`} className="block relative h-60 overflow-hidden">
                                                        {post.image ? (
                                                            <Image
                                                                src={post.image}
                                                                alt={post.title}
                                                                fill
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">
                                                                No Image
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 right-4">
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-stone-800 backdrop-blur-sm">
                                                                {level}
                                                            </span>
                                                        </div>
                                                    </Link>

                                                    <CardContent className="p-8 flex-grow flex flex-col pt-6">
                                                        <div className="flex items-center text-xs font-medium text-amber-700 mb-4 uppercase tracking-wider">
                                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                                            {post.date}
                                                        </div>

                                                        <h3 className="text-xl font-serif text-stone-900 mb-4 leading-tight group-hover:text-amber-700 transition-colors">
                                                            <Link href={`/blog/${post.category}/${post.slug}`}>
                                                                {post.title}
                                                            </Link>
                                                        </h3>

                                                        <p className="text-stone-500 line-clamp-3 mb-6 flex-grow leading-relaxed text-sm">
                                                            {post.description}
                                                        </p>

                                                        <Link
                                                            href={`/blog/${post.category}/${post.slug}`}
                                                            className="inline-flex items-center text-stone-900 font-medium hover:text-amber-700 transition-colors text-sm uppercase tracking-wide mt-auto group/link"
                                                        >
                                                            Lire l&apos;article
                                                            <ChevronLeftIcon className="w-4 h-4 ml-1 rotate-180 transition-transform group-hover/link:translate-x-1" />
                                                        </Link>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Mini CTA entre les niveaux (seulement si on affiche "Tous") */}
                                    {!currentLevel && index === 0 && (
                                        <InlineCTA
                                            text={<span>Vous maîtrisez les bases ? <span className="italic text-amber-600">Passez à la vitesse supérieure !</span></span>}
                                            buttonText="Je veux progresser"
                                        />
                                    )}

                                    {!currentLevel && index === 1 && (
                                        <InlineCTA
                                            text={<span>Un plafond de verre technique ? <span className="italic text-amber-600">Débloquez votre potentiel.</span></span>}
                                            buttonText="Coaching Personnalisé"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mb-20">
                        <BlogCTA />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-stone-50/50 min-h-screen pt-32 md:pt-24 pb-16 font-sans">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="mb-12">
                    <Breadcrumb items={[
                        { label: 'Accueil', href: '/' },
                        { label: 'Blog', href: '/blog' },
                        { label: formattedCategoryName }
                    ]} />
                </div>

                <div className="text-center mb-16">
                    <span className="text-amber-700 font-medium tracking-widest text-sm uppercase">
                        Catégorie
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif text-stone-900 mt-4 mb-6 capitalize leading-tight">
                        {formattedCategoryName}
                    </h1>
                    <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full opacity-60"></div>
                </div>

                <div className="mb-20">
                    <BlogCTA />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryPosts.map((post: any) => (
                        <Card
                            key={post.slug}
                            className="bg-white border-none shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden h-full flex flex-col"
                        >
                            <Link href={`/blog/${post.category}/${post.slug}`} className="block relative h-60 overflow-hidden">
                                {post.image ? (
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">
                                        Pas d&apos;image disponible
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                    <span className="text-white text-xs font-semibold uppercase tracking-wider">
                                        Lire l&apos;article
                                    </span>
                                </div>
                            </Link>

                            <CardContent className="p-8 flex-grow flex flex-col">
                                <div className="flex items-center text-xs font-medium text-amber-700 mb-4 uppercase tracking-wider">
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    {post.date}
                                </div>
                                <h3 className="text-xl font-serif text-stone-900 mb-4 leading-tight group-hover:text-amber-700 transition-colors">
                                    <Link href={`/blog/${post.category}/${post.slug}`}>
                                        {post.title}
                                    </Link>
                                </h3>
                                <p className="text-stone-500 line-clamp-3 mb-6 flex-grow leading-relaxed text-sm">
                                    {post.description}
                                </p>
                                <Link
                                    href={`/blog/${post.category}/${post.slug}`}
                                    className="inline-flex items-center text-stone-900 font-medium hover:text-amber-700 transition-colors text-sm uppercase tracking-wide mt-auto group/link"
                                >
                                    Lire la suite
                                    <ChevronLeftIcon className="w-4 h-4 ml-1 rotate-180 transition-transform group-hover/link:translate-x-1" />
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div >
    );
}