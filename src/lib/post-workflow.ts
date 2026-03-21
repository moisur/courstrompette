import path from 'path';

import {
  DEFAULT_POST_AUTHOR,
  GuideLevel,
  PostCategorySlug,
  createPostDescription,
  createPostSlug,
  getPostCategoryConfig,
  getPostUrl,
  isGuideCategory,
  isGuideLevel,
} from '@/lib/post-config';

export interface CreatePostPayload {
  title?: string;
  slug?: string;
  category?: string;
  date?: string;
  image?: string;
  author?: string;
  description?: string;
  niveau?: string;
  content?: string;
}

export interface NormalizedPostPayload {
  title: string;
  slug: string;
  category: PostCategorySlug;
  date: string;
  image?: string;
  author: string;
  description: string;
  niveau?: GuideLevel;
  content: string;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function cleanValue(value?: string) {
  return value?.trim() ?? '';
}

export function normalizeCreatePostPayload(
  payload: CreatePostPayload,
): NormalizedPostPayload {
  const title = cleanValue(payload.title);
  const category = cleanValue(payload.category);
  const content = (payload.content ?? '').trim();

  if (!title || !category || !content) {
    throw new Error('Les champs titre, catégorie et contenu sont obligatoires.');
  }

  const categoryConfig = getPostCategoryConfig(category);

  if (!categoryConfig) {
    throw new Error('La catégorie fournie est inconnue.');
  }

  const slug = createPostSlug(cleanValue(payload.slug) || title);

  if (!slug) {
    throw new Error('Impossible de générer un slug valide.');
  }

  const date = cleanValue(payload.date);
  const image = cleanValue(payload.image);
  const author = cleanValue(payload.author) || DEFAULT_POST_AUTHOR;
  const description =
    cleanValue(payload.description) || createPostDescription(content);

  const normalizedPost: NormalizedPostPayload = {
    title,
    slug,
    category: categoryConfig.slug,
    date: ISO_DATE_REGEX.test(date)
      ? date
      : new Date().toISOString().split('T')[0],
    image: image || undefined,
    author,
    description,
    content,
  };

  if (isGuideCategory(categoryConfig.slug)) {
    if (!isGuideLevel(payload.niveau)) {
      throw new Error(
        "Le niveau est obligatoire pour les articles du guide d'apprentissage.",
      );
    }

    normalizedPost.niveau = payload.niveau;
  }

  return normalizedPost;
}

export function buildPostMarkdownFile(post: NormalizedPostPayload) {
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(post.title)}`,
    `date: ${JSON.stringify(post.date)}`,
    ...(post.image ? [`image: ${JSON.stringify(post.image)}`] : []),
    `author: ${JSON.stringify(post.author)}`,
    `slug: ${JSON.stringify(post.slug)}`,
    `description: ${JSON.stringify(post.description)}`,
    ...(post.niveau ? [`niveau: ${JSON.stringify(post.niveau)}`] : []),
    '---',
    '',
  ];

  return `${frontmatter.join('\n')}${post.content.trimEnd()}\n`;
}

export function getPostFilePath(category: string, slug: string) {
  return path.join(process.cwd(), 'src/content/posts', category, `${slug}.md`);
}

export function getPostPublicUrl(category: string, slug: string) {
  return getPostUrl(category, slug);
}
