"use client";

import { useState } from 'react';

import {
  ARTICLE_TEMPLATE,
  DEFAULT_POST_AUTHOR,
  GUIDE_LEVELS,
  POST_CATEGORIES,
  createPostDescription,
  createPostSlug,
  estimateReadingTimeMinutes,
  getPostRelativePath,
  getPostUrl,
  isGuideCategory,
} from '@/lib/post-config';

interface CreatePostFormData {
  title: string;
  slug: string;
  category: string;
  date: string;
  image: string;
  author: string;
  description: string;
  niveau: string;
  content: string;
}

interface StatusState {
  type: 'success' | 'error';
  message: string;
}

function createInitialFormData(): CreatePostFormData {
  return {
    title: '',
    slug: '',
    category: 'guide-apprentissage',
    date: new Date().toISOString().split('T')[0],
    image: '',
    author: DEFAULT_POST_AUTHOR,
    description: '',
    niveau: GUIDE_LEVELS[0],
    content: '',
  };
}

export default function CreatePost() {
  const [formData, setFormData] = useState<CreatePostFormData>(createInitialFormData);
  const [status, setStatus] = useState<StatusState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedSlug = formData.slug || createPostSlug(formData.title);
  const resolvedDescription =
    formData.description.trim() || createPostDescription(formData.content);
  const outputPath = resolvedSlug
    ? getPostRelativePath(formData.category, resolvedSlug)
    : 'src/content/posts/<categorie>/<slug>.md';
  const outputUrl = resolvedSlug
    ? getPostUrl(formData.category, resolvedSlug)
    : '/blog/<categorie>/<slug>';
  const readingTime = estimateReadingTimeMinutes(formData.content);
  const guideCategory = isGuideCategory(formData.category);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;

    setFormData((previous) => ({
      ...previous,
      title,
      slug: previous.slug ? previous.slug : createPostSlug(title),
    }));
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      if (name === 'category') {
        return {
          ...previous,
          category: value,
          niveau: isGuideCategory(value) ? previous.niveau || GUIDE_LEVELS[0] : '',
        };
      }

      return {
        ...previous,
        [name]: value,
      };
    });
  };

  const handleInsertTemplate = () => {
    setFormData((previous) => ({
      ...previous,
      content: previous.content.trim() ? `${previous.content}\n\n${ARTICLE_TEMPLATE}` : ARTICLE_TEMPLATE,
    }));
  };

  const handleGenerateDescription = () => {
    setFormData((previous) => ({
      ...previous,
      description: createPostDescription(previous.content),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/create-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slug: resolvedSlug,
          description: formData.description.trim() || resolvedDescription,
          niveau: guideCategory ? formData.niveau : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({ type: 'error', message: data.message || 'Une erreur est survenue.' });
        return;
      }

      setStatus({
        type: 'success',
        message: `${data.message} URL: ${data.url}`,
      });
      setFormData(createInitialFormData());
    } catch {
      setStatus({ type: 'error', message: 'Une erreur est survenue.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-3 text-3xl font-bold text-gray-800">Créer un nouvel article</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-gray-600">
          Workflow recommandé : choisissez la catégorie, laissez le slug se générer,
          renseignez le niveau si vous publiez dans le guide, déposez vos images dans
          <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5">public/blog</code>
          puis vérifiez le chemin et l’URL avant publication.
        </p>
      </div>

      {status && (
        <div
          className={`mb-6 rounded-lg p-4 ${
            status.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-8 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-orange-100 bg-orange-50 p-4">
            <div>
              <p className="text-sm font-semibold text-orange-900">Canevas réutilisable</p>
              <p className="text-sm text-orange-800">
                Pré-remplit une structure simple pour créer vite un nouvel article.
              </p>
            </div>
            <button
              type="button"
              onClick={handleInsertTemplate}
              className="rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
            >
              Insérer le canevas
            </button>
          </div>

          <div>
            <label className="mb-2 block font-bold text-gray-700" htmlFor="title">
              Titre
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-bold text-gray-700" htmlFor="slug">
              Slug (URL)
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setFormData((previous) => ({
                    ...previous,
                    slug: createPostSlug(previous.title),
                  }))
                }
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Générer
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-bold text-gray-700" htmlFor="category">
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {POST_CATEGORIES.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-bold text-gray-700" htmlFor="date">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {guideCategory && (
            <div>
              <label className="mb-2 block font-bold text-gray-700" htmlFor="niveau">
                Niveau
              </label>
              <select
                id="niveau"
                name="niveau"
                value={formData.niveau}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {GUIDE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Obligatoire pour que l’article remonte correctement dans le menu et les filtres.
              </p>
            </div>
          )}

          <div>
            <label className="mb-2 block font-bold text-gray-700" htmlFor="image">
              Image principale
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="/blog/mon-image.webp"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              Chemin public conseillé : <code>/blog/...</code>
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-bold text-gray-700" htmlFor="author">
                Auteur
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGenerateDescription}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Générer la méta-description
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-bold text-gray-700" htmlFor="description">
              Description (métadonnée + extrait)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              Si laissé vide, le système générera automatiquement un extrait propre depuis le contenu.
            </p>
          </div>

          <div>
            <label className="mb-2 block font-bold text-gray-700" htmlFor="content">
              Contenu (Markdown / HTML)
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={18}
              className="w-full rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
              placeholder="# Mon article..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-lg bg-orange-600 px-4 py-3 font-bold text-white transition hover:bg-orange-700 ${
              isSubmitting ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            {isSubmitting ? 'Création en cours...' : "Publier l'article"}
          </button>
        </form>

        <aside className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-bold text-gray-800">Prévisualisation du workflow</h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="mb-1 font-semibold text-gray-900">Fichier généré</p>
                <code className="block rounded bg-gray-100 p-3 text-xs">{outputPath}</code>
              </div>
              <div>
                <p className="mb-1 font-semibold text-gray-900">URL finale</p>
                <code className="block rounded bg-gray-100 p-3 text-xs">{outputUrl}</code>
              </div>
              <div>
                <p className="mb-1 font-semibold text-gray-900">Description utilisée</p>
                <p className="rounded bg-gray-50 p-3 leading-relaxed text-gray-600">
                  {resolvedDescription || 'La description apparaîtra ici.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded bg-gray-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Lecture</p>
                  <p className="mt-1 font-semibold text-gray-900">~{readingTime} min</p>
                </div>
                <div className="rounded bg-gray-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Visibilité menu</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {guideCategory ? `Niveau ${formData.niveau || 'manquant'}` : 'Directe'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-800">Checklist</h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>Images placées dans <code>public/blog</code> avant publication.</li>
              <li>Slug relu et stable pour le SEO.</li>
              <li>Description courte et exploitable en extrait.</li>
              <li>Niveau renseigné pour <code>guide-apprentissage</code>.</li>
              <li>Contrôle rapide après création sur l’URL finale.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
