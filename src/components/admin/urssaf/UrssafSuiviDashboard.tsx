"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Landmark, Loader2, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/client-api";

type UrssafClientRecord = {
  id: string;
  nomNaissance: string;
  prenoms: string;
  email: string;
  dateNaissance?: string | null;
  createdAt: string;
  studentId: string | null;
  studentName: string | null;
};

type UrssafStoredRequestRecord = {
  id: string;
  studentId: string;
  studentName: string;
  urssafClientId?: string | null;
  urssafClientEmail?: string | null;
  urssafClientName?: string | null;
  numFactureTiers: string;
  idDemandePaiement?: string | null;
  statutCode?: string | null;
  statutLabel?: string | null;
  amountTtc: number;
  dateFacture: string;
  dateDebutEmploi: string;
  dateFinEmploi: string;
  submittedAt?: string | null;
  lastSyncedAt?: string | null;
  createdAt: string;
  lessons: Array<{
    id: string;
    date: string;
    amount: number;
    comment?: string | null;
    isPaid: boolean;
  }>;
};

function getStatusTone(code?: string | null) {
  if (!code) return "border-stone-200 bg-stone-100 text-stone-600";
  if (["10", "20"].includes(code)) return "border-amber-200 bg-amber-50 text-amber-800";
  if (["30", "50", "70", "120", "270"].includes(code)) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-rose-200 bg-rose-50 text-rose-800";
}

function getStatusLabel(code?: string | null) {
  switch (code) {
    case "10": return "Intégrée";
    case "20": return "En attente de validation";
    case "30": return "Validée";
    case "40": return "Refusée";
    case "50": return "Prélevée";
    case "60": return "Refus de prélèvement";
    case "70": return "Payée";
    case "110": case "111": case "112": case "113": return "Annulée";
    case "120": return "Recouvrée";
    case "260": return "Impayé prestataire";
    case "270": return "Régularisée prestataire";
    default: return code ? `Code ${code}` : "Inconnu";
  }
}

function getStatusIcon(code?: string | null) {
  if (!code) return <Clock size={14} />;
  if (["70", "120", "270"].includes(code)) return <CheckCircle2 size={14} />;
  if (["10", "20", "30", "50"].includes(code)) return <Clock size={14} />;
  return <XCircle size={14} />;
}

function isSettled(code?: string | null) {
  return Boolean(code && ["70", "120", "270"].includes(code));
}

function isError(code?: string | null) {
  return Boolean(code && (code.startsWith("ERR_") || ["40", "60", "110", "111", "112", "113", "260"].includes(code)));
}

type StudentDPGroup = {
  studentId: string;
  studentName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  requests: UrssafStoredRequestRecord[];
};

