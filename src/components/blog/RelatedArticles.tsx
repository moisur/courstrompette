import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';

export interface BlogPostLink {
    slug: string;
    title: string;
    category: string;
    image?: string;
    date?: string;
    description?: string;
}

interface RelatedArticlesProps {
    prevPost: BlogPostLink | null;
    nextPost: BlogPostLink | null;
    relatedPosts: BlogPostLink[];
}

export default function RelatedArticles({ prevPost, nextPost, relatedPosts }: RelatedArticlesProps) {
    return (
        <div className="border-t border-gray-100 pt-12">
            {/* Navigation Previous/Next */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {prevPost ? (
                    <Link href={`/blog/${prevPost.category}/${prevPost.slug}`} className="group flex items-center p-6 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                        <div className="bg-orange-50 p-3 rounded-full mr-4 group-hover:bg-orange-100 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Article précédent</span>
                            <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{prevPost.title}</h4>
                        </div>
                    </Link>
                ) : <div />}

                {nextPost ? (
                    <Link href={`/blog/${nextPost.category}/${nextPost.slug}`} className="group flex items-center justify-end text-right p-6 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                        <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Article suivant</span>
                            <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{nextPost.title}</h4>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-full ml-4 group-hover:bg-orange-100 transition-colors">
                            <ArrowRight className="w-5 h-5 text-orange-600" />
                        </div>
                    </Link>
                ) : <div />}
            </div>

            {/* Related Posts Grid */}
            {relatedPosts.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 border-l-4 border-orange-500 pl-4">
                        Vous aimerez aussi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedPosts.map((post) => (
                            <Card key={post.slug} className="group border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white">
                                <Link href={`/blog/${post.category}/${post.slug}`} className="block relative h-48 overflow-hidden">
                                    {post.image ? (
                                        <Image
                                            src={post.image}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-orange-600 shadow-sm">
                                        {post.category}
                                    </div>
                                </Link>
                                <CardContent className="p-5">
                                    <div className="flex items-center text-xs text-gray-500 mb-3">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {post.date}
                                    </div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
                                        <Link href={`/blog/${post.category}/${post.slug}`}>
                                            {post.title}
                                        </Link>
                                    </h4>
                                    <Link href={`/blog/${post.category}/${post.slug}`} className="text-sm font-semibold text-orange-600 hover:text-orange-800 inline-flex items-center mt-2">
                                        Lire l&apos;article <ArrowRight className="w-3 h-3 ml-1" />
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
