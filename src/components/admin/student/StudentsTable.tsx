"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Filter, Landmark, Mail, Phone, Search, UserCircle2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StudentDetailsDialog } from "./StudentDetailsDialog";
import { NewStudentDialog } from "./NewStudentDialog";
import { NewUrssafStudentDialog } from "./NewUrssafStudentDialog";
import { apiRequest, toErrorMessage } from "@/lib/client-api";
import { useToast } from "@/hooks/use-toast";

export interface StudentRecord {
  id: string;
  createdAt: string;
  name: string;
  rate: number;
  phone: string | null;
  email: string | null;
  experience: string | null;
  notes: string | null;
  archived: boolean;
  declared: boolean;
  hasUrssafClient: boolean;
  lead: {
    id: string;
    name: string;
    email: string;
    experience: string;
    stage: string;
  } | null;
  user: {
    email: string | null;
    isActive: boolean;
    mustChangePassword: boolean;
  } | null;
}

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Debutant total",
  intermediate: "Intermediaire",
  advanced: "Avance",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

interface StudentsTableProps {
  initialStudents: StudentRecord[];
}

export function StudentsTable({ initialStudents }: StudentsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState(initialStudents);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);
  const [isNewUrssafStudentOpen, setIsNewUrssafStudentOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [journeyFilter, setJourneyFilter] = useState<"all" | "declared" | "urssaf" | "lead" | "manual">("all");

  async function refreshStudents() {
    try {
      const data = await apiRequest<StudentRecord[]>("/api/admin/students");
      setStudents(Array.isArray(data) ? data : []);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de recharger les eleves"),
      });
    }
  }

  const filteredStudents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return students
      .filter((student) => student.archived === showArchived)
      .filter((student) => {
        if (!searchValue) {
          return true;
        }

        const haystack = [
          student.name,
          student.email,
          student.phone,
          student.lead?.name,
          student.lead?.email,
          student.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchValue);
      })
      .filter((student) => {
        if (journeyFilter === "declared") {
          return student.declared;
        }
        if (journeyFilter === "urssaf") {
          return student.hasUrssafClient;
        }
        if (journeyFilter === "lead") {
          return Boolean(student.lead);
        }
        if (journeyFilter === "manual") {
          return !student.lead;
        }
        return true;
      });
  }, [journeyFilter, search, showArchived, students]);

  const activeCount = students.filter((student) => !student.archived).length;
  const archivedCount = students.filter((student) => student.archived).length;
  const leadLinkedCount = students.filter((student) => Boolean(student.lead)).length;

  return (
    <>
      <div className="space-y-5 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative min-w-[280px] flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher par nom, email, telephone ou note"
                className="h-12 rounded-full border-stone-200 bg-stone-50 pl-11"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={showArchived ? "outline" : "default"}
                onClick={() => setShowArchived(false)}
                className={showArchived ? "rounded-full border-stone-200" : "rounded-full bg-stone-900 hover:bg-stone-800"}
              >
                Actifs ({activeCount})
              </Button>
              <Button
                variant={showArchived ? "default" : "outline"}
                onClick={() => setShowArchived(true)}
                className={showArchived ? "rounded-full bg-stone-900 hover:bg-stone-800" : "rounded-full border-stone-200"}
              >
                Archives ({archivedCount})
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild className="rounded-full border-stone-200">
              <Link href="/admin/leads">
                <Users className="mr-2 h-4 w-4" />
                Leads ({leadLinkedCount})
              </Link>
            </Button>
            <Button onClick={() => setIsNewStudentOpen(true)} className="rounded-full bg-amber-600 hover:bg-amber-700">
              Nouvel eleve
            </Button>
            <Button onClick={() => setIsNewUrssafStudentOpen(true)} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
              <Landmark className="mr-2 h-4 w-4" />
              Nouvel eleve URSSAF
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 pr-2 text-xs font-black uppercase tracking-[0.24em] text-stone-400">
            <Filter className="h-3.5 w-3.5" />
            Parcours
          </div>

          {[
            { id: "all", label: "Tous" },
            { id: "lead", label: "Depuis CRM" },
            { id: "manual", label: "Ajouts manuels" },
            { id: "declared", label: "Declares" },
            { id: "urssaf", label: "URSSAF" },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setJourneyFilter(filter.id as typeof journeyFilter)}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                journeyFilter === filter.id
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-stone-50 text-stone-500 hover:border-amber-300 hover:text-amber-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-stone-200">
          <Table>
            <TableHeader>
              <TableRow className="border-stone-100 bg-stone-50 hover:bg-stone-50">
                <TableHead className="py-4 text-xs font-black uppercase tracking-[0.24em] text-stone-500">Eleve</TableHead>
                <TableHead className="py-4 text-xs font-black uppercase tracking-[0.24em] text-stone-500">Contact</TableHead>
                <TableHead className="py-4 text-xs font-black uppercase tracking-[0.24em] text-stone-500">Source CRM</TableHead>
                <TableHead className="py-4 text-xs font-black uppercase tracking-[0.24em] text-stone-500">Parcours</TableHead>
                <TableHead className="py-4 text-xs font-black uppercase tracking-[0.24em] text-stone-500">Inscription</TableHead>
                <TableHead className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.24em] text-stone-500">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <UserCircle2 className="h-12 w-12 text-stone-200" />
                      <p className="font-medium text-stone-400">Aucun eleve ne correspond a ce filtre.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    className="group cursor-pointer border-stone-100 transition-colors hover:bg-stone-50/80"
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setIsDialogOpen(true);
                    }}
                  >
                    <TableCell className="min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-stone-500 transition-colors group-hover:border-amber-200 group-hover:bg-amber-100 group-hover:text-amber-700">
                          <UserCircle2 size={20} />
                        </div>
                        <div>
                          <p className="font-black text-stone-900 group-hover:text-amber-700">{student.name}</p>
                          <p className="text-xs text-stone-500">
                            {student.experience ? EXPERIENCE_LABELS[student.experience] || student.experience : "Niveau a confirmer"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="min-w-[220px]">
                      <div className="space-y-1 text-xs text-stone-500">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-stone-300" />
                          <span>{student.email || "Pas d'email"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-stone-300" />
                          <span>{student.phone || "Pas de telephone"}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="min-w-[180px]">
                      {student.lead ? (
                        <div className="space-y-2">
                          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                            Lead converti
                          </span>
                          <p className="text-xs text-stone-500">{student.lead.email}</p>
                        </div>
                      ) : (
                        <span className="inline-flex rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-stone-500">
                          Creation manuelle
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="min-w-[220px]">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                            student.archived
                              ? "border-stone-200 bg-stone-100 text-stone-500"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {student.archived ? "Archive" : "Actif"}
                        </span>
                        {student.declared ? (
                          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                            Declare
                          </span>
                        ) : null}
                        {student.hasUrssafClient ? (
                          <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
                            <Landmark className="mr-1 h-3 w-3" />
                            URSSAF
                          </span>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="min-w-[180px] text-xs font-bold uppercase tracking-tight text-stone-400">
                      {dateFormatter.format(new Date(student.createdAt))}
                    </TableCell>

                    <TableCell className="px-6 text-right">
                      <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg shadow-amber-200">
                          <ExternalLink size={14} />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <StudentDetailsDialog
        studentId={selectedStudentId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onRefresh={() => void refreshStudents()}
      />

      <NewStudentDialog
        open={isNewStudentOpen}
        onOpenChange={setIsNewStudentOpen}
        onCreated={() => refreshStudents()}
      />

      <NewUrssafStudentDialog
        open={isNewUrssafStudentOpen}
        onOpenChange={setIsNewUrssafStudentOpen}
        onCreated={() => refreshStudents()}
      />
    </>
  );
}
