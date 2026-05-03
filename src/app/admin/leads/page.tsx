import { convertLeadToStudentAction } from '@/app/admin/actions';
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

  if (stage === 'contacted' || stage === 'scheduled') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return 'bg-stone-100 text-stone-600 border-stone-200';
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

function countByStage(leads: LeadRecord[], stage: string) {
  return leads.filter((lead) => lead.stage === stage).length;
}

export default async function AdminLeadsPage() {
  const leads = await listLeads();

  const summaryCards = [
    { label: 'Total leads', value: leads.length, tone: 'bg-white' },
    { label: 'Nouveaux', value: countByStage(leads, 'new'), tone: 'bg-stone-50' },
    { label: 'Contactes', value: countByStage(leads, 'contacted') + countByStage(leads, 'scheduled'), tone: 'bg-amber-50' },
    { label: 'Convertis eleves', value: countByStage(leads, 'student'), tone: 'bg-sky-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">PostgreSQL</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">Leads du formulaire</h2>
        <p className="mt-2 text-sm leading-7 text-stone-500">
          Chaque demande reste visible dans le CRM. La page est pensee pour tenir en largeur sur
          un seul ecran, avec les informations utiles tout de suite et le message lisible sans debordement.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-2xl border border-stone-200 p-5 shadow-sm ${card.tone}`}>
            <p className="text-sm font-medium text-stone-500">{card.label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-stone-900">{card.value}</p>
          </div>
        ))}
      </section>

      {leads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-4 py-16 text-center text-sm text-stone-500">
          Aucun lead enregistre pour le moment.
        </div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {leads.map((lead: LeadRecord) => (
            <article
              key={lead.id}
              className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-stone-900">{lead.name}</h3>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStageStyles(lead.stage)}`}
                    >
                      {lead.stage}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getMailStyles(lead.mailStatus)}`}
                    >
                      {lead.mailStatus}
                    </span>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                    {dateFormatter.format(new Date(lead.createdAt))}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-stone-50 px-4 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Contact</p>
                      <a href={`mailto:${lead.email}`} className="mt-2 block break-all text-sm font-semibold text-amber-700">
                        {lead.email}
                      </a>
                      <a href={`tel:${lead.phone}`} className="mt-1 block text-sm text-stone-700">
                        {lead.phone}
                      </a>
                    </div>

                    <div className="rounded-2xl bg-stone-50 px-4 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Niveau</p>
                      <p className="mt-2 text-sm font-semibold text-stone-900">
                        {EXPERIENCE_LABELS[lead.experience] || lead.experience}
                      </p>
                      {lead.studentId ? (
                        <p className="mt-1 text-xs text-sky-700">Relie a un eleve existant</p>
                      ) : (
                        <p className="mt-1 text-xs text-stone-500">En attente de conversion CRM</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-[220px] shrink-0 lg:text-right">
                  {lead.stage === 'student' ? (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm font-semibold text-sky-700">
                      Lead deja converti
                    </div>
                  ) : (
                    <form action={convertLeadToStudentAction}>
                      <input type="hidden" name="leadId" value={lead.id} />
                      <button
                        type="submit"
                        className="w-full rounded-full border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                      >
                        Convertir en eleve
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-stone-100 bg-stone-50 px-4 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Message</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-stone-600">
                  {lead.message || 'Aucun message laisse.'}
                </p>
                {lead.mailError ? (
                  <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
                    Erreur email: {lead.mailError}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
