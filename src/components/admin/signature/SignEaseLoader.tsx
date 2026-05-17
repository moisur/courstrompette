"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the main tool component with SSR disabled
export const SignEaseTool = dynamic(
  () => import("./SignEaseTool").then((mod) => mod.SignEaseTool),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#fafaf9]">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
          <p className="text-sm font-medium text-stone-500">Initialisation de SignEase...</p>
        </div>
      </div>
    ),
  }
);
