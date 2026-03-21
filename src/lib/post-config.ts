export const POST_CATEGORIES = [
  {
    slug: 'guide-apprentissage',
    label: "Guide d'apprentissage trompette",
    requiresLevel: true,
  },
  {
    slug: 'biographies-trompettistes',
    label: 'Biographies de trompettistes célèbres',
    requiresLevel: false,
  },
  {
    slug: 'avis',
    label: 'Avis & Comparatifs',
    requiresLevel: false,
  },
  {
    slug: 'temoignages',
    label: 'Témoignages élèves',
    requiresLevel: false,
  },
  {
    slug: 'outils-jazz',
    label: 'Outils Jazz',
    requiresLevel: false,
  },
] as const;

export const GUIDE_LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'] as const;

export const DEFAULT_POST_AUTHOR = 'JC Trompette';

export const ARTICLE_TEMPLATE = `Introduction

## 1. Premier point

Votre argument principal.

![Illustration principale](/blog/mon-image-principale.svg)

## 2. Deuxième point

Votre développement.

## 3. Troisième point

Votre conclusion opérationnelle.

***

## En bref

Résumé et appel à l'action.`;

export type PostCategorySlug = (typeof POST_CATEGORIES)[number]['slug'];
export type GuideLevel = (typeof GUIDE_LEVELS)[number];

const DIACRITICS_REGEX = /[\u0300-\u036f]/g;
const HTML_TAG_REGEX = /<[^>]*>/g;

function normalizeForComparison(value: string) {
  return value
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .toLowerCase();
}

export function getPostCategoryConfig(category: string) {
  return POST_CATEGORIES.find(({ slug }) => slug === category);
}

export function isGuideCategory(category: string) {
  return getPostCategoryConfig(category)?.requiresLevel ?? false;
}

export function createPostSlug(value: string) {
  return normalizeForComparison(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizePostLevel(level?: string): GuideLevel | 'Autre' {
  if (!level) {
    return 'Autre';
  }

  const original = level.toLowerCase();
  const normalized = normalizeForComparison(level);

  if (normalized.includes('debutant') || original.includes('butant')) {
    return 'Débutant';
  }

  if (
    normalized.includes('intermediaire') ||
    normalized.includes('mediaire') ||
    original.includes('médiaire') ||
    original.includes('mdiaire')
  ) {
    return 'Intermédiaire';
  }

  if (normalized.includes('avance') || original.includes('avanc')) {
    return 'Avancé';
  }

  return 'Autre';
}

export function isGuideLevel(level?: string): level is GuideLevel {
  return GUIDE_LEVELS.includes(level as GuideLevel);
}

export function extractPlainTextFromPost(content: string) {
  return content
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(HTML_TAG_REGEX, ' ')
    .replace(/[`*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createPostDescription(content: string, maxLength = 155) {
  const plainText = extractPlainTextFromPost(content);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const candidate = plainText.slice(0, maxLength);
  const lastBoundary = candidate.lastIndexOf(' ');
  const excerpt = lastBoundary > 90 ? candidate.slice(0, lastBoundary) : candidate;

  return `${excerpt.trim()}...`;
}

export function estimateReadingTimeMinutes(content: string, wordsPerMinute = 220) {
  const plainText = extractPlainTextFromPost(content);
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;

  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function getPostRelativePath(category: string, slug: string) {
  return `src/content/posts/${category}/${slug}.md`;
}

export function getPostUrl(category: string, slug: string) {
  return `/blog/${category}/${slug}`;
}
