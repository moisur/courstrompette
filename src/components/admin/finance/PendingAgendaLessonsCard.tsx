"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Check,
  X,
  AlertTriangle,
  Zap,
  RotateCw,
  Clock,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/client-api";

export interface StudentOption {
  id: string;
  name: string;
  rate: number;
  declared: boolean;
  archived?: boolean;
  hasUrssafClient?: boolean;
  courseDay?: string | null;
  courseHour?: string | null;
}

export interface ReconciledCourseItem {
  eventUid: string;
  recurrenceId?: string;
  title: string;
  startDate: string;
  endDate: string;
  dayOfWeek: string;
  timeSlot: string;
  durationMinutes: number;
  matchedStudent: StudentOption | null;
  matchConfidence: string;
  isHomonymWarning: boolean;
  candidateStudents: StudentOption[];
}

interface PendingAgendaLessonsCardProps {
  students: StudentOption[];
  onLessonRecorded: () => void;
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export function PendingAgendaLessonsCard({
  students,
  onLessonRecorded,
}: PendingAgendaLessonsCardProps) {
  const { toast } = useToast();
  const [courses, setCourses] = useState<ReconciledCourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validatingUid, setValidatingUid] = useState<string | null>(null);
  const [selectedStudentOverrides, setSelectedStudentOverrides] = useState<Record<string, string>>({});
  const [startDate, setStartDate] = useState("2026-09-18");

  const loadPendingCourses = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{
        success: boolean;
        courses: ReconciledCourseItem[];
      }>(`/api/admin/finances/agenda-pending?fromDate=${startDate}T00:00:00.000Z`);

