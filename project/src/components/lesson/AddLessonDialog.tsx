"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, toErrorMessage } from "@/lib/client-api";
import { CoursePack, PaymentStatus, Student } from "@/lib/types";

interface AddLessonDialogProps {
  students: Student[];
  isOpen: boolean;
  onClose: () => void;
  onLessonAdded: () => void | Promise<void>;
  preselectedStudentId?: string;
}

export function AddLessonDialog({
  students,
  isOpen,
  onClose,
  onLessonAdded,
  preselectedStudentId,
}: AddLessonDialogProps) {
  const [loading, setLoading] = useState(false);
  const [packs, setPacks] = useState<Record<string, CoursePack[]>>({});
  const [selectedStudent, setSelectedStudent] = useState("");
  const [lessonType, setLessonType] = useState<"full" | "half">("full");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ isPaid: true });
  const [comment, setComment] = useState("");
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split("T")[0]);
  const { toast } = useToast();

  const fetchStudentPacks = useCallback(async (studentId: string) => {
    if (!studentId) {
      setPacks((current) => ({ ...current, [studentId]: [] }));
      return;
    }

    try {
      const data = await apiRequest<CoursePack[]>(`/api/students/${studentId}/packs`);
      setPacks((current) => ({
        ...current,
        [studentId]: data.filter((pack) => pack.remainingLessons > 0),
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de charger les packs de cours pour cet élève"),
      });
      setPacks((current) => ({ ...current, [studentId]: [] }));
    }
  }, [toast]);

  useEffect(() => {
    fetchStudentPacks(selectedStudent);
  }, [fetchStudentPacks, selectedStudent]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedStudent(preselectedStudentId ?? "");
    setLessonType("full");
    setPaymentStatus({ isPaid: true });
    setComment("");
    setLessonDate(new Date().toISOString().split("T")[0]);
  }, [isOpen, preselectedStudentId]);

  const selectedStudentData = useMemo(
    () => (Array.isArray(students) ? students.find((student) => student._id === selectedStudent) ?? null : null),
    [selectedStudent, students],
  );

  const studentPacks = selectedStudent ? packs[selectedStudent] || [] : [];
  const hasActivePacks = studentPacks.length > 0;

  const paymentRadioValue = () => {
    if (hasActivePacks && paymentStatus.packId && paymentStatus.isPaid) {
      return "pack";
    }
    if (paymentStatus.isPaid) {
      return "paid";
    }
    return "unpaid";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedStudent) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez sélectionner un élève." });
      return;
    }

    setLoading(true);
    const fullRate = selectedStudentData?.rate || 0;
    const amount = lessonType === "full" ? fullRate : fullRate / 2;
    const finalPackId = hasActivePacks && paymentStatus.packId && paymentStatus.isPaid ? paymentStatus.packId : undefined;

    try {
      await apiRequest("/api/lessons", {
        method: "POST",
        body: JSON.stringify({
          studentId: selectedStudent,
          date: new Date(lessonDate).toISOString(),
          amount,
          comment: comment.trim() || undefined,
          isPaid: paymentStatus.isPaid,
          packId: finalPackId,
        }),
      });

      await onLessonAdded();
      onClose();
      toast({ title: "Succès", description: "Cours ajouté avec succès" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible d'ajouter le cours"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau cours</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="lesson-student">Élève</Label>
            <Select
              value={selectedStudent}
              onValueChange={(value) => {
                setSelectedStudent(value);
                setPaymentStatus({ isPaid: true });
              }}
            >
              <SelectTrigger id="lesson-student">
                <SelectValue placeholder="Sélectionner un élève" />
              </SelectTrigger>
              <SelectContent>
                {students
                  .filter((student) => !student.archived)
                  .map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.name} - {student.rate}€
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-date">Date du cours</Label>
            <Input id="lesson-date" type="date" value={lessonDate} onChange={(event) => setLessonDate(event.target.value)} required />
          </div>

          {selectedStudentData ? (
            <div className="space-y-2">
              <Label>Type de cours</Label>
              <RadioGroup value={lessonType} onValueChange={(value) => setLessonType(value as "full" | "half")} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="dialog-full" />
                  <Label htmlFor="dialog-full">Cours complet ({selectedStudentData.rate}€)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="half" id="dialog-half" />
                  <Label htmlFor="dialog-half">Demi-cours ({selectedStudentData.rate / 2}€)</Label>
                </div>
              </RadioGroup>
            </div>
          ) : null}

          {selectedStudent ? (
            <div className="space-y-2">
              <Label>Paiement</Label>
              <RadioGroup
                value={paymentRadioValue()}
                onValueChange={(value) => {
                  if (value === "pack" && hasActivePacks) {
                    setPaymentStatus({ isPaid: true, packId: studentPacks[0]._id });
                    return;
                  }

                  setPaymentStatus({
                    isPaid: value === "paid",
                    packId: undefined,
                  });
                }}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="dialog-paid" />
                  <Label htmlFor="dialog-paid">Payé</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unpaid" id="dialog-unpaid" />
                  <Label htmlFor="dialog-unpaid">Non payé</Label>
                </div>
                {hasActivePacks ? (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pack" id="dialog-pack" />
                    <Label htmlFor="dialog-pack">Utiliser un pack</Label>
                  </div>
                ) : null}
              </RadioGroup>

              {hasActivePacks && paymentStatus.packId && paymentStatus.isPaid ? (
                <div className="mt-2">
                  <Label htmlFor="lesson-pack-select">Sélectionner un pack</Label>
                  <Select value={paymentStatus.packId} onValueChange={(value) => setPaymentStatus({ isPaid: true, packId: value })}>
                    <SelectTrigger id="lesson-pack-select">
                      <SelectValue placeholder="Sélectionner un pack" />
                    </SelectTrigger>
                    <SelectContent>
                      {studentPacks.map((pack) => (
                        <SelectItem key={pack._id} value={pack._id}>
                          Pack de {pack.totalLessons} cours - {pack.remainingLessons} restants
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="lesson-comment">Commentaire (optionnel)</Label>
            <Textarea id="lesson-comment" placeholder="Ajouter un commentaire..." value={comment} onChange={(event) => setComment(event.target.value)} />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !selectedStudent}>
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
