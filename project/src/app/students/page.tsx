"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentFormFields } from "@/components/student/student-form-fields";
import { AddLessonDialog } from "@/components/lesson/AddLessonDialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, toErrorMessage } from "@/lib/client-api";
import { Student } from "@/lib/types";
import { ArchiveIcon, Trash2, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_STUDENT_FORM_VALUES, StudentFormValues } from "@/features/students/form-values";

export default function StudentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [openNewStudentDialog, setOpenNewStudentDialog] = useState(false);
  const [openNewLessonDialog, setOpenNewLessonDialog] = useState(false);
  const [loadingNewStudent, setLoadingNewStudent] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentForm, setNewStudentForm] = useState<StudentFormValues>(DEFAULT_STUDENT_FORM_VALUES);

  const updateNewStudentForm = useCallback((field: keyof StudentFormValues, value: string) => {
    setNewStudentForm((current) => ({ ...current, [field]: value }));
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      const data = await apiRequest<Student[]>("/api/students");
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de charger les élèves"),
      });
      setStudents([]);
    }
  }, [toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const resetNewStudentForm = () => {
    setNewStudentForm(DEFAULT_STUDENT_FORM_VALUES);
  };

  const handleNewStudentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoadingNewStudent(true);

    try {
      await apiRequest<Student>("/api/students", {
        method: "POST",
        body: JSON.stringify(newStudentForm),
      });

      await loadStudents();
      setOpenNewStudentDialog(false);
      resetNewStudentForm();
      toast({
        title: "Succès",
        description: "Élève ajouté avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible d'ajouter l'élève"),
      });
    } finally {
      setLoadingNewStudent(false);
    }
  };

  const mutateStudent = async (
    event: React.MouseEvent,
    id: string,
    init: RequestInit,
    successMessage: string,
    errorFallback: string,
  ) => {
    event.stopPropagation();

    try {
      await apiRequest(`/api/students/${id}`, init);
      await loadStudents();
      toast({ title: "Succès", description: successMessage });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, errorFallback),
      });
    }
  };

  const studentsToDisplay = showArchived
    ? students.filter((student) => student.archived)
    : students.filter((student) => !student.archived);

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {showArchived ? "Élèves archivés" : "Élèves"}{" "}
          <span className="text-2xl font-semibold text-gray-500">({studentsToDisplay.length})</span>
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowArchived((current) => !current)}>
            {showArchived ? "Voir les actifs" : "Voir les archivés"}
          </Button>
          <Button onClick={() => setOpenNewStudentDialog(true)}>Nouvel élève</Button>
          <Button onClick={() => setOpenNewLessonDialog(true)}>Nouveau cours</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Tarif</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date d&apos;ajout</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentsToDisplay.map((student) => (
            <TableRow
              key={student._id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/students/${student._id}`)}
            >
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.rate}€</TableCell>
              <TableCell>
                {student.declared ? (
                  <span className="text-green-600">Déclaré</span>
                ) : (
                  <span className="text-red-600">Non déclaré</span>
                )}
              </TableCell>
              <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right space-x-1">
                {showArchived ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Désarchiver"
                    onClick={(event) =>
                      mutateStudent(
                        event,
                        student._id,
                        {
                          method: "PATCH",
                          body: JSON.stringify({ archived: false }),
                        },
                        "Élève désarchivé avec succès",
                        "Impossible de désarchiver l'élève",
                      )
                    }
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Archiver"
                    onClick={(event) =>
                      mutateStudent(
                        event,
                        student._id,
                        {
                          method: "PATCH",
                          body: JSON.stringify({ archived: true }),
                        },
                        "Élève archivé avec succès",
                        "Impossible d'archiver l'élève",
                      )
                    }
                  >
                    <ArchiveIcon className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  title="Supprimer"
                  onClick={(event) =>
                    mutateStudent(
                      event,
                      student._id,
                      { method: "DELETE" },
                      "Élève supprimé avec succès",
                      "Impossible de supprimer l'élève",
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={openNewStudentDialog}
        onOpenChange={(open) => {
          setOpenNewStudentDialog(open);
          if (!open) {
            resetNewStudentForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel élève</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNewStudentSubmit} className="space-y-6">
            <StudentFormFields form={newStudentForm} idPrefix="new-student" onChange={updateNewStudentForm} />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpenNewStudentDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loadingNewStudent}>
                {loadingNewStudent ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AddLessonDialog
        isOpen={openNewLessonDialog}
        onClose={() => setOpenNewLessonDialog(false)}
        students={students}
        onLessonAdded={() => undefined}
      />
    </div>
  );
}
