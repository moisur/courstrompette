import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export const categoryNames: { [key: string]: string } = {
    'guide-apprentissage': "Guide d'apprentissage trompette",
    'biographies-trompettistes': "Biographies de trompettistes célèbres",
    'avis': "Avis & Comparatifs",
    'temoignages': "Témoignages élèves",
};


export interface PostData {
    slug: string;
    category: string;
    frontmatter: {
        title: string;
        date: string;
        image: string;
        author?: string;
        description?: string;
        [key: string]: any;
    };
    content: string;
}

export function getPostData(category: string, slug: string): PostData {
    const fullPath = path.join(postsDirectory, category, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const { data, content } = matter(fileContents);

    return {
        slug,
        category,
        frontmatter: data as PostData['frontmatter'],
        content,
    };
}

export function getAllPostSlugs() {
    const categories = fs.readdirSync(postsDirectory);
    let paths: { params: { category: string; slug: string } }[] = [];

    categories.forEach((category) => {
        const categoryPath = path.join(postsDirectory, category);
        if (fs.statSync(categoryPath).isDirectory()) {
            const fileNames = fs.readdirSync(categoryPath);
            fileNames.forEach((fileName) => {
                if (fileName.endsWith('.md')) {
                    paths.push({
                        params: {
                            category,
                            slug: fileName.replace(/\.md$/, ''),
                        },
                    });
                }
            });
        }
    });

    return paths;
}

export function getSortedPostsData() {
    const categories = fs.readdirSync(postsDirectory);
    const allPostsData = categories.flatMap((category) => {
        const categoryPath = path.join(postsDirectory, category);
        if (!fs.statSync(categoryPath).isDirectory()) return [];

        const fileNames = fs.readdirSync(categoryPath);
        return fileNames.map((fileName) => {
            if (!fileName.endsWith('.md')) return null;

            const slug = fileName.replace(/\.md$/, '');
            const fullPath = path.join(categoryPath, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(fileContents);

            return {
                slug,
                category,
                ...(data as PostData['frontmatter']),
            };
        }).filter((post): post is any => post !== null);
    });

    // Sort posts by date
    return allPostsData.sort((a: any, b: any) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export function getBlogMenuData() {
    const allPosts = getSortedPostsData();
    const categories: { [key: string]: any[] } = {};

    allPosts.forEach((post: any) => {
        if (!categories[post.category]) {
            categories[post.category] = [];
        }
        categories[post.category].push(post);
    });

    return Object.keys(categories).map((slug) => ({
        name: categoryNames[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        slug,
        posts: categories[slug].map((post) => ({
            title: post.title,
            slug: post.slug,
            date: post.date,
            image: post.image,
            niveau: post.niveau,
        })),
    }));
}

