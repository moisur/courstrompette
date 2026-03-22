import { convertLeadToStudentAction } from '@/app/admin/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EXPERIENCE_LABELS, listLeads, type LeadRecord } from '@/lib/crm';

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function getStageStyles(stage: string) {
  if (stage === 'student') {
    return 'bg-sky-50 text-sky-700 border-sky-200';
  }

  if (stage === 'lost') {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return 'bg-amber-50 text-amber-700 border-amber-200';
}

function getMailStyles(status: string) {
  if (status === 'sent') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (status === 'failed') {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return 'bg-stone-100 text-stone-600 border-stone-200';
}

export default async function AdminLeadsPage() {
  const leads = await listLeads();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">PostgreSQL</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">Leads du formulaire</h2>
        <p className="mt-2 text-sm text-stone-500">
          Chaque soumission est conservee en base. Tu peux suivre le statut mail et convertir un
          lead en eleve.
        </p>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Mail</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-stone-500">
                    Aucun lead enregistre pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead: LeadRecord) => (
                  <TableRow key={lead.id}>
                    <TableCell className="min-w-[140px] text-xs text-stone-500">
                      {dateFormatter.format(new Date(lead.createdAt))}
                    </TableCell>
                    <TableCell className="min-w-[160px] font-semibold text-stone-900">{lead.name}</TableCell>
                    <TableCell className="min-w-[220px]">
                      <div className="space-y-1 text-sm">
                        <a href={`mailto:${lead.email}`} className="block text-amber-700 hover:text-amber-600">
                          {lead.email}
                        </a>
                        <a href={`tel:${lead.phone}`} className="block text-stone-600 hover:text-stone-900">
                          {lead.phone}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[160px] text-sm text-stone-600">
                      {EXPERIENCE_LABELS[lead.experience] || lead.experience}
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStageStyles(lead.stage)}`}
                      >
                        {lead.stage}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-[180px]">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getMailStyles(lead.mailStatus)}`}
                      >
                        {lead.mailStatus}
                      </span>
                      {lead.mailError ? (
                        <p className="mt-2 max-w-xs text-xs leading-5 text-rose-600">{lead.mailError}</p>
                      ) : null}
                    </TableCell>
                    <TableCell className="min-w-[280px] text-sm leading-6 text-stone-600">
                      {lead.message || 'Aucun message laisse.'}
                    </TableCell>
                    <TableCell className="min-w-[180px]">
                      {lead.stage === 'student' ? (
                        <span className="text-sm font-medium text-sky-700">Deja eleve</span>
                      ) : (
                        <form action={convertLeadToStudentAction}>
                          <input type="hidden" name="leadId" value={lead.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                          >
                            Marquer comme eleve
                          </button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}