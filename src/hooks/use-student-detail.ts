"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, toErrorMessage } from "@/lib/client-api";

export interface Student {
  id: string;
  name: string;
  rate: number;
  declared: boolean;
  archived: boolean;
  phone?: string | null;
  address?: string | null;
  experience?: string | null;
  notes?: string | null;
  courseDay?: string | null;
  courseHour?: string | null;
  email?: string | null;
  lead?: {
    id: string;
    name: string;
    email: string;
    experience: string;
    stage: string;
  } | null;
  hasUrssafClient?: boolean;
  user?: {
    email: string;
    isActive: boolean;
    mustChangePassword: boolean;
  } | null;
  urssafClient?: {
    id: string;
    nomNaissance: string;
    prenoms: string;
    email: string;
    dateNaissance?: string | null;
  } | null;
}

export interface Lesson {
  id: string;
  studentId: string;
  date: string;
  amount: number;
  comment?: string | null;
  isPaid: boolean;
  paymentMethod?: "DIRECT" | "PACK" | "MANUAL" | "URSSAF";
  packId?: string | null;
  urssafPaymentRequest?: {
    id: string;
    numFactureTiers: string;
    idDemandePaiement?: string | null;
    statutCode?: string | null;
    statutLabel?: string | null;
    submittedAt?: string | null;
    lastSyncedAt?: string | null;
  } | null;
}

export interface CoursePack {
  id: string;
  studentId: string;
  totalLessons: number;
  remainingLessons: number;
  purchaseDate: string;
  expiryDate?: string | null;
  price: number;
  createdAt: string;
}

export interface StudentPackFormValues {
  totalLessons: string;
  price: string;
  purchaseDate: string;
  expiryDate: string;
}

export interface StudentUpdateValues {
  name?: string;
  rate?: number | string;
  declared?: boolean;
  archived?: boolean;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  courseDay?: string | null;
  courseHour?: string | null;
}

export function useStudentDetail(studentId: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [packs, setPacks] = useState<CoursePack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStudent = useCallback(async () => {
    if (!studentId) return;
    try {
      const data = await apiRequest<Student>(`/api/admin/students/${studentId}`);
      setStudent(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de charger l'eleve"),
      });
    }
  }, [studentId, toast]);

  const loadLessons = useCallback(async () => {
    if (!studentId) return;
    try {
      const data = await apiRequest<Lesson[]>(`/api/admin/students/${studentId}/lessons`);
      setLessons(data);
    } catch (error) {
      console.error("Error loading lessons", error);
    }
  }, [studentId]);

  const loadPacks = useCallback(async () => {
    if (!studentId) return;
    try {
      const data = await apiRequest<CoursePack[]>(`/api/admin/students/${studentId}/packs`);
      setPacks(data);
    } catch (error) {
      console.error("Error loading packs", error);
    }
  }, [studentId]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([loadStudent(), loadLessons(), loadPacks()]);
    setIsLoading(false);
  }, [loadStudent, loadLessons, loadPacks]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleDeclared = useCallback(async () => {
    if (!student) return;
    try {
      const updated = await apiRequest<Student>(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        body: JSON.stringify({ declared: !student.declared }),
      });
      setStudent(updated);
      router.refresh();
      toast({
        title: "Succes",
        description: `Statut mis a jour : ${updated.declared ? "Declare" : "Non declare"}`,
      });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Erreur de mise a jour"),
      });
      return false;
    }
  }, [router, student, studentId, toast]);

  const createPack = useCallback(async (form: StudentPackFormValues) => {
    try {
      await apiRequest(`/api/admin/students/${studentId}/packs`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      await loadPacks();
      router.refresh();
      toast({ title: "Succes", description: "Pack ajoute" });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Erreur pack"),
      });
      return false;
    }
  }, [loadPacks, router, studentId, toast]);

  const updateStudent = useCallback(async (payload: StudentUpdateValues) => {
    try {
      const updated = await apiRequest<Student>(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setStudent(updated);
      router.refresh();
      toast({ title: "Succes", description: "Fiche eleve mise a jour" });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de mettre a jour l'eleve"),
      });
      return false;
    }
  }, [router, studentId, toast]);

  const deleteStudent = useCallback(async () => {
    try {
      await apiRequest(`/api/admin/students/${studentId}`, {
        method: "DELETE",
      });
      router.refresh();
      toast({ title: "Succes", description: "Eleve supprime" });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de supprimer l'eleve"),
      });
      return false;
    }
  }, [router, studentId, toast]);

  const deletePack = useCallback(async (packId: string) => {
    try {
      await apiRequest(`/api/admin/students/${studentId}/packs/${packId}`, {
        method: "DELETE",
      });
      await refresh();
      router.refresh();
      toast({ title: "Succes", description: "Pack supprime" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de supprimer le pack"),
      });
    }
  }, [refresh, router, studentId, toast]);

  const setLessonPaid = useCallback(async (lessonId: string, isPaid: boolean) => {
    try {
      await apiRequest(`/api/admin/students/${studentId}/update-payments`, {
        method: "POST",
        body: JSON.stringify({ lessonId, isPaid }),
      });
      await refresh();
      router.refresh();
      toast({
        title: "Succes",
        description: isPaid ? "Cours marque comme paye" : "Cours repasse en non paye",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de mettre a jour le paiement"),
      });
    }
  }, [refresh, router, studentId, toast]);

  const deleteLesson = useCallback(async (lessonId: string) => {
    try {
      await apiRequest(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      });
      await refresh();
      router.refresh();
      toast({ title: "Succes", description: "Cours supprime" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de supprimer le cours"),
      });
    }
  }, [refresh, router, toast]);

  const payLessonsWithPack = useCallback(async (packId: string, lessonIds: string[]) => {
    try {
      await apiRequest(`/api/admin/students/${studentId}/update-payments`, {
        method: "POST",
        body: JSON.stringify({ packId, lessonIds }),
      });
      await refresh();
      router.refresh();
      toast({
        title: "Succes",
        description: lessonIds.length > 1 ? `${lessonIds.length} cours payes avec le pack` : "Cours paye avec le pack",
      });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible d'utiliser le pack"),
      });
      return false;
    }
  }, [refresh, router, studentId, toast]);

  const paidLessons = useMemo(() => lessons.filter((lesson) => lesson.isPaid), [lessons]);
  const unpaidLessons = useMemo(() => lessons.filter((lesson) => !lesson.isPaid), [lessons]);
  const activePacks = useMemo(() => packs.filter((pack) => pack.remainingLessons > 0), [packs]);
  const totalPaid = useMemo(
    () => paidLessons.reduce((sum, lesson) => sum + Number(lesson.amount), 0),
    [paidLessons],
  );
  const totalDue = useMemo(
    () => lessons.reduce((sum, lesson) => sum + Number(lesson.amount), 0),
    [lessons],
  );
  const totalRemainingLessons = useMemo(
    () => packs.reduce((sum, pack) => sum + pack.remainingLessons, 0),
    [packs],
  );

  return {
    student,
    lessons,
    packs,
    paidLessons,
    unpaidLessons,
    activePacks,
    totalPaid,
    totalDue,
    totalRemainingLessons,
    isLoading,
    refresh,
    toggleDeclared,
    createPack,
    updateStudent,
    deleteStudent,
    deletePack,
    setLessonPaid,
    deleteLesson,
    payLessonsWithPack,
  };
}
