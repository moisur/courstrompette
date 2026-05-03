"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudentPackFormValues } from "@/hooks/use-student-detail";

interface StudentPackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: StudentPackFormValues) => Promise<boolean>;
}

export function createDefaultStudentPackForm(): StudentPackFormValues {
  return {
    totalLessons: "10",
    price: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
  };
}

export function StudentPackDialog({ open, onOpenChange, onSubmit }: StudentPackDialogProps) {
  const [form, setForm] = useState<StudentPackFormValues>(createDefaultStudentPackForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(createDefaultStudentPackForm());
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const success = await onSubmit(form);
    setIsSubmitting(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-stone-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-600">📦</span> Nouveau pack de cours
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pack-total-lessons" className="text-stone-500 font-bold text-xs uppercase">Nb de cours</Label>
              <Input
                id="pack-total-lessons"
                type="number"
                value={form.totalLessons}
                onChange={(event) => setForm((current) => ({ ...current, totalLessons: event.target.value }))}
                required
                className="bg-stone-50 border-stone-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pack-price" className="text-stone-500 font-bold text-xs uppercase">Prix total (€)</Label>
              <Input
                id="pack-price"
                type="number"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                required
                className="bg-stone-50 border-stone-200"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pack-purchase-date" className="text-stone-500 font-bold text-xs uppercase">Date d&apos;achat</Label>
            <Input
              id="pack-purchase-date"
              type="date"
              value={form.purchaseDate}
              onChange={(event) => setForm((current) => ({ ...current, purchaseDate: event.target.value }))}
              required
              className="bg-stone-50 border-stone-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pack-expiry-date" className="text-stone-500 font-bold text-xs uppercase">Expiration (Optionnel)</Label>
            <Input
              id="pack-expiry-date"
              type="date"
              value={form.expiryDate}
              onChange={(event) => setForm((current) => ({ ...current, expiryDate: event.target.value }))}
              className="bg-stone-50 border-stone-200"
            />
          </div>

          <DialogFooter className="mt-8 border-t border-stone-100 pt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-stone-500 font-semibold">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-stone-800 hover:bg-stone-900 text-white font-bold px-8">
              {isSubmitting ? "Ajout..." : "Créer le pack"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
