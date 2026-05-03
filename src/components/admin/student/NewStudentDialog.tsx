"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, toErrorMessage } from "@/lib/client-api";

type CreateStudentResponse = {
  student: {
    id: string;
    name: string;
  };
  temporaryPassword: string | null;
  linkedLead: {
    id: string;
    name: string;
  } | null;
};

interface NewStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void | Promise<void>;
}

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  rate: "40",
  declared: false,
  courseDay: "",
  courseHour: "",
  notes: "",
  createLogin: false,
};

export function NewStudentDialog({ open, onOpenChange, onCreated }: NewStudentDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
    }
  }, [open]);

  const updateField = (field: keyof typeof INITIAL_FORM, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await apiRequest<CreateStudentResponse>("/api/admin/students", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          rate: Number(form.rate.replace(",", ".")),
          declared: form.declared,
          courseDay: form.courseDay.trim() || null,
          courseHour: form.courseHour.trim() || null,
          notes: form.notes.trim() || null,
          createLogin: form.createLogin,
        }),
      });

      await onCreated();
      onOpenChange(false);

      if (result.temporaryPassword) {
        toast({
          title: "Eleve cree avec acces",
          description: `Mot de passe temporaire: ${result.temporaryPassword}`,
        });
      } else if (result.linkedLead) {
        toast({
          title: "Eleve cree et relie au CRM",
          description: `Lead relie automatiquement: ${result.linkedLead.name}`,
        });
      } else {
        toast({
          title: "Eleve cree",
          description: "La fiche eleve est disponible dans le CRM.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de creer l'eleve"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-stone-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-stone-900">Nouvel eleve</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Nom</span>
              <Input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="rounded-2xl border-stone-200 bg-stone-50"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Telephone</span>
              <Input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="rounded-2xl border-stone-200 bg-stone-50"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Email</span>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="rounded-2xl border-stone-200 bg-stone-50"
                placeholder="Utile pour relier un lead ou creer un acces eleve"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Adresse</span>
              <Input
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                className="rounded-2xl border-stone-200 bg-stone-50"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Tarif</span>
              <Input
                value={form.rate}
                onChange={(event) => updateField("rate", event.target.value)}
                className="rounded-2xl border-stone-200 bg-stone-50"
                inputMode="decimal"
                required
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Statut</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">
                  {form.declared ? "Eleve deja declare" : "Eleve non declare"}
                </p>
              </div>
              <Checkbox
                checked={form.declared}
                onCheckedChange={(checked) => updateField("declared", checked === true)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Jour du cours</span>
              <Input
                value={form.courseDay}
                onChange={(event) => updateField("courseDay", event.target.value)}
                className="rounded-2xl border-stone-200 bg-stone-50"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Heure</span>
              <Input
                value={form.courseHour}
                onChange={(event) => updateField("courseHour", event.target.value)}
                className="rounded-2xl border-stone-200 bg-stone-50"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Notes CRM</span>
            <Textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              className="min-h-[110px] rounded-2xl border-stone-200 bg-stone-50"
              placeholder="Si vide, un lead correspondant pourra injecter son message automatiquement."
            />
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
            <input
              type="checkbox"
              checked={form.createLogin}
              onChange={(event) => updateField("createLogin", event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <p className="text-sm font-black text-stone-900">Creer aussi un acces eleve</p>
              <p className="text-xs text-stone-500">
                Si coche et qu&apos;un email est present, un mot de passe temporaire sera genere.
              </p>
            </div>
          </label>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full border-stone-200">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-full bg-stone-900 hover:bg-stone-800">
              {isSubmitting ? "Creation..." : "Creer l'eleve"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