      if (data.courses) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error("Error loading pending agenda courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPendingCourses();
  }, [startDate]);

  const handleStudentSelect = (eventUid: string, studentId: string) => {
    setSelectedStudentOverrides((prev) => ({
      ...prev,
      [eventUid]: studentId,
    }));
  };

  const handleValidateCourse = async (course: ReconciledCourseItem) => {
    const studentId =
      selectedStudentOverrides[course.eventUid] || course.matchedStudent?.id;

    if (!studentId) {
      toast({
        variant: "destructive",
        title: "Élève requis",
        description: "Veuillez sélectionner l'élève correspondant avant de valider.",
      });
      return;
    }

    const assignedStudent =
      students.find((s) => s.id === studentId) || course.matchedStudent;

    setValidatingUid(course.eventUid);

    // Optimistically remove from list immediately
    const remainingCourses = courses.filter((c) => c.eventUid !== course.eventUid);
    setCourses(remainingCourses);

    try {
      const result = await apiRequest<{
        success: boolean;
        lesson: { studentName: string; amount: number };
        urssaf: {
          submitted: boolean;
          numFactureTiers?: string;
          statutLabel?: string;
          error?: string;
        };
      }>("/api/admin/finances/agenda-pending", {
        method: "POST",
        body: JSON.stringify({
          eventUid: course.eventUid,
          recurrenceId: course.recurrenceId,
          title: course.title,
          startDate: course.startDate,
          studentId,
          rememberAlias: true,
          rememberUid: true,
        }),
      });

      // Notify parent to update finances dashboard
      onLessonRecorded();

      // Show popup notification
      if (result.urssaf.submitted) {
        toast({
          title: "🎉 Cours enregistré & URSSAF transmis !",
          description: `Cours de ${result.lesson.studentName} (${result.lesson.amount}€) validé. Facture URSSAF : ${result.urssaf.numFactureTiers || "Envoyée"} (${result.urssaf.statutLabel || "Transmise"}).`,
        });
      } else if (result.urssaf.error) {
        toast({
          variant: "destructive",
          title: "Cours enregistré, mais alerte URSSAF",
          description: `Cours de ${result.lesson.studentName} créé en base, mais la transmission URSSAF a échoué : ${result.urssaf.error}`,
        });
      } else {
        toast({
          title: "✅ Cours validé et enregistré",
          description: `Cours de ${result.lesson.studentName} (${result.lesson.amount}€) ajouté à votre compta.`,
        });
      }
    } catch (error: any) {
      // Re-insert course on failure
      setCourses(courses);
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: error?.message || "Impossible d'enregistrer ce cours.",
      });
    } finally {
      setValidatingUid(null);
    }
  };

  const handleIgnoreCourse = async (course: ReconciledCourseItem) => {
    // Optimistically remove from list immediately
    setCourses((prev) => prev.filter((c) => c.eventUid !== course.eventUid));

    try {
      await apiRequest("/api/admin/finances/agenda-pending", {
        method: "DELETE",
        body: JSON.stringify({
          eventUid: course.eventUid,
          recurrenceId: course.recurrenceId,
          title: course.title,
          reason: "Ignoré par l'utilisateur",
        }),
      });
      toast({
        title: "Événement retiré",
        description: `« ${course.title} » ne sera plus proposé dans les cours passés.`,
      });
    } catch (error) {
      // Revert if error
      setCourses(courses);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ignorer cet événement.",
      });
    }
  };

  const handleValidateAll = async () => {
    const readyCourses = courses.filter(
      (c) => selectedStudentOverrides[c.eventUid] || c.matchedStudent?.id,
    );
    if (readyCourses.length === 0) return;

    for (const course of readyCourses) {
      await handleValidateCourse(course);
    }
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-stone-900">
                Cours passés dans votre agenda
              </h3>
              {courses.length > 0 ? (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-0.5 text-xs font-black text-amber-800">
                  {courses.length} à valider
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-black text-emerald-800">
                  À jour
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              Dès qu&apos;un cours est terminé, validez-le en 1 clic pour l&apos;ajouter au CA et envoyer la demande URSSAF.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-600">
            <Clock className="h-3.5 w-3.5 text-stone-400" />
            <span>À partir du :</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-none bg-transparent p-0 text-xs font-semibold text-stone-800 outline-none"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadPendingCourses()}
            disabled={isLoading}
            className="rounded-full border-stone-200"
          >
            <RotateCw className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>

          {courses.length > 1 && (
            <Button
              size="sm"
              onClick={() => void handleValidateAll()}
              className="rounded-full bg-amber-600 font-bold text-white hover:bg-amber-700"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Tout valider ({courses.length})
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5">
        {isLoading && courses.length === 0 ? (
          <div className="py-8 text-center text-sm text-stone-400">
            Vérification de l&apos;agenda Stalwart en cours...
          </div>
        ) : courses.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-4 text-sm text-stone-500">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-stone-800">
                Aucun cours en attente de validation
              </p>
              <p className="text-xs text-stone-500">
                Les cours passés prévus dans votre agenda à partir du {startDate} apparaîtront ici automatiquement dès leur heure terminée.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => {
              const currentStudentId =
                selectedStudentOverrides[course.eventUid] ||
                course.matchedStudent?.id ||
                "";
              const currentStudent =
                students.find((s) => s.id === currentStudentId) ||
                course.matchedStudent;

              const isUrssaf = Boolean(
                currentStudent?.declared && currentStudent?.hasUrssafClient,
              );
              const isValidatingThis = validatingUid === course.eventUid;

              return (
                <div
                  key={course.eventUid + (course.recurrenceId || "")}
                  className={`flex flex-col gap-4 rounded-2xl border p-4 transition-all hover:bg-white md:flex-row md:items-center md:justify-between ${
                    !currentStudentId
                      ? "border-amber-300 bg-amber-50/40 shadow-sm ring-1 ring-amber-200/50"
                      : "border-stone-200 bg-stone-50/60"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-stone-200/80 px-2.5 py-0.5 text-xs font-bold text-stone-800">
                        {dateFormatter.format(new Date(course.startDate))} • {course.timeSlot}
                      </span>
                      <span className="text-xs text-stone-400">
                        Agenda : <strong className="text-stone-700 font-semibold">« {course.title} »</strong>
                      </span>
                      {course.matchConfidence === "AGENDA_NAME" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          ✓ Relié auto
                        </span>
                      )}
                      {isUrssaf && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-black uppercase text-sky-700">
                          <Zap className="h-3 w-3" />
                          Auto URSSAF
                        </span>
                      )}
                    </div>

                    {!currentStudentId && (
                      <div className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-100/70 px-2.5 py-1 text-xs font-bold text-amber-900">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 animate-pulse" />
                        <span>
                          Élève non reconnu : choisissez l&apos;élève dans la liste ci-dessous pour le relier.
                        </span>
                      </div>
                    )}

                    {course.isHomonymWarning && (
                      <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-xs text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <span>
                          Plusieurs élèves correspondent. Vérifiez l&apos;élève sélectionné avant validation.
                        </span>
                      </div>
                    )}

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-stone-500">Élève associé :</span>
                      <select
                        value={currentStudentId}
                        onChange={(e) =>
                          handleStudentSelect(course.eventUid, e.target.value)
                        }
                        className={`h-8 rounded-xl border px-3 text-xs font-bold outline-none transition ${
                          !currentStudentId
                            ? "border-amber-400 bg-white font-black text-amber-950 ring-2 ring-amber-300"
                            : "border-stone-300 bg-white text-stone-900 focus:border-amber-500"
                        }`}
                      >
                        <option value="">-- Choisir un élève --</option>
                        {students
                          .filter((s) => !s.archived)
                          .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.rate}€
                            {s.courseDay && s.courseHour
                              ? ` - ${s.courseDay} ${s.courseHour}`
                              : ""}
                            {s.declared ? " - Déclaré" : ""})
                          </option>
                        ))}
                      </select>

                      {currentStudent && (
                        <span className="text-xs font-black text-amber-700">
                          {currentStudent.rate} €
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => void handleValidateCourse(course)}
                      disabled={!currentStudentId || isValidatingThis}
                      className={`rounded-xl font-bold text-white shadow-sm transition ${
                        !currentStudentId
                          ? "bg-stone-300 cursor-not-allowed text-stone-500"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {isValidatingThis ? (
                        <RotateCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {!currentStudentId
                        ? "Choisir un élève d'abord"
                        : isUrssaf
                        ? "Valider & Déclarer URSSAF"
                        : "Valider le cours"}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void handleIgnoreCourse(course)}
                      className="rounded-xl text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                      title="Annulé ou pas un cours de trompette"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Annulé / Pas un cours
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
