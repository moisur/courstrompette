import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CoursePack, Lesson } from "@/lib/types";
import { Check, CreditCard, Trash2, X } from "lucide-react";

interface StudentLessonsSectionProps {
  lessons: Lesson[];
  activePacks: CoursePack[];
  onOpenPayWithPack: (lessonId: string) => void;
  onTogglePayment: (lessonId: string, isPaid: boolean) => void;
  onDeleteLesson: (lessonId: string) => void;
}

export function StudentLessonsSection({
  lessons,
  activePacks,
  onOpenPayWithPack,
  onTogglePayment,
  onDeleteLesson,
}: StudentLessonsSectionProps) {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">Historique des cours</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow key={lesson._id}>
                <TableCell>{new Date(lesson.date).toLocaleDateString()}</TableCell>
                <TableCell>{lesson.comment || "-"}</TableCell>
                <TableCell>
                  {lesson.isPaid ? (
                    lesson.packId ? (
                      <span className="text-blue-600 font-medium">Pack</span>
                    ) : (
                      <span className="text-green-600 font-medium">Payé</span>
                    )
                  ) : (
                    <span className="text-red-600 font-medium">Non payé</span>
                  )}
                </TableCell>
                <TableCell className="text-right">{lesson.amount}€</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {!lesson.isPaid && activePacks.length > 0 ? (
                      <Button variant="outline" size="sm" onClick={() => onOpenPayWithPack(lesson._id)}>
                        <CreditCard className="h-4 w-4 text-blue-500" />
                      </Button>
                    ) : null}
                    {lesson.isPaid ? (
                      <Button variant="outline" size="sm" onClick={() => onTogglePayment(lesson._id, false)}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => onTogglePayment(lesson._id, true)}>
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => onDeleteLesson(lesson._id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
