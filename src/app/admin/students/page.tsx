import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EXPERIENCE_LABELS, listStudents, type StudentRecord } from '@/lib/crm';

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default async function AdminStudentsPage() {
  const students = await listStudents();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">PostgreSQL</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">Eleves</h2>
        <p className="mt-2 text-sm text-stone-500">
          Vue simple des contacts convertis en eleves dans la base.
        </p>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-stone-500">
                  Aucun eleve enregistre pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student: StudentRecord) => (
                <TableRow key={student.id}>
                  <TableCell className="min-w-[140px] text-xs text-stone-500">
                    {dateFormatter.format(new Date(student.createdAt))}
                  </TableCell>
                  <TableCell className="min-w-[180px] font-semibold text-stone-900">{student.name}</TableCell>
                  <TableCell className="min-w-[220px]">
                    <div className="space-y-1 text-sm">
                      {student.email ? (
                        <a href={`mailto:${student.email}`} className="block text-amber-700 hover:text-amber-600">
                          {student.email}
                        </a>
                      ) : (
                        <span className="block text-stone-400">Sans email</span>
                      )}
                      <a href={`tel:${student.phone}`} className="block text-stone-600 hover:text-stone-900">
                        {student.phone}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[160px] text-sm text-stone-600">
                    {student.experience ? EXPERIENCE_LABELS[student.experience] || student.experience : 'Non renseigne'}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${student.active ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-stone-200 bg-stone-100 text-stone-500'}`}>
                      {student.active ? 'actif' : 'inactif'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
