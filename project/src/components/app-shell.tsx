"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideHeader = pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader ? <Header /> : null}
      <main className="flex-1 bg-muted/40">{children}</main>
      <Toaster />
    </div>
  );
}
