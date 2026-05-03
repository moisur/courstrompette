import { prisma } from "@/lib/db";
import { StudentsTable } from "@/components/admin/student/StudentsTable";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
          experience: true,
          stage: true,
        },
      },
      user: {
        select: {
          email: true,
          isActive: true,
          mustChangePassword: true,
        },
      },
      urssafClient: {
        select: {
          id: true,
        },
      },
    },
  });

  const studentsData = students.map((student) => ({
    id: student.id,
    createdAt: student.createdAt.toISOString(),
    name: student.name,
    rate: Number(student.rate),
    phone: student.phone,
    email: student.user?.email ?? student.lead?.email ?? null,
    experience: student.lead?.experience ?? null,
    notes: student.notes,
    archived: student.archived,
    declared: student.declared,
    hasUrssafClient: Boolean(student.urssafClient),
    lead: student.lead,
    user: student.user,
  }));

  const totalStudents = studentsData.length;
  const activeStudents = studentsData.filter((student) => !student.archived).length;
  const declaredStudents = studentsData.filter((student) => student.declared).length;
  const urssafReadyStudents = studentsData.filter((student) => student.hasUrssafClient).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-px w-10 bg-amber-600" />
            <p className="text-xs font-black uppercase tracking-[0.32em] text-amber-700">CRM Trompette</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-stone-900 sm:text-5xl">
            Eleves, cours, CRM et URSSAF
          </h2>
          <p className="max-w-3xl text-sm font-medium leading-7 text-stone-500">
            Cette vue unifie l&apos;ancien portail eleve avec votre CRM actuel. Vous pouvez creer, retrouver,
            archiver ou supprimer un eleve, gerer ses cours et le basculer ensuite vers URSSAF quand vous le souhaitez.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-400">Total</p>
            <p className="mt-2 text-2xl font-black text-stone-900">{totalStudents}</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-400">Actifs</p>
            <p className="mt-2 text-2xl font-black text-emerald-600">{activeStudents}</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-400">Declares</p>
            <p className="mt-2 text-2xl font-black text-amber-600">{declaredStudents}</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-400">URSSAF</p>
            <p className="mt-2 text-2xl font-black text-sky-600">{urssafReadyStudents}</p>
          </div>
        </div>
      </div>

      <StudentsTable initialStudents={studentsData} />
    </div>
  );
}
