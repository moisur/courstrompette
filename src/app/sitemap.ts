import { MetadataRoute } from 'next';
import { getAllPostSlugs } from '@/lib/markdown';

const BASE_URL = 'https://courstrompetteparis.lecoledes1.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getAllPostSlugs();

    const blogPosts = posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.params.category}/${post.params.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...blogPosts,
    ];
}
