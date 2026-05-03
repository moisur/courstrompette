import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { FileText, Landmark, LayoutDashboard, LogOut, Music, UserCog, Users, Wallet } from "lucide-react";

import { logoutAdminAction } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/admin-auth";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/finances", label: "Finances", icon: Wallet },
  { href: "/admin/leads", label: "Prospects", icon: Users },
  { href: "/admin/students", label: "Eleves", icon: UserCog },
  { href: "/admin/urssaf-suivi", label: "URSSAF", icon: Landmark },
  { href: "/admin/urssaf", label: "URSSAF Test", icon: Landmark },
  { href: "/admin/create", label: "Blog", icon: FileText },
];

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession("/admin");

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-stone-200 flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-amber-600 p-2 rounded-xl text-white">
              <Music size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 leading-none">Administration</p>
              <h1 className="text-lg font-black text-stone-900 tracking-tight">JC Trompette</h1>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-stone-500 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 group"
              >
                <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-stone-100">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600">
              {session.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-stone-900 truncate">{session.email}</p>
              <p className="text-[10px] font-bold text-stone-400 uppercase">Administrateur</p>
            </div>
          </div>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-stone-900 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 transition-colors"
            >
              <LogOut size={14} />
              Deconnexion
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-grow overflow-auto bg-[#fafaf9]">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
