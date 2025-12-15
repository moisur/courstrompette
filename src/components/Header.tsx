"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BlogCategory } from '@/app/types/blog'
import { useBooking } from '@/context/BookingContext'

interface HeaderProps {
  menuItems: BlogCategory[];
}

export default function Header({ menuItems }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showBlogMenu, setShowBlogMenu] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeLevel, setActiveLevel] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const blogMenuRef = useRef<HTMLLIElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null) // New ref for category delay
  const pathname = usePathname()
  const { openModal } = useBooking(); // Hook for modal

  // Helper to normalize level - purely for matching logic
  const normalizeLevel = (level: string | undefined) => {
    if (!level) return 'Autre';
    if (level.includes('Débutant') || level.includes('butant')) return 'Débutant';
    if (level.includes('Intermédiaire') || level.includes('mediaire')) return 'Intermédiaire';
    if (level.includes('Avancé') || level.includes('Avanc')) return 'Avancé';
    return 'Autre';
  };


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => {
    setIsMenuOpen(false)
    setShowBlogMenu(false)
    setActiveCategory(null)
    setActiveLevel(null) // Reset active level
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
      setActiveLevel(null)
    }, 300)
  }

  // Handlers for Category Items
  const handleCategoryEnter = (slug: string) => {
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current); // Keep main menu open too
    setActiveCategory(slug);
    setActiveLevel(null);
  };

  const handleCategoryLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 300); // 300ms delay for category submenu
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (blogMenuRef.current && !blogMenuRef.current.contains(event.target as Node)) {
        setShowBlogMenu(false)
        setActiveCategory(null)
        setActiveLevel(null)
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

  const isTransparentHeader = !isScrolled && pathname === '/';
  const isSolidContext = isScrolled || isMenuOpen || !isTransparentHeader;

  const textColor = isSolidContext ? 'text-gray-800' : 'text-white';
  const hoverColor = isSolidContext ? 'hover:text-orange-500' : 'hover:text-gray-200';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* 1. LEFT: LOGO */}
        <Link href="/" className="font-bold text-2xl bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] z-50 relative">
          JC Trompette
        </Link>

        {/* Mobile Menu Button (Absolute Right on Mobile) */}
        <div className="md:hidden flex justify-end col-start-3">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="" aria-label="Menu principal">
            <svg className={`w-6 h-6 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* 2. CENTER: NAVIGATION LINKS */}
        <ul className={`
                    fixed md:static inset-0 bg-white md:bg-transparent flex-col md:flex-row items-center justify-center gap-6 
                    ${isMenuOpen ? 'flex' : 'hidden md:flex'} 
                    transition-all duration-300 md:ml-auto md:mr-auto
                `}>
          {/* Mobile Close Button */}
          <li className="md:hidden absolute top-6 right-6">
            <button onClick={closeMenu} className="text-gray-800">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </li>

          <li><Link href="/#about" onClick={closeMenu} className={`block px-2 text-lg md:text-base font-medium ${hoverColor} ${isMenuOpen ? 'text-gray-800' : textColor}`}>À propos</Link></li>

          {/* Blog Menu Item */}
          <li
            ref={blogMenuRef}
            className="relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/blog" onClick={closeMenu} className={`block px-2 text-lg md:text-base font-medium ${hoverColor} ${isMenuOpen ? 'text-gray-800' : textColor}`}>Blog</Link>
            {showBlogMenu && (
              <ul
                className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white shadow-lg rounded-xl py-2 z-50 border border-gray-100 hidden md:block"
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }}
                onMouseLeave={handleMouseLeave}
              >
                {menuItems.map((category) => (
                  <li
                    key={category.slug}
                    onMouseEnter={() => handleCategoryEnter(category.slug)}
                    onMouseLeave={handleCategoryLeave}
                    className="relative"
                  >
                    <Link href={`/blog/${category.slug}`} className="block px-4 py-3 hover:bg-orange-50 text-gray-700 font-medium flex justify-between items-center group/item transition-colors">
                      {category.name}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover/item:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    {/* Submenu Logic (kept same structure) */}
                    {activeCategory === category.slug && (
                      <ul className="absolute left-full top-0 w-64 bg-white shadow-lg rounded-xl py-2 min-h-full border border-gray-100 ml-1">
                        {category.slug === 'guide-apprentissage' ? (
                          ['Débutant', 'Intermédiaire', 'Avancé'].map((level) => {
                            const postsForLevel = category.posts.filter(p => normalizeLevel(p.niveau) === level);
                            return (
                              <li key={level} className="relative" onMouseEnter={() => setActiveLevel(level)}>
                                <Link href={`/blog/guide-apprentissage?level=${level}`} className="block px-4 py-2 hover:bg-orange-50 text-gray-700 flex justify-between items-center">
                                  Niveau {level}
                                  {postsForLevel.length > 0 && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                  )}
                                </Link>
                                {activeLevel === level && postsForLevel.length > 0 && (
                                  <ul className="absolute left-full top-0 w-72 bg-white shadow-xl rounded-xl py-2 max-h-[80vh] overflow-y-auto z-50 border border-gray-100 ml-1 p-2 space-y-1">
                                    {postsForLevel.map(post => (
                                      <li key={post.slug}>
                                        <Link href={`/blog/${category.slug}/${post.slug}`} className="block px-3 py-2 hover:bg-orange-50 text-gray-700 text-sm rounded-lg transition-colors">
                                          {post.title}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                          })
                        ) : (
                          category.posts.slice(0, 5).map((post) => (
                            <li key={post.slug}>
                              <Link href={`/blog/${category.slug}/${post.slug}`} className="block px-4 py-2 hover:bg-orange-50 text-gray-700">
                                {post.title}
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li><Link href="/#method" onClick={closeMenu} className={`block px-2 text-lg md:text-base font-medium ${hoverColor} ${isMenuOpen ? 'text-gray-800' : textColor}`}>La méthode JC</Link></li>
          <li><Link href="/#testimonials" onClick={closeMenu} className={`block px-2 text-lg md:text-base font-medium ${hoverColor} ${isMenuOpen ? 'text-gray-800' : textColor}`}>Témoignages</Link></li>
          <li><Link href="/#faq" onClick={closeMenu} className={`block px-2 text-lg md:text-base font-medium ${hoverColor} ${isMenuOpen ? 'text-gray-800' : textColor}`}>FAQ</Link></li>

          {/* Mobile Only Booking Button */}
          <li className="md:hidden mt-8">
            <button
              onClick={() => { closeMenu(); openModal(); }}
              className="bg-orange-500 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-600 transition-colors shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">🎺</span> Réservez Votre Cours
            </button>
          </li>
        </ul>

        {/* 3. RIGHT: CTA BUTTON (Desktop) */}
        <div className="hidden md:block justify-self-end">
          <button
            onClick={openModal}
            className={`
                            group relative px-6 py-2.5 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-3
                            ${isSolidContext ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-white text-orange-600 hover:bg-gray-100'}
                        `}
          >
            <span>Réservez Votre Cours</span>
            <span className="transform group-hover:rotate-12 transition-transform duration-300 text-xl">🎺</span>
          </button>
        </div>
      </div >
    </nav >
  )
}
