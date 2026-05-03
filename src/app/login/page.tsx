import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck, ArrowRight, Lock, Mail, Key } from 'lucide-react';

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
  title: 'Connexion Admin | JC Trompette',
  description: 'Espace sécurisé pour l\'administration de JC Trompette.',
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
  }>;
};

async function loginAction(formData: FormData) {
  'use server';

  const nextPath = normalizeAdminNextPath(String(formData.get('next') ?? '/admin'));
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (await isAdminLoginRateLimited()) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}&error=rate`);
  }

  // authenticateAdmin is now async due to Web Crypto usage
  if (!await authenticateAdmin(email, password)) {
    await registerAdminLoginFailure();
    redirect(`/login?next=${encodeURIComponent(nextPath)}&error=invalid`);
  }

  await clearAdminLoginFailures();
  redirect(nextPath);
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = normalizeAdminNextPath(params?.next);
  const configured = isAdminAuthConfigured();
  const error = params?.error;
  const session = await getAdminSession();

  if (session) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-amber-100/50 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[5%] w-[30%] h-[30%] bg-stone-200/40 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-stone-200 rounded-2xl shadow-sm mb-4">
               <ShieldCheck className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">Espace Admin</h1>
            <p className="text-stone-500 font-medium mt-2">Connectez-vous pour gérer vos élèves</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(28,25,23,0.05)]">
          {!configured && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
              <p className="text-xs font-bold text-rose-800 uppercase tracking-widest mb-1">Configuration Requise</p>
              <p className="text-sm text-rose-700 leading-relaxed">
                Les variables d&apos;environnement admin ne sont pas détectées sur ce serveur.
              </p>
            </div>
          )}

          {error === 'invalid' && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
              <Lock className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-sm font-bold text-rose-800">Identifiants incorrects.</p>
            </div>
          )}

          {error === 'rate' && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
              <p className="text-sm font-bold text-rose-800">Trop de tentatives. Veuillez patienter.</p>
            </div>
          )}

          <form action={loginAction} className="space-y-5">
            <input type="hidden" name="next" value={nextPath} />

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full h-14 bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-4 outline-none focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all font-medium text-stone-900"
                  placeholder="admin@courstrompette.fr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                Mot de Passe
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full h-14 bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-4 outline-none focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all font-medium text-stone-900"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!configured}
              className="group w-full h-14 bg-stone-900 hover:bg-stone-800 text-white rounded-full font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-stone-200 mt-2"
            >
              Se Connecter
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-100 text-center">
             <Link href="/" className="text-sm font-bold text-stone-400 hover:text-amber-600 transition-colors">
                ← Revenir au site public
             </Link>
          </div>
        </div>

        <p className="text-center mt-8 text-stone-400 text-xs font-medium">
          Accès réservé • Protection par Session Sécurisée
        </p>
      </div>
    </main>
  );
}