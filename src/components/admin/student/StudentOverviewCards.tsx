import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lesson, Student } from "@/hooks/use-student-detail";
import { Info, BarChart3, Wallet, CheckCircle2, Clock } from "lucide-react";

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
  const unpaidAmount = Math.max(totalDue - totalPaid, 0);

  return (
    <div className="grid gap-4 md:grid-cols-5 mb-8">
      {/* Basic Info */}
      <Card className="bg-white border-stone-200 shadow-sm overflow-hidden border-t-4 border-t-amber-500">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-stone-500">Détails</CardTitle>
          <Info className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent className="text-xs space-y-1 text-stone-600">
          <p><span className="font-semibold">📞</span> {student.phone || "-"}</p>
          <p><span className="font-semibold">📅</span> {student.courseDay || "-"} {student.courseHour || ""}</p>
          <p className="line-clamp-1"><span className="font-semibold">📍</span> {student.address || "-"}</p>
        </CardContent>
      </Card>

      {/* Lesson Count */}
      <Card className="bg-white border-stone-200 shadow-sm overflow-hidden border-t-4 border-t-stone-400">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Cours</CardTitle>
          <BarChart3 className="h-4 w-4 text-stone-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-stone-800">{lessons.length}</div>
        </CardContent>
      </Card>

      {/* Unpaid */}
      <Card className="bg-white border-stone-200 shadow-sm overflow-hidden border-t-4 border-t-red-400">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-stone-500">À Régler</CardTitle>
          <Wallet className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-red-600">{unpaidAmount.toFixed(0)}€</div>
          <p className="text-[10px] text-stone-400 font-medium">Accumulé sur {lessons.filter(l => !l.isPaid).length} cours</p>
        </CardContent>
      </Card>

      {/* Paid */}
      <Card className="bg-white border-stone-200 shadow-sm overflow-hidden border-t-4 border-t-green-400">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-stone-500">Réglé</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-green-600">{totalPaid.toFixed(0)}€</div>
        </CardContent>
      </Card>

      {/* Remaining from Packs */}
      <Card className="bg-white border-stone-200 shadow-sm overflow-hidden border-t-4 border-t-blue-400">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-stone-500">Pack Restant</CardTitle>
          <Clock className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black text-blue-600">{totalRemainingLessons}</div>
          <p className="text-[10px] text-stone-400 font-medium">Cours d&apos;avance payés</p>
        </CardContent>
      </Card>
    </div>
  );
}
