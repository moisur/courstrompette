import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import {
  authenticateAdmin,
  clearAdminLoginFailures,
  getAdminSession,
  isAdminAuthConfigured,
  isAdminLoginRateLimited,
  normalizeAdminNextPath,
  registerAdminLoginFailure,
} from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Connexion admin',
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams?: {
    next?: string;
    error?: string;
  };
};

async function loginAction(formData: FormData) {
  'use server';

  const nextPath = normalizeAdminNextPath(String(formData.get('next') ?? '/admin'));
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (isAdminLoginRateLimited()) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}&error=rate`);
  }

  if (!authenticateAdmin(email, password)) {
    registerAdminLoginFailure();
    redirect(`/login?next=${encodeURIComponent(nextPath)}&error=invalid`);
  }

  clearAdminLoginFailures();
  redirect(nextPath);
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath = normalizeAdminNextPath(searchParams?.next);
  const configured = isAdminAuthConfigured();
  const error = searchParams?.error;
  const session = getAdminSession();

  if (session) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_35%),linear-gradient(180deg,_#fafaf9_0%,_#f5f5f4_100%)] px-4 py-16 text-stone-900">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-center">
        <section className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Admin Courstrompette</p>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              Acces prive au CRM et aux outils de publication.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-stone-600">
              Cette zone donne acces aux leads, aux eleves et a la creation d articles. Elle doit
              rester reservee a ton compte admin.
            </p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-stone-900">Ce que cette protection couvre maintenant</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
              <li>Acces a toutes les pages sous /admin</li>
              <li>Blocage de /api/admin/create-post sans session</li>
              <li>Session httpOnly signee avec cookie securise</li>
              <li>Rate limit sur les tentatives de connexion admin</li>
            </ul>
          </div>
        </section>

        <section className="rounded-[28px] border border-stone-200 bg-white p-8 shadow-[0_24px_80px_rgba(28,25,23,0.10)]">
          <div className="mb-8 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Connexion</p>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Email + mot de passe</h2>
            <p className="text-sm leading-6 text-stone-500">
              Configure ADMIN_EMAIL, ADMIN_PASSWORD et ADMIN_SESSION_SECRET sur le serveur.
            </p>
          </div>

          {!configured ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-7 text-rose-700">
              Les variables d environnement admin ne sont pas configurees. Ajoute-les avant toute
              tentative de connexion.
            </div>
          ) : null}

          {error === 'invalid' ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Identifiants invalides.
            </div>
          ) : null}

          {error === 'rate' ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Trop de tentatives. Attends quelques minutes avant de reessayer.
            </div>
          ) : null}

          <form action={loginAction} className="space-y-5">
            <input type="hidden" name="next" value={nextPath} />

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                Email admin
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                placeholder="admin@courstrompette.fr"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                placeholder="Mot de passe admin"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!configured}
              className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              Ouvrir l admin
            </button>
          </form>

          <div className="mt-6 text-sm text-stone-500">
            <Link href="/" className="font-medium text-amber-700 transition hover:text-amber-600">
              Revenir au site public
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}