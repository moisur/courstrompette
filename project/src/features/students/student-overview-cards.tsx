import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lesson, Student } from "@/lib/types";

interface StudentOverviewCardsProps {
  student: Student;
  lessons: Lesson[];
  totalDue: number;
  totalPaid: number;
  totalRemainingLessons: number;
}

export function StudentOverviewCards({
  student,
  lessons,
  totalDue,
  totalPaid,
  totalRemainingLessons,
}: StudentOverviewCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><strong>Téléphone:</strong> {student.phone || "-"}</p>
          <p><strong>Adresse:</strong> {student.address || "-"}</p>
          <p><strong>Jour de cours:</strong> {student.courseDay || "-"}</p>
          <p><strong>Heure de cours:</strong> {student.courseHour || "-"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Nombre de cours</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{lessons.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total dû</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalDue - totalPaid}€</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total payé</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalPaid}€</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cours restants</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalRemainingLessons}</p>
        </CardContent>
      </Card>
    </div>
  );
}
