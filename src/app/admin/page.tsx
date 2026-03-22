import Link from 'next/link';

import { getCrmStats, listLeads, listStudents, type LeadRecord, type StudentRecord } from '@/lib/crm';

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default async function AdminDashboardPage() {
  const [stats, leads, students] = await Promise.all([getCrmStats(), listLeads(), listStudents()]);
  const latestLeads = leads.slice(0, 5);
  const latestStudents = students.slice(0, 3);

  const cards = [
    { label: 'Leads', value: stats.leads, tone: 'bg-white' },
    { label: 'Eleves', value: stats.students, tone: 'bg-sky-50' },
    { label: 'Mails envoyes', value: stats.sent, tone: 'bg-emerald-50' },
    { label: 'Leads convertis', value: stats.converted, tone: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">CRM</p>
            <h2 className="text-3xl font-semibold tracking-tight text-stone-900">Base Postgres leads + eleves</h2>
            <p className="text-sm leading-7 text-stone-600">
              Les demandes du formulaire et les eleves sont maintenant pensÃ©s pour etre suivis
              depuis l admin sur une vraie base PostgreSQL.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/leads"
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              Ouvrir les leads
            </Link>
            <Link
              href="/admin/students"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-amber-300 hover:text-amber-700"
            >
              Voir les eleves
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-2xl border border-stone-200 p-6 shadow-sm ${card.tone}`}>
            <p className="text-sm font-medium text-stone-500">{card.label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-stone-900">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-stone-900">Derniers leads</h3>
              <p className="text-sm text-stone-500">Vue rapide des demandes les plus recentes.</p>
            </div>
            <Link href="/admin/leads" className="text-sm font-semibold text-amber-700 hover:text-amber-600">
              Voir tout
            </Link>
          </div>

          {latestLeads.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-500">
              Aucun lead enregistre pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {latestLeads.map((lead: LeadRecord) => (
                <div key={lead.id} className="rounded-2xl border border-stone-200 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-stone-900">{lead.name}</p>
                      <p className="text-sm text-stone-500">{lead.email} - {lead.phone}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-600">
                        {lead.stage}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        {lead.mailStatus}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    {lead.message || 'Aucun message laisse.'}
                  </p>
                  <p className="mt-3 text-xs text-stone-400">{dateFormatter.format(new Date(lead.createdAt))}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-stone-900">Derniers eleves</h3>
          {latestStudents.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">Aucun eleve pour le moment.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {latestStudents.map((student: StudentRecord) => (
                <div key={student.id} className="rounded-2xl border border-stone-200 px-4 py-4">
                  <p className="font-semibold text-stone-900">{student.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{student.email || 'Sans email'} - {student.phone}</p>
                  <p className="mt-2 text-xs text-stone-400">
                    Ajoute le {dateFormatter.format(new Date(student.createdAt))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
