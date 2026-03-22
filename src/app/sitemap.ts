import { MetadataRoute } from 'next';
import { getAllCategories, getAllPostEntries } from '@/lib/markdown';
import { locations } from '@/data/locations';

const BASE_URL = 'https://courstrompette.fr';
const STATIC_PAGES = [
    {
        url: `${BASE_URL}/paris`,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    },
    {
        url: `${BASE_URL}/logiciel`,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    },
    {
        url: `${BASE_URL}/pianoenligne`,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    },
];

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getAllPostEntries();
    const categories = getAllCategories();
    const latestPostUpdate = posts.reduce(
        (latest, post) => post.lastModified > latest ? post.lastModified : latest,
        new Date('2024-01-01')
    );

    const blogPosts = posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.params.category}/${post.params.slug}`,
        lastModified: post.lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const categoryPages = categories.map((category) => {
        const categoryPosts = posts.filter((post) => post.params.category === category);
        const categoryLastModified = categoryPosts.reduce(
            (latest, post) => post.lastModified > latest ? post.lastModified : latest,
            latestPostUpdate
        );

        return {
            url: `${BASE_URL}/blog/${category}`,
            lastModified: categoryLastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.75,
        };
    });

    const parisPages = locations.map((location) => ({
        url: `${BASE_URL}/paris/${location.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [
        {
            url: BASE_URL,
            lastModified: latestPostUpdate,
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: latestPostUpdate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...STATIC_PAGES.map((page) => ({
            ...page,
            lastModified: latestPostUpdate,
        })),
        ...categoryPages,
        ...blogPosts,
        ...parisPages,
    ];
}
