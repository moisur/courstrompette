"use client";

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useBooking } from '@/context/BookingContext';
import React from 'react';
import Image from 'next/image';

interface MarkdownContentProps {
    content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
    const { openModal } = useBooking();

    return (
        <div className="prose prose-lg max-w-none text-gray-700 
                            prose-headings:font-bold prose-headings:text-gray-900 
                            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-l-4 prose-h2:border-orange-500 prose-h2:pl-4 
                            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                            prose-p:leading-relaxed prose-p:mb-6
                            prose-a:text-orange-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-gray-900 prose-strong:font-bold
                            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
                            prose-li:mb-2
                            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:mx-auto
                            prose-blockquote:border-l-4 prose-blockquote:border-orange-200 prose-blockquote:bg-orange-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-gray-800
                        ">
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                    img: ({ node, ...props }) => (
                        <span className="block my-8 relative w-full h-auto" style={{ maxHeight: '500px' }}>
                            <Image
                                src={props.src || ''}
                                alt={props.alt || ''}
                                width={800}
                                height={500}
                                className="rounded-xl shadow-lg object-contain mx-auto"
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    maxHeight: '500px'
                                }}
                                unoptimized={props.src?.startsWith('http')}
                                sizes="(max-width: 768px) 100vw, 800px"
                            />
                        </span>
                    ),
                    a: ({ node, href, children, className, ...props }) => {
                        if (href === '#booking') {
                            return (
                                <a
                                    href={href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openModal();
                                    }}
                                    className={`${className || ''} cursor-pointer`}
                                    {...props}
                                >
                                    {children}
                                </a>
                            );
                        }
                        return <a href={href} className={className} {...props}>{children}</a>;
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
