import { prisma } from "@/lib/db";
import { AdminFinanceDashboard } from "@/components/admin/finance/AdminFinanceDashboard";

export const dynamic = "force-dynamic";

export default async function AdminFinancesPage() {
  const [students, lessons] = await Promise.all([
    prisma.student.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        rate: true,
        declared: true,
        archived: true,
      },
    }),
    prisma.lesson.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        amount: true,
        isPaid: true,
        comment: true,
        student: {
          select: {
            id: true,
            name: true,
            rate: true,
            declared: true,
            archived: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6 p-6">
      <AdminFinanceDashboard
        initialStudents={students.map((student) => ({
          ...student,
          rate: Number(student.rate),
        }))}
        initialLessons={lessons.map((lesson) => ({
          ...lesson,
          date: lesson.date.toISOString(),
          amount: Number(lesson.amount),
          student: {
            ...lesson.student,
            rate: Number(lesson.student.rate),
          },
        }))}
      />
    </div>
  );
}
