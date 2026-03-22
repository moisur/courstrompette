'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import type { BlogCategory } from '@/app/types/blog';
import { BookingModal } from '@/components/BookingModal';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const Chatbot = dynamic(() => import('@/components/Chatbot'), { ssr: false });

type AppShellProps = {
  children: ReactNode;
  menuItems: BlogCategory[];
};

export default function AppShell({ children, menuItems }: AppShellProps) {
  const pathname = usePathname();
  const hideSiteChrome = pathname?.startsWith('/admin') || pathname?.startsWith('/login');

  if (hideSiteChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header menuItems={menuItems} />
      {children}
      <Footer />
      <BookingModal />
      <Chatbot />
    </>
  );
}