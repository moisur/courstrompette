import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CoursePack, Lesson } from "@/hooks/use-student-detail";
import { Check, CreditCard, ReceiptText, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentLessonsSectionProps {
  lessons: Lesson[];
  activePacks: CoursePack[];
  onOpenPayWithPack: (lessonId: string) => void;
  onTogglePayment: (lessonId: string, isPaid: boolean) => void;
  onDeleteLesson: (lessonId: string) => void;
}

function getUrssafLessonStatus(lesson: Lesson) {
  const code = lesson.urssafPaymentRequest?.statutCode ?? "";

  if (!lesson.urssafPaymentRequest) {
    return {
      label: "URSSAF a envoyer",
      className: "bg-sky-100 text-sky-700 border border-sky-200",
    };
  }

  if (["70", "120", "270"].includes(code)) {
    return {
      label: `URSSAF regle${code ? ` (${code})` : ""}`,
      className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    };
  }

  if (["10", "20", "30", "50"].includes(code)) {
    const labels: Record<string, string> = {
      "10": "URSSAF integree",
      "20": "URSSAF en attente",
      "30": "URSSAF validee",
      "50": "URSSAF prelevee",
    };

    return {
      label: `${labels[code] || "URSSAF envoye"} (${code})`,
      className: "bg-amber-100 text-amber-800 border border-amber-200",
    };
  }

  if (code.startsWith("ERR_")) {
    return {
      label: `URSSAF rejetee (${code})`,
      className: "bg-rose-100 text-rose-700 border border-rose-200",
    };
  }

  return {
    label: `URSSAF erreur${code ? ` (${code})` : ""}`,
    className: "bg-rose-100 text-rose-700 border border-rose-200",
  };
}

export function StudentLessonsSection({
  lessons,
  activePacks,
  onOpenPayWithPack,
  onTogglePayment,
  onDeleteLesson,
}: StudentLessonsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-stone-800">
        <ReceiptText size={20} className="text-amber-600" />
        <h2 className="text-xl font-bold">Historique des cours</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-stone-50">
            <TableRow className="border-stone-200 hover:bg-transparent">
              <TableHead className="py-4 text-xs font-bold uppercase text-stone-500">Date</TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase text-stone-500">Commentaire</TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase text-stone-500">Statut</TableHead>
              <TableHead className="py-4 text-right text-xs font-bold uppercase text-stone-500">Montant</TableHead>
              <TableHead className="w-[120px] py-4 text-right text-xs font-bold uppercase text-stone-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-stone-400">
                  Aucun cours enregistre pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              lessons.map((lesson) => {
                const isUrssafLesson = lesson.paymentMethod === "URSSAF";
                const urssafStatus = isUrssafLesson ? getUrssafLessonStatus(lesson) : null;

                return (
                  <TableRow key={lesson.id} className="border-stone-100 transition-colors hover:bg-stone-50/50">
                    <TableCell className="font-medium text-stone-700">
                      {new Date(lesson.date).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-stone-600">
                      {lesson.comment || "-"}
                    </TableCell>
                    <TableCell>
                      {isUrssafLesson && urssafStatus ? (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${urssafStatus.className}`}>
                          {urssafStatus.label}
                        </span>
                      ) : lesson.isPaid ? (
                        lesson.packId ? (
                          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                            Pack
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                            Direct
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                          A payer
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-black text-stone-800">
                      {Number(lesson.amount).toFixed(2)} EUR
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        {!lesson.isPaid && !isUrssafLesson && activePacks.length > 0 ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => onOpenPayWithPack(lesson.id)}
                            title="Payer avec un pack"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        ) : null}

                        {!isUrssafLesson ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8 transition-colors",
                              lesson.isPaid
                                ? "text-stone-400 hover:bg-red-50 hover:text-red-500"
                                : "text-green-500 hover:bg-green-50 hover:text-green-700",
                            )}
                            onClick={() => onTogglePayment(lesson.id, !lesson.isPaid)}
                            title={lesson.isPaid ? "Marquer comme non paye" : "Marquer comme paye"}
                          >
                            {lesson.isPaid ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </Button>
                        ) : null}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-stone-300 hover:bg-red-50 hover:text-red-500"
                          onClick={() => onDeleteLesson(lesson.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
