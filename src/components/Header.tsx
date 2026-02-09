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
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const { openModal } = useBooking();

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

  // Lock body scroll when mobile menu is open (iOS-compatible fix)
  useEffect(() => {
    if (isMenuOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1)
      }
    }
  }, [isMenuOpen])

  const closeMenu = () => {
    setIsMenuOpen(false)
    setShowBlogMenu(false)
    setActiveCategory(null)
    setActiveLevel(null)
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
    }, 500)
  }

  const handleCategoryEnter = (slug: string) => {
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveCategory(slug);
    setActiveLevel(null);
  };

  const handleCategoryLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 500);
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

  const isTransparentHeader = !isScrolled && (pathname === '/' || pathname === '/paris' || pathname?.startsWith('/paris/'));
  const isSolidContext = isScrolled || isMenuOpen || !isTransparentHeader;

  const textColor = isSolidContext ? 'text-stone-700' : 'text-white';
  const hoverColor = isSolidContext ? 'hover:text-amber-700' : 'hover:text-stone-200';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* 1. LEFT: LOGO */}
        <Link href="/" className={`font-serif font-semibold text-2xl z-50 relative transition-colors ${isSolidContext ? 'text-stone-900' : 'text-white'}`}>
          <span className={isSolidContext ? 'text-amber-700' : 'text-amber-400'}>JC</span> Trompette
        </Link>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex justify-end col-start-3">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="" aria-label="Menu principal">
            <svg className={`w-6 h-6 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* 2. CENTER: NAVIGATION LINKS */}
        <ul className={`
          fixed md:static inset-0 z-[100] bg-white md:bg-transparent flex-col md:flex-row items-center justify-center gap-8 
          ${isMenuOpen ? 'flex' : 'hidden md:flex'} 
          md:transition-all md:duration-300 md:ml-auto md:mr-auto md:z-auto
        `}>
          {/* Mobile Close Button */}
          <li className="md:hidden absolute top-6 right-6">
            <button onClick={closeMenu} className="text-stone-800">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </li>

          <li><Link href="/#about" onClick={closeMenu} className={`block px-2 text-base font-medium ${hoverColor} ${isMenuOpen ? 'text-stone-800' : textColor} transition-colors`}>À propos</Link></li>

          {/* Blog Menu Item */}
          <li
            ref={blogMenuRef}
            className="relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/blog" onClick={closeMenu} className={`block px-2 text-base font-medium ${hoverColor} ${isMenuOpen ? 'text-stone-800' : textColor} transition-colors`}>Blog</Link>
            {showBlogMenu && (
              <ul
                className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white shadow-lg rounded-xl py-2 z-50 border border-stone-100 hidden md:block"
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }}
                onMouseLeave={handleMouseLeave}
              >
                {/* Bridge to prevent gap between Blog link and menu */}
                <div className="absolute -top-3 left-0 right-0 h-3" />

                {menuItems.map((category) => (
                  <li
                    key={category.slug}
                    onMouseEnter={() => handleCategoryEnter(category.slug)}
                    onMouseLeave={handleCategoryLeave}
                    className="relative"
                  >
                    <Link href={`/blog/${category.slug}`} className="block px-4 py-3 hover:bg-amber-50 text-stone-700 font-medium flex justify-between items-center group/item transition-colors">
                      {category.name}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-400 group-hover/item:text-amber-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    {activeCategory === category.slug && (
                      <ul
                        className="absolute left-full top-0 w-64 bg-white shadow-lg rounded-xl py-2 min-h-full border border-stone-100 ml-1"
                        onMouseEnter={() => {
                          if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
                          if (timeoutRef.current) clearTimeout(timeoutRef.current);
                          setActiveCategory(category.slug);
                        }}
                      >
                        {/* 
                          Vertical Safety Bridge: 
                          Wide (-left-8 w-8) and tall (-top-24 -bottom-24) to 'catch' the mouse 
                          when returning from a long third-level list.
                        */}
                        <div className="absolute -top-24 -left-8 w-8 -bottom-24 z-[-1]" />

                        {category.slug === 'guide-apprentissage' ? (
                          ['Débutant', 'Intermédiaire', 'Avancé'].map((level) => {
                            const postsForLevel = category.posts.filter(p => normalizeLevel(p.niveau) === level);
                            return (
                              <li key={level} className="relative" onMouseEnter={() => setActiveLevel(level)}>
                                <Link href={`/blog/guide-apprentissage?level=${level}`} className="block px-4 py-2 hover:bg-amber-50 text-stone-700 flex justify-between items-center">
                                  Niveau {level}
                                  {postsForLevel.length > 0 && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                  )}
                                </Link>
                                {activeLevel === level && postsForLevel.length > 0 && (
                                  <ul
                                    className="absolute left-full top-0 w-72 bg-white shadow-xl rounded-xl py-2 max-h-[80vh] overflow-y-auto z-50 border border-stone-100 ml-1 p-2 space-y-1 custom-scrollbar"
                                    onMouseEnter={() => {
                                      if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
                                      if (timeoutRef.current) clearTimeout(timeoutRef.current);
                                      setActiveLevel(level);
                                      setActiveCategory(category.slug);
                                    }}
                                  >
                                    {/* Vertical Safety Bridge: Catches mouse returning to Level 2 at any height */}
                                    <div className="absolute -top-24 -left-8 w-8 -bottom-24 z-[-1]" />

                                    {postsForLevel.map(post => (
                                      <li key={post.slug}>
                                        <Link href={`/blog/${category.slug}/${post.slug}`} className="block px-3 py-2 hover:bg-amber-50 text-stone-700 text-sm rounded-lg transition-colors">
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
                              <Link href={`/blog/${category.slug}/${post.slug}`} className="block px-4 py-2 hover:bg-amber-50 text-stone-700">
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

          <li><Link href="/#method" onClick={closeMenu} className={`block px-2 text-base font-medium ${hoverColor} ${isMenuOpen ? 'text-stone-800' : textColor} transition-colors`}>La méthode JC</Link></li>
          <li><Link href="/#testimonials" onClick={closeMenu} className={`block px-2 text-base font-medium ${hoverColor} ${isMenuOpen ? 'text-stone-800' : textColor} transition-colors`}>Témoignages</Link></li>
          <li><Link href="/#faq" onClick={closeMenu} className={`block px-2 text-base font-medium ${hoverColor} ${isMenuOpen ? 'text-stone-800' : textColor} transition-colors`}>FAQ</Link></li>

          {/* Mobile Only Booking Button */}
          <li className="md:hidden mt-8">
            <button
              onClick={() => { closeMenu(); openModal(); }}
              className="bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold py-3.5 px-8 rounded-full border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transition-all flex items-center gap-2"
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
              group relative px-6 py-2.5 rounded-full font-bold transition-all duration-300 flex items-center gap-3 border-2 border-stone-900
              ${isSolidContext
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]'
                : 'bg-white text-stone-900 hover:bg-stone-50 shadow-[4px_4px_0px_0px_rgba(251,191,36,1)] hover:shadow-[6px_6px_0px_0px_rgba(251,191,36,1)]'
              }
            `}
          >
            <span>Réservez Votre Cours</span>
            <span className="transform group-hover:rotate-12 transition-transform duration-300 text-xl">🎺</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
