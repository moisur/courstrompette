"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { StudentFormFields } from "@/components/student/student-form-fields";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Student } from "@/lib/types";
import { createStudentFormValues, StudentFormValues } from "@/features/students/form-values";

interface StudentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSubmit: (form: StudentFormValues) => Promise<boolean>;
}

export function StudentEditDialog({ open, onOpenChange, student, onSubmit }: StudentEditDialogProps) {
  const [form, setForm] = useState<StudentFormValues>(createStudentFormValues(student));

  useEffect(() => {
    if (open) {
      setForm(createStudentFormValues(student));
    }
  }, [open, student]);

  const handleChange = (field: keyof StudentFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

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
          <DialogTitle>Modifier les informations de l&apos;élève</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <StudentFormFields form={form} idPrefix="edit-student" onChange={handleChange} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
