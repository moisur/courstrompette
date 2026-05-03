"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { AddLessonDialog } from "@/components/admin/lesson/AddLessonDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FinanceStudent {
  id: string;
  name: string;
  rate: number;
  declared: boolean;
  archived: boolean;
}

interface FinanceLesson {
  id: string;
  date: string;
  amount: number;
  isPaid: boolean;
  comment: string | null;
  student: FinanceStudent;
}

interface AdminFinanceDashboardProps {
  initialLessons: FinanceLesson[];
  initialStudents: FinanceStudent[];
}

function buildMonthOptions() {
  return Array.from({ length: 12 }, (_, index) => ({
    value: index,
    label: new Date(2000, index, 1).toLocaleString("fr-FR", { month: "long" }),
  }));
}

const monthOptions = buildMonthOptions();
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export function AdminFinanceDashboard({
  initialLessons,
  initialStudents,
}: AdminFinanceDashboardProps) {
  const router = useRouter();
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [openNewLessonDialog, setOpenNewLessonDialog] = useState(false);

  const availableYears = useMemo(() => {
    const years = new Set<number>([new Date().getFullYear()]);
    initialLessons.forEach((lesson) => years.add(new Date(lesson.date).getFullYear()));
    return Array.from(years).sort((left, right) => right - left);
  }, [initialLessons]);

  const filteredLessons = useMemo(() => {
    const fallbackMonth = new Date().getMonth();
    const referenceMonth = selectedMonth ?? fallbackMonth;
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

    return initialLessons.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      return (
        lessonDate.getFullYear() === selectedYear &&
        lessonDate.getMonth() >= startMonth &&
        lessonDate.getMonth() <= endMonth
      );
    });
  }, [initialLessons, period, selectedMonth, selectedYear]);

  const totalRevenue = useMemo(
    () => filteredLessons.reduce((sum, lesson) => sum + lesson.amount, 0),
    [filteredLessons],
  );
  const declaredRevenue = useMemo(
    () => filteredLessons.reduce((sum, lesson) => sum + (lesson.student.declared ? lesson.amount : 0), 0),
    [filteredLessons],
  );
  const taxableRevenue = useMemo(() => declaredRevenue * 0.75, [declaredRevenue]);
  const totalLessons = filteredLessons.length;
  const totalCashRevenue = useMemo(
    () => filteredLessons.reduce((sum, lesson) => sum + (!lesson.student.declared ? lesson.amount : 0), 0),
    [filteredLessons],
  );
  const totalTotal = useMemo(() => taxableRevenue + totalCashRevenue, [taxableRevenue, totalCashRevenue]);
  const novaLessons = useMemo(() => filteredLessons.filter((lesson) => lesson.amount === 60), [filteredLessons]);
  const novaRevenue = useMemo(
    () => novaLessons.reduce((sum, lesson) => sum + lesson.amount, 0),
    [novaLessons],
  );

  const lessonsAndStudentsByPrice = useMemo(() => {
    return filteredLessons.reduce<Record<number, { lessons: number; students: Set<string> }>>((accumulator, lesson) => {
      if (!accumulator[lesson.amount]) {
        accumulator[lesson.amount] = { lessons: 0, students: new Set<string>() };
      }

      accumulator[lesson.amount].lessons += 1;
      accumulator[lesson.amount].students.add(lesson.student.id);
      return accumulator;
    }, {});
  }, [filteredLessons]);

  const selectedMonthLabel =
    selectedMonth === null ? "Tous les mois" : monthOptions.find((month) => month.value === selectedMonth)?.label;

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Finances</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
                CA, declaratif et detail des cours
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-500">
                Vous retrouvez ici l equivalent de votre ancien ecran finances, branché sur la base Postgres
                actuelle avec ajout de cours direct depuis l admin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={period === "month" ? "default" : "outline"}
                onClick={() => setPeriod("month")}
                className={period === "month" ? "rounded-full bg-stone-900 hover:bg-stone-800" : "rounded-full border-stone-200"}
              >
                Mois
              </Button>
              <Button
                variant={period === "quarter" ? "default" : "outline"}
                onClick={() => setPeriod("quarter")}
                className={period === "quarter" ? "rounded-full bg-stone-900 hover:bg-stone-800" : "rounded-full border-stone-200"}
              >
                Trimestre
              </Button>
              <Button
                variant={period === "year" ? "default" : "outline"}
                onClick={() => setPeriod("year")}
                className={period === "year" ? "rounded-full bg-stone-900 hover:bg-stone-800" : "rounded-full border-stone-200"}
              >
                Annee
              </Button>
              <Button onClick={() => setOpenNewLessonDialog(true)} className="rounded-full bg-amber-600 hover:bg-amber-700">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau cours
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value, 10))}>
              <SelectTrigger className="w-[140px] rounded-full border-stone-200 bg-stone-50">
                <SelectValue placeholder="Annee" />
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
              value={selectedMonth === null ? "null" : selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(value === "null" ? null : Number.parseInt(value, 10))}
            >
              <SelectTrigger className="w-[200px] rounded-full border-stone-200 bg-stone-50">
                <SelectValue placeholder="Mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Tous les mois</SelectItem>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-500">
              Vue: <span className="font-semibold text-stone-900">{selectedMonthLabel}</span> {selectedYear}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(7,minmax(110px,1fr))_minmax(260px,1.8fr)]">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[11px] uppercase tracking-[0.18em] text-stone-500">CA Total</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-black text-stone-900">{totalRevenue.toFixed(0)}€</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[11px] uppercase tracking-[0.18em] text-stone-500">CA Declare</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-black text-stone-900">{declaredRevenue.toFixed(0)}€</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[11px] uppercase tracking-[0.18em] text-stone-500">CA Imposable</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-black text-stone-900">{taxableRevenue.toFixed(2)}€</p>
              <p className="mt-1 text-xs text-stone-500">Apres abattement 25%</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Total Total</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-black text-stone-900">{totalTotal.toFixed(2)}€</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Nombre de cours</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-black text-stone-900">{totalLessons}</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[11px] uppercase tracking-[0.18em] text-stone-500">CA Cash</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-black text-stone-900">{totalCashRevenue.toFixed(0)}€</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[11px] uppercase tracking-[0.18em] text-stone-500">CA NOVA</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-black text-stone-900">{novaRevenue.toFixed(0)}€</p>
              <p className="mt-1 text-xs text-stone-500">{novaLessons.length} cours a 60€</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Cours / Eleves par prix</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-2">
                {Object.entries(lessonsAndStudentsByPrice).map(([price, data]) => (
                  <div key={price} className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600">
                    <span className="font-semibold text-stone-900">{price}€</span>
                    <span className="mx-1 text-stone-300">•</span>
                    <span>{data.lessons} cours</span>
                    <span className="mx-1 text-stone-300">•</span>
                    <span>{data.students.size} eleve(s)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-stone-900">Liste des cours</h3>
              <p className="text-sm text-stone-500">
                Affichage filtre par periode. En mode mois, cela correspond a votre liste du mois.
              </p>
            </div>
            <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600">
              {filteredLessons.length} cours affiches
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-stone-100 bg-stone-50 hover:bg-stone-50">
                <TableHead className="text-xs font-black uppercase tracking-[0.24em] text-stone-500">Date</TableHead>
                <TableHead className="text-xs font-black uppercase tracking-[0.24em] text-stone-500">Eleve</TableHead>
                <TableHead className="text-xs font-black uppercase tracking-[0.24em] text-stone-500">Declare</TableHead>
                <TableHead className="text-xs font-black uppercase tracking-[0.24em] text-stone-500">Statut</TableHead>
                <TableHead className="text-xs font-black uppercase tracking-[0.24em] text-stone-500">Note</TableHead>
                <TableHead className="text-right text-xs font-black uppercase tracking-[0.24em] text-stone-500">Montant</TableHead>
                <TableHead className="text-right text-xs font-black uppercase tracking-[0.24em] text-stone-500">Imposable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessons.map((lesson) => (
                <TableRow key={lesson.id} className="border-stone-100">
                  <TableCell>{dateFormatter.format(new Date(lesson.date))}</TableCell>
                  <TableCell className="font-semibold text-stone-900">{lesson.student.name}</TableCell>
                  <TableCell>
                    {lesson.student.declared ? (
                      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                        Oui
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-stone-500">
                        Non
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lesson.isPaid ? (
                      <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
                        Regle
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700">
                        A regler
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[420px] truncate text-stone-500">
                    {lesson.comment || "Cours de musique a domicile"}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-stone-900">{lesson.amount.toFixed(0)}€</TableCell>
                  <TableCell className="text-right text-stone-600">
                    {lesson.student.declared ? `${(lesson.amount * 0.75).toFixed(2)}€` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddLessonDialog
        isOpen={openNewLessonDialog}
        onClose={() => setOpenNewLessonDialog(false)}
        students={initialStudents}
        onLessonAdded={() => {
          router.refresh();
        }}
      />
    </>
  );
}
