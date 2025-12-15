import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';
import React from 'react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    return (
        <nav className={`flex text-sm text-gray-500 items-center space-x-2 ${className}`} aria-label="Breadcrumb">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <React.Fragment key={index}>
                        {index > 0 && <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />}

                        {isLast ? (
                            <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-md" aria-current="page">
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                href={item.href || '#'}
                                className="hover:text-orange-600 transition-colors whitespace-nowrap"
                            >
                                {item.label}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
