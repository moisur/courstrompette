"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";
import { AddLessonDialog } from "@/components/lesson/AddLessonDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, toErrorMessage } from "@/lib/client-api";
import { Lesson, Student } from "@/lib/types";

interface LessonWithStudent extends Lesson {
  student: Student;
}

function buildMonthOptions() {
  return Array.from({ length: 12 }, (_, index) => ({
    value: index,
    label: new Date(0, index).toLocaleString("fr-FR", { month: "long" }),
  }));
}

const months = buildMonthOptions();

export default function FinancesPage() {
  const [lessons, setLessons] = useState<LessonWithStudent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [openNewLessonDialog, setOpenNewLessonDialog] = useState(false);
  const { toast } = useToast();

  const loadLessons = useCallback(async () => {
    try {
      const data = await apiRequest<LessonWithStudent[]>("/api/lessons");
      setLessons(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de charger les cours"),
      });
      setLessons([]);
    }
  }, [toast]);

  const loadStudents = useCallback(async () => {
    try {
      const data = await apiRequest<Student[]>("/api/students");
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch students", error);
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    loadLessons();
    loadStudents();
  }, [loadLessons, loadStudents]);

  const availableYears = useMemo(() => {
    const years = new Set<number>([new Date().getFullYear()]);
    lessons.forEach((lesson) => years.add(new Date(lesson.date).getFullYear()));
    return Array.from(years).sort((left, right) => right - left);
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    const currentDate = new Date();
    const referenceMonth = selectedMonth ?? currentDate.getMonth();
    let startMonth = referenceMonth;
    let endMonth = referenceMonth;

    if (period === "quarter") {
      startMonth = referenceMonth - (referenceMonth % 3);
      endMonth = startMonth + 2;
    }

    if (period === "year") {
      startMonth = 0;
      endMonth = 11;
    }

    return lessons.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return (
        lessonDate.getFullYear() === selectedYear
        && lessonDate.getMonth() >= startMonth
        && lessonDate.getMonth() <= endMonth
      );
    });
  }, [lessons, period, selectedMonth, selectedYear]);

  const totalRevenue = useMemo(() => filteredLessons.reduce((sum, lesson) => sum + lesson.amount, 0), [filteredLessons]);
  const declaredRevenue = useMemo(() => filteredLessons.reduce((sum, lesson) => sum + (lesson.student.declared ? lesson.amount : 0), 0), [filteredLessons]);
  const taxableRevenue = useMemo(() => declaredRevenue * 0.75, [declaredRevenue]);
  const totalLessons = filteredLessons.length;

  const lessonsAndStudentsByPrice = useMemo(() => {
    return filteredLessons.reduce<Record<number, { lessons: number; students: Set<string> }>>((accumulator, lesson) => {
      if (!accumulator[lesson.amount]) {
        accumulator[lesson.amount] = { lessons: 0, students: new Set<string>() };
      }

      accumulator[lesson.amount].lessons += 1;
      if (lesson.student._id) {
        accumulator[lesson.amount].students.add(lesson.student._id);
      }

      return accumulator;
    }, {});
  }, [filteredLessons]);

  const novaLessons = useMemo(() => filteredLessons.filter((lesson) => lesson.amount === 60), [filteredLessons]);
  const novaRevenue = useMemo(() => novaLessons.reduce((sum, lesson) => sum + lesson.amount, 0), [novaLessons]);
  const totalNonTaxedLessons = useMemo(() => filteredLessons.reduce((sum, lesson) => sum + (!lesson.student.declared ? lesson.amount : 0), 0), [filteredLessons]);
  const totalTotal = taxableRevenue + totalNonTaxedLessons;

  return (
    <div className="container py-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-4">
            <Button variant={period === "month" ? "default" : "ghost"} onClick={() => setPeriod("month")}>
              Mois
            </Button>
            <Button variant={period === "quarter" ? "default" : "ghost"} onClick={() => setPeriod("quarter")}>
              Trimestre
            </Button>
            <Button variant={period === "year" ? "default" : "ghost"} onClick={() => setPeriod("year")}>
              Année
            </Button>
            <Button onClick={() => setOpenNewLessonDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau cours
            </Button>
          </div>
          <div className="flex space-x-2">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value, 10))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedMonth?.toString() ?? "null"}
              onValueChange={(value) => setSelectedMonth(value === "null" ? null : Number.parseInt(value, 10))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner un mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Tous les mois</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>CA Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalRevenue}€</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>CA Déclaré</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{declaredRevenue}€</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>CA Imposable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{taxableRevenue.toFixed(2)}€</p>
              <p className="text-sm text-muted-foreground">Après abattement 25%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalTotal.toFixed(2)}€</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Nombre de cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalLessons}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>CA Cash</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalNonTaxedLessons}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>CA NOVA à déclarer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{novaRevenue}€</p>
              <p className="text-sm text-muted-foreground">{novaLessons.length} cours à 60€</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Cours / Élèves par prix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(lessonsAndStudentsByPrice).map(([price, data]) => (
                  <div key={price} className="flex flex-col items-center p-2 border rounded-md text-center">
                    <span className="font-semibold">{price}€:</span>
                    <span className="text-sm">{data.lessons} cours</span>
                    <span className="text-sm text-muted-foreground">{data.students.size} élève(s)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DATE</TableHead>
              <TableHead>ÉLÈVE</TableHead>
              <TableHead>DÉCLARÉ</TableHead>
              <TableHead className="text-right">MONTANT</TableHead>
              <TableHead className="text-right">MONTANT IMPOSABLE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLessons.map((lesson) => (
              <TableRow key={lesson._id}>
                <TableCell>{format(new Date(lesson.date), "PPP", { locale: fr })}</TableCell>
                <TableCell>{lesson.student.name}</TableCell>
                <TableCell>
                  {lesson.student.declared ? <span className="text-green-600">Oui</span> : <span className="text-red-600">Non</span>}
                </TableCell>
                <TableCell className="text-right">{lesson.amount}€</TableCell>
                <TableCell className="text-right">
                  {lesson.student.declared ? `${(lesson.amount * 0.75).toFixed(2)}€` : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddLessonDialog
        isOpen={openNewLessonDialog}
        onClose={() => setOpenNewLessonDialog(false)}
        students={students}
        onLessonAdded={loadLessons}
      />
    </div>
  );
}
