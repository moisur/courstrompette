import { UrssafSuiviDashboard } from "@/components/admin/urssaf/UrssafSuiviDashboard";

export const dynamic = "force-dynamic";

export default function AdminUrssafSuiviPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Suivi</p>
          <h1 className="text-3xl font-black tracking-tight text-stone-900">Suivi URSSAF</h1>
          <p className="text-sm text-stone-500">
            Vue globale de tous vos élèves URSSAF et de leurs demandes de paiement.
          </p>
        </div>

        <UrssafSuiviDashboard />
      </div>
    </div>
  );
}
