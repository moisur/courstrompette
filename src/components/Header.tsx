"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { BlogCategory } from '@/app/types/blog'
import { blogCategories } from '@/app/lib/blogPosts'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showBlogMenu, setShowBlogMenu] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const blogMenuRef = useRef<HTMLLIElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const closeMenu = () => {
    setIsMenuOpen(false)
    setShowBlogMenu(false)
    setActiveCategory(null)
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShowBlogMenu(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowBlogMenu(false)
      setActiveCategory(null)
    }, 300) // Délai de 300ms avant de fermer le menu
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (blogMenuRef.current && !blogMenuRef.current.contains(event.target as Node)) {
        setShowBlogMenu(false)
        setActiveCategory(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-95 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="pl-2 font-bold text-2xl bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          JC Trompette
        </Link>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <ul className={`md:flex ${isMenuOpen ? 'block' : 'hidden'} absolute md:relative top-full left-0 right-0 bg-white md:bg-transparent`}>
          <li><Link href="/#about" onClick={closeMenu} className="block px-4 py-2 hover:text-orange-500">À propos</Link></li>
          <li 
            ref={blogMenuRef}
            className="relative" 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/blog" onClick={closeMenu} className="block px-4 py-2 hover:text-orange-500">Blog</Link>
            {showBlogMenu && (
              <ul className="absolute left-0 mt-2 w-64 bg-white shadow-lg rounded-md py-2">
                {blogCategories.map((category) => (
                  <li 
                    key={category.slug}
                    onMouseEnter={() => setActiveCategory(category.slug)}
                    onMouseLeave={() => setActiveCategory(null)}
                    className="relative"
                  >
                    <Link href={`/blog/category/${category.slug}`} className="block px-4 py-2 hover:bg-gray-100">
                      {category.name}
                    </Link>
                    {activeCategory === category.slug && (
                      <ul className="absolute left-full top-0 w-64 bg-white shadow-lg rounded-md py-2 ml-2">
                        {category.posts.map((post) => (
                          <li key={post.slug}>
                            <Link href={`/blog/${post.slug}`} className="block px-4 py-2 hover:bg-gray-100">
                              {post.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li><Link href="/#method" onClick={closeMenu} className="block px-4 py-2 hover:text-orange-500">La méthode JC</Link></li>
          <li><Link href="/#testimonials" onClick={closeMenu} className="block px-4 py-2 hover:text-orange-500">Témoignages</Link></li>
          <li><Link href="/#faq" onClick={closeMenu} className="block px-4 py-2 hover:text-orange-500">FAQ</Link></li>
          <li><Link href="/#contact" onClick={closeMenu} className="block px-4 py-2 hover:text-orange-500">Contact</Link></li>
        </ul>
      </div>
    </nav>
  )
}