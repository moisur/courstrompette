"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AddLessonDialog } from "@/components/lesson/AddLessonDialog";
import { apiRequest, toErrorMessage } from "@/lib/client-api";
import { Lesson, Student } from "@/lib/types";

export default function DashboardPage() {
  const [isAddLessonDialogOpen, setIsAddLessonDialogOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const { toast } = useToast();

  const loadStudents = useCallback(async () => {
    try {
      const data = await apiRequest<Student[]>("/api/students");
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch students error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de charger les élèves"),
      });
      setStudents([]);
    }
  }, [toast]);

  const loadLessons = useCallback(async () => {
    try {
      const data = await apiRequest<Lesson[]>("/api/lessons");
      setLessons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch lessons error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de charger les cours"),
      });
      setLessons([]);
    }
  }, [toast]);

  useEffect(() => {
    loadStudents();
    loadLessons();
  }, [loadStudents, loadLessons]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = useMemo(() => {
    return lessons
      .filter((lesson) => {
        const lessonDate = new Date(lesson.date);
        return lessonDate.getMonth() === currentMonth && lessonDate.getFullYear() === currentYear;
      })
      .reduce((sum, lesson) => sum + lesson.amount, 0);
  }, [currentMonth, currentYear, lessons]);

  const quarterlyRevenue = useMemo(() => {
    const quarterStart = currentMonth - (currentMonth % 3);
    return lessons
      .filter((lesson) => {
        const lessonDate = new Date(lesson.date);
        return (
          lessonDate.getMonth() >= quarterStart
          && lessonDate.getMonth() < quarterStart + 3
          && lessonDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, lesson) => sum + lesson.amount, 0);
  }, [currentMonth, currentYear, lessons]);

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <Button onClick={() => setIsAddLessonDialogOpen(true)}>Ajouter un cours</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Élèves actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>CA du mois</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{monthlyRevenue}€</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>CA du trimestre</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{quarterlyRevenue}€</p>
          </CardContent>
        </Card>
      </div>

      <AddLessonDialog
        students={students}
        isOpen={isAddLessonDialogOpen}
        onClose={() => setIsAddLessonDialogOpen(false)}
        onLessonAdded={loadLessons}
      />
    </div>
  );
}