export function UrssafSuiviDashboard() {
  const [clients, setClients] = useState<UrssafClientRecord[]>([]);
  const [requests, setRequests] = useState<UrssafStoredRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clientsData, requestsData] = await Promise.all([
        apiRequest<UrssafClientRecord[]>("/api/admin/urssaf/clients"),
        apiRequest<UrssafStoredRequestRecord[]>("/api/admin/urssaf/payment-requests"),
      ]);
      setClients(clientsData);
      setRequests(requestsData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const syncAll = useCallback(async () => {
    setIsSyncing(true);
    try {
      await apiRequest("/api/admin/urssaf/payment-requests/sync", { method: "POST" });
      await loadData();
    } finally {
      setIsSyncing(false);
    }
  }, [loadData]);

  // Group requests by student
  const studentGroups = useMemo<StudentDPGroup[]>(() => {
    const groups = new Map<string, StudentDPGroup>();

    // Init groups from clients
    for (const client of clients) {
      if (client.studentId && !groups.has(client.studentId)) {
        groups.set(client.studentId, {
          studentId: client.studentId,
          studentName: client.studentName || `${client.prenoms} ${client.nomNaissance}`,
          clientId: client.id,
          clientName: `${client.prenoms} ${client.nomNaissance}`,
          clientEmail: client.email,
          requests: [],
        });
      }
    }

    // Assign requests to groups
    for (const req of requests) {
      let group = groups.get(req.studentId);
      if (!group) {
        group = {
          studentId: req.studentId,
          studentName: req.studentName,
          clientId: req.urssafClientId || "",
          clientName: req.urssafClientName || req.studentName,
          clientEmail: req.urssafClientEmail || "",
          requests: [],
        };
        groups.set(req.studentId, group);
      }
      group.requests.push(req);
    }

    return Array.from(groups.values()).sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [clients, requests]);

  // Stats
  const totalClients = clients.length;
  const totalRequests = requests.length;
  const pendingCount = requests.filter(r => !isSettled(r.statutCode) && !isError(r.statutCode)).length;
  const settledCount = requests.filter(r => isSettled(r.statutCode)).length;
  const errorCount = requests.filter(r => isError(r.statutCode)).length;
  const totalAmount = requests.reduce((sum, r) => sum + Number(r.amountTtc), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Élèves URSSAF</p>
          <p className="mt-2 text-3xl font-black text-stone-900">{totalClients}</p>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Demandes totales</p>
          <p className="mt-2 text-3xl font-black text-stone-900">{totalRequests}</p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-amber-600">En attente</p>
          <p className="mt-2 text-3xl font-black text-amber-800">{pendingCount}</p>
        </div>
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Réglées</p>
          <p className="mt-2 text-3xl font-black text-emerald-800">{settledCount}</p>
        </div>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-rose-600">En erreur</p>
          <p className="mt-2 text-3xl font-black text-rose-800">{errorCount}</p>
        </div>
      </div>

      {/* Amount summary */}
      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Montant total facturé URSSAF</p>
          <p className="mt-1 text-2xl font-black text-stone-900">{totalAmount.toFixed(2)} EUR</p>
        </div>
        <Button
          onClick={() => void syncAll()}
          disabled={isSyncing}
          className="rounded-full bg-stone-900 hover:bg-stone-800"
        >
          {isSyncing ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synchronisation...</>
          ) : (
            <><RefreshCw className="mr-2 h-4 w-4" /> Synchroniser tous les statuts (M070)</>
          )}
        </Button>
      </div>

      {/* Student groups */}
      {studentGroups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-8 py-16 text-center">
          <Landmark className="mx-auto h-12 w-12 text-stone-300" />
          <p className="mt-4 text-lg font-semibold text-stone-700">Aucun élève URSSAF</p>
          <p className="mt-2 text-sm text-stone-500">
            Créez un élève URSSAF depuis la page Élèves pour commencer le suivi.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {studentGroups.map((group) => (
            <div key={group.studentId} className="rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden">
              {/* Student header */}
              <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 bg-stone-50/50">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900">{group.studentName}</p>
                    <p className="text-xs text-stone-500">
                      Client URSSAF : <span className="font-mono text-stone-600">{group.clientId.slice(0, 16)}...</span>
                      {group.clientEmail && <> · {group.clientEmail}</>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">
                    {group.requests.length} DP{group.requests.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* DPs list */}
              {group.requests.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-stone-400">
                  Aucune demande de paiement pour le moment.
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {group.requests.map((req) => (
                    <div key={req.id} className="px-6 py-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-stone-900">{req.numFactureTiers}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${getStatusTone(req.statutCode)}`}>
                              {getStatusIcon(req.statutCode)}
                              {getStatusLabel(req.statutCode)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-stone-500">
                            <span>Montant : <strong className="text-stone-700">{Number(req.amountTtc).toFixed(2)} EUR</strong></span>
                            {req.idDemandePaiement && (
                              <span>API ID : <span className="font-mono text-stone-600">{req.idDemandePaiement.slice(0, 20)}...</span></span>
                            )}
                            {req.submittedAt && (
                              <span>Soumis le {new Date(req.submittedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            )}
                            {req.lastSyncedAt && (
                              <span>Sync : {new Date(req.lastSyncedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                            )}
                          </div>
                          {req.lessons.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {req.lessons.map((lesson) => (
                                <span key={lesson.id} className="rounded bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                                  {new Date(lesson.date).toLocaleDateString("fr-FR")} · {Number(lesson.amount)} EUR
                                  {lesson.isPaid && " ✓"}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
