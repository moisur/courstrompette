"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { deleteLeadAction } from "@/app/admin/actions";

interface DeleteLeadButtonProps {
  leadId: string;
}

export function DeleteLeadButton({ leadId }: DeleteLeadButtonProps) {
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (window.confirm("Voulez-vous vraiment supprimer ce lead ? Cette action est irréversible.")) {
      try {
        const formData = new FormData();
        formData.append("leadId", leadId);
        await deleteLeadAction(formData);
      } catch (err) {
        console.error("Failed to delete lead:", err);
        alert("Erreur lors de la suppression du lead.");
      }
    }
  };

  return (
    <form onSubmit={handleDelete} className="w-full">
      <button
        type="submit"
        className="w-full rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 hover:border-rose-300 flex items-center justify-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Supprimer le lead
      </button>
    </form>
  );
}
