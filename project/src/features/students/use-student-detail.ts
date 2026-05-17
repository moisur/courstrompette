"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, toErrorMessage } from "@/lib/client-api";
import { CoursePack, Lesson, Student } from "@/lib/types";
import { StudentFormValues } from "@/features/students/form-values";

export interface StudentPackFormValues {
  totalLessons: string;
  price: string;
  purchaseDate: string;
  expiryDate: string;
}

export function createDefaultStudentPackForm(): StudentPackFormValues {
  return {
    totalLessons: "10",
    price: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
  };
}

export function useStudentDetail(studentId: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [packs, setPacks] = useState<CoursePack[]>([]);

  const loadStudent = useCallback(async () => {
    if (!studentId) {
      return;
    }

    try {
      const data = await apiRequest<Student>(`/api/students/${studentId}`);
      setStudent(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de charger les informations de l'élève"),
      });
      router.push("/students");
    }
  }, [router, studentId, toast]);

  const loadLessons = useCallback(async () => {
    if (!studentId) {
      return;
    }

    try {
      const data = await apiRequest<Lesson[]>(`/api/students/${studentId}/lessons`);
      setLessons(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de charger les cours de l'élève"),
      });
      setLessons([]);
    }
  }, [studentId, toast]);

  const loadPacks = useCallback(async () => {
    if (!studentId) {
      return;
    }

    try {
      const data = await apiRequest<CoursePack[]>(`/api/students/${studentId}/packs`);
      setPacks(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de charger les packs de cours"),
      });
      setPacks([]);
    }
  }, [studentId, toast]);

  const loadAllStudents = useCallback(async () => {
    try {
      const data = await apiRequest<Student[]>("/api/students");
      setAllStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de charger la liste complète des élèves pour le formulaire."),
      });
      setAllStudents([]);
    }
  }, [toast]);

  const refreshLessonsAndPacks = useCallback(async () => {
    await Promise.all([loadLessons(), loadPacks()]);
  }, [loadLessons, loadPacks]);

  useEffect(() => {
    if (!studentId) {
      return;
    }

    Promise.all([loadStudent(), loadLessons(), loadPacks(), loadAllStudents()]);
  }, [loadAllStudents, loadLessons, loadPacks, loadStudent, studentId]);

  const updateStudent = useCallback(async (form: StudentFormValues) => {
    if (!studentId) {
      return false;
    }

    try {
      const updatedStudent = await apiRequest<Student>(`/api/students/${studentId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          rate: Number.parseFloat(form.rate.replace(",", ".")),
        }),
      });

      setStudent(updatedStudent);
      toast({
        title: "Succès",
        description: "Informations de l'élève mises à jour",
      });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de mettre à jour les informations de l'élève"),
      });
      return false;
    }
  }, [studentId, toast]);

  const toggleDeclared = useCallback(async () => {
    if (!student || !studentId) {
      return;
    }

    try {
      const updatedStudent = await apiRequest<Student>(`/api/students/${studentId}`, {
        method: "PATCH",
        body: JSON.stringify({ declared: !student.declared }),
      });

      setStudent(updatedStudent);
      toast({
        title: "Succès",
        description: `Élève ${updatedStudent.declared ? "déclaré" : "non déclaré"}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de mettre à jour le statut de déclaration"),
      });
    }
  }, [student, studentId, toast]);

  const createPack = useCallback(async (form: StudentPackFormValues) => {
    if (!studentId) {
      return false;
    }

    try {
      await apiRequest<CoursePack>(`/api/students/${studentId}/packs`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      await loadPacks();
      toast({ title: "Succès", description: "Pack de cours ajouté avec succès" });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible d'ajouter le pack de cours"),
      });
      return false;
    }
  }, [loadPacks, studentId, toast]);

  const deletePack = useCallback(async (packId: string) => {
    if (!studentId) {
      return;
    }

    try {
      const result = await apiRequest<{ success: boolean; unpaidLessons: number }>(`/api/students/${studentId}/packs/${packId}`, {
        method: "DELETE",
      });
      await refreshLessonsAndPacks();
      toast({
        title: "Succès",
        description: result.unpaidLessons > 0
          ? `Pack supprimé et ${result.unpaidLessons} cours marqués comme non payés`
          : "Pack supprimé avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de supprimer le pack"),
      });
    }
  }, [refreshLessonsAndPacks, studentId, toast]);

  const setLessonPaid = useCallback(async (lessonId: string, isPaid: boolean) => {
    if (!studentId) {
      return;
    }

    try {
      await apiRequest(`/api/students/${studentId}/update-payments`, {
        method: "POST",
        body: JSON.stringify({ lessonId, isPaid }),
      });
      await refreshLessonsAndPacks();
      toast({ title: "Succès", description: `Cours marqué comme ${isPaid ? "payé" : "non payé"}` });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de mettre à jour le statut de paiement"),
      });
    }
  }, [refreshLessonsAndPacks, studentId, toast]);

  const deleteLesson = useCallback(async (lessonId: string) => {
    try {
      await apiRequest(`/api/lessons/${lessonId}`, { method: "DELETE" });
      await refreshLessonsAndPacks();
      toast({ title: "Succès", description: "Cours supprimé avec succès" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de supprimer le cours"),
      });
    }
  }, [refreshLessonsAndPacks, toast]);

  const payLessonsWithPack = useCallback(async (packId: string, lessonIds: string[]) => {
    if (!studentId) {
      return false;
    }

    try {
      await apiRequest(`/api/students/${studentId}/update-payments`, {
        method: "POST",
        body: JSON.stringify({ packId, lessonIds }),
      });
      await refreshLessonsAndPacks();
      toast({
        title: "Succès",
        description: lessonIds.length === 1 ? "Cours payé avec le pack" : `${lessonIds.length} cours payés avec le pack`,
      });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de mettre à jour les paiements"),
      });
      return false;
    }
  }, [refreshLessonsAndPacks, studentId, toast]);

  const paidLessons = useMemo(() => lessons.filter((lesson) => lesson.isPaid), [lessons]);
  const unpaidLessons = useMemo(() => lessons.filter((lesson) => !lesson.isPaid), [lessons]);
  const activePacks = useMemo(() => packs.filter((pack) => pack.remainingLessons > 0), [packs]);
  const totalPaid = useMemo(() => paidLessons.reduce((sum, lesson) => sum + lesson.amount, 0), [paidLessons]);
  const totalDue = useMemo(() => lessons.reduce((sum, lesson) => sum + lesson.amount, 0), [lessons]);
  const totalRemainingLessons = useMemo(() => activePacks.reduce((sum, pack) => sum + pack.remainingLessons, 0), [activePacks]);

  return {
    student,
    allStudents,
    lessons,
    packs,
    activePacks,
    unpaidLessons,
    totalPaid,
    totalDue,
    totalRemainingLessons,
    refreshLessonsAndPacks,
    updateStudent,
    toggleDeclared,
    createPack,
    deletePack,
    setLessonPaid,
    deleteLesson,
    payLessonsWithPack,
  };
}
