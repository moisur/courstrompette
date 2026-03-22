import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { logoutAdminAction } from '@/app/admin/actions';
import { requireAdminSession } from '@/lib/admin-auth';

const navigation = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/students', label: 'Eleves' },
  { href: '/admin/create', label: 'Articles' },
];

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const session = requireAdminSession('/admin');

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Courstrompette</p>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Admin</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 font-medium text-stone-700">
                {session.email}
              </span>
              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="rounded-full border border-stone-300 px-4 py-2 font-semibold text-stone-700 transition hover:border-amber-300 hover:text-amber-700"
                >
                  Se deconnecter
                </button>
              </form>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2 lg:justify-end">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-amber-300 hover:text-amber-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}