"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDefaultStudentPackForm, StudentPackFormValues } from "@/features/students/use-student-detail";

interface StudentPackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: StudentPackFormValues) => Promise<boolean>;
}

export function StudentPackDialog({ open, onOpenChange, onSubmit }: StudentPackDialogProps) {
  const [form, setForm] = useState<StudentPackFormValues>(createDefaultStudentPackForm());

  useEffect(() => {
    if (open) {
      setForm(createDefaultStudentPackForm());
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await onSubmit(form);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un pack de cours</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pack-total-lessons">Nombre de cours</Label>
            <Input
              id="pack-total-lessons"
              type="number"
              value={form.totalLessons}
              onChange={(event) => setForm((current) => ({ ...current, totalLessons: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pack-price">Prix total du pack (€)</Label>
            <Input
              id="pack-price"
              type="number"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pack-purchase-date">Date d&apos;achat</Label>
            <Input
              id="pack-purchase-date"
              type="date"
              value={form.purchaseDate}
              onChange={(event) => setForm((current) => ({ ...current, purchaseDate: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pack-expiry-date">Date d&apos;expiration (optionnel)</Label>
            <Input
              id="pack-expiry-date"
              type="date"
              value={form.expiryDate}
              onChange={(event) => setForm((current) => ({ ...current, expiryDate: event.target.value }))}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Ajouter</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
