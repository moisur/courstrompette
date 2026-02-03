"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePost() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'guide-apprentissage',
        date: new Date().toISOString().split('T')[0],
        image: '',
        author: 'JC Trompette',
        description: '',
        content: ''
    });
    const [status, setStatus] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Generate slug from title if empty
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        if (!formData.slug) {
            const slug = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setFormData(prev => ({ ...prev, title, slug }));
        } else {
            setFormData(prev => ({ ...prev, title }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        try {
            const response = await fetch('/api/admin/create-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('Article créé avec succès !');
                // Optional: Redirect to the new post or clear form
                // router.push(`/blog/${formData.category}/${formData.slug}`);
                setFormData({
                    title: '',
                    slug: '',
                    category: 'guide-apprentissage',
                    date: new Date().toISOString().split('T')[0],
                    image: '',
                    author: 'JC Trompette',
                    description: '',
                    content: ''
                })
            } else {
                const errorData = await response.json();
                setStatus(`Erreur: ${errorData.message}`);
            }
        } catch (error) {
            setStatus('Une erreur est survenue.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Créer un nouvel article</h1>

            {status && (
                <div className={`p-4 mb-6 rounded ${status.includes('Succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">

                {/* Title */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="title">Titre</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleTitleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                    />
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="slug">Slug (URL)</label>
                    <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="category">Catégorie</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="guide-apprentissage">Guide d&apos;Apprentissage</option>
                        <option value="biographies-trompettistes">Biographie Trompettiste</option>
                        {/* Add more categories as needed */}
                    </select>
                </div>

                {/* Date */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="date">Date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                {/* Image URL */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="image">Image Principale (URL)</label>
                    <input
                        type="text"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="/blog/mon-image.jpg"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                {/* Author */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="author">Auteur</label>
                    <input
                        type="text"
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="description">Description (Méta & Extrait)</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                {/* Content (Markdown) */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="content">Contenu (Markdown/HTML)</label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows={15}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                        required
                        placeholder="# Mon Titre..."
                    />
                    <p className="text-sm text-gray-500 mt-2">Vous pouvez utiliser du Markdown et du HTML standard.</p>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-700 transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? 'Création en cours...' : 'Publier l\'article'}
                </button>

            </form>
        </div>
    );
}
