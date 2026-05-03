"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Database, ExternalLink, FileText, Landmark, RefreshCw, Search, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, toErrorMessage } from "@/lib/client-api";
import { getFriendlyErrorMessage } from "@/lib/urssaf/errors";

type UrssafClientRecord = {
  id: string;
  nomNaissance: string;
  prenoms: string;
  email: string;
  dateNaissance?: string | null;
  createdAt: string;
  studentId: string | null;
  studentName: string | null;
  phone?: string | null;
  address?: string | null;
};

type UrssafStoredRequestRecord = {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone?: string | null;
  studentAddress?: string | null;
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

type SearchResult = {
  Errors?: Array<{ code: string; message?: string; description?: string }>;
  infoDemandePaiements?: Array<{
    idDemandePaiement?: string;
    demandePaiement?: {
      numFactureTiers?: string;
      idClient?: string;
      mntFactureTTC?: number;
    };
    statut?: {
      code?: string;
      libelle?: string;
    };
    infoRejet?: {
      code?: string;
      commentaire?: string;
    };
    infoVirement?: {
      mntVirement?: number;
      dateVirement?: string;
    };
  }>;
};

type UrssafTraceItem = {
  id: string;
  method: "AUTH" | "M010" | "M020" | "M050" | "M070";
  phase: "REQUEST" | "RESPONSE";
  label: string;
  payload: string;
  status?: number;
  createdAt: string;
};

const TRACE_HINT = "Les traces AUTH, M010, M020, M050 et M070 sont ecrites dans les logs serveur avec les blocs TRACE API.";

function toDateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function buildSandboxFactureRef() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
  return `FACT-SANDBOX-${stamp}`;
}

function toIsoFromLocalDateTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function parseUrssafAvailabilityDate(description?: string) {
  if (!description) return null;

  const match = description.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;

  const [, day, month, year, hour, minute, second = "00"] = match;
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildValidSandboxEmploymentWindow(statusDescription?: string) {
  const availableSince = parseUrssafAvailabilityDate(statusDescription);
  const now = new Date();
  const latestAllowedEnd = new Date(now.getTime() - 10 * 60_000);
  let startDate = new Date(now.getTime() - 30 * 60_000);

  if (availableSince) {
    const candidateStart = new Date(availableSince.getTime() + 5 * 60_000);
    if (candidateStart.getTime() > startDate.getTime() && candidateStart.getTime() < latestAllowedEnd.getTime()) {
      startDate = candidateStart;
    }
  }

  let endDate = new Date(startDate.getTime() + 20 * 60_000);
  if (endDate.getTime() > latestAllowedEnd.getTime()) {
    endDate = latestAllowedEnd;
  }

  if (endDate.getTime() <= startDate.getTime()) {
    startDate = new Date(now.getTime() - 20 * 60_000);
    endDate = new Date(now.getTime() - 5 * 60_000);
  }

  return {
    start: toDateTimeLocalValue(startDate),
    end: toDateTimeLocalValue(endDate),
    availableSince,
  };
}

function getStatusTone(code?: string) {
  if (!code) return "border-stone-200 bg-stone-100 text-stone-600";
  if (code === "APPAREILLAGE_VALIDE") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (code === "APPAREILLAGE_EC") return "border-amber-200 bg-amber-50 text-amber-800";
  if (code.startsWith("ERR_")) return "border-rose-200 bg-rose-50 text-rose-800";
  if (["10", "20"].includes(code)) return "border-amber-200 bg-amber-50 text-amber-800";
  if (["30", "50", "70", "120", "270"].includes(code)) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-rose-200 bg-rose-50 text-rose-800";
}

function getStatusLabel(code?: string, fallback?: string) {
  switch (code) {
    case "APPAREILLAGE_VALIDE":
      return "Transmission possible";
    case "APPAREILLAGE_EC":
      return "Appareillage en cours";
    case "10":
      return "Integree";
    case "20":
      return "En attente de validation";
    case "30":
      return "Validee";
    case "40":
      return "Refusee";
    case "50":
      return "Prelevee";
    case "60":
      return "Refus de prelevement";
    case "70":
      return "Payee";
    case "110":
      return "Annulee";
    case "111":
      return "Annulee apres impaye";
    case "112":
      return "Annulee apres recouvrement";
    case "113":
      return "Annulee raison specifique";
    case "120":
      return "Recouvree";
    case "260":
      return "Impaye prestataire";
    case "270":
      return "Regularise prestataire";
    default:
      return fallback || "Inconnu";
  }
}

function getPaymentResultTone(item: any) {
  const hasErrors = Array.isArray(item?.errors) && item.errors.length > 0;
  const status = typeof item?.statut === "string" ? item.statut : "";

  if (hasErrors || status.startsWith("ERR_")) {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-900";
}

function isRequestSettled(code?: string | null) {
  return Boolean(code && ["70", "120", "270"].includes(code));
}

function isRequestError(code?: string | null) {
  return Boolean(code && (code.startsWith("ERR_") || ["40", "60", "110", "111", "112", "113", "260"].includes(code)));
}

export function UrssafAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"clients" | "factures">("clients");
  const [showSandboxGuide, setShowSandboxGuide] = useState(false);
  const [clients, setClients] = useState<UrssafClientRecord[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<any | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("50");
  const [paymentFactureRef, setPaymentFactureRef] = useState("");
  const [paymentDateDebut, setPaymentDateDebut] = useState("");
  const [paymentDateFin, setPaymentDateFin] = useState("");
  const [paymentSiret, setPaymentSiret] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<any[] | null>(null);
  const [searchFactureRef, setSearchFactureRef] = useState("");
  const [searchDateDebut, setSearchDateDebut] = useState("");
  const [searchDateFin, setSearchDateFin] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [traceItems, setTraceItems] = useState<UrssafTraceItem[]>([]);
  const [isLoadingTraces, setIsLoadingTraces] = useState(false);
  const [storedRequests, setStoredRequests] = useState<UrssafStoredRequestRecord[]>([]);
  const [isLoadingStoredRequests, setIsLoadingStoredRequests] = useState(true);
  const [isSyncingAllRequests, setIsSyncingAllRequests] = useState(false);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? null,
    [clients, selectedClientId],
  );

  const loadClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const data = await apiRequest<UrssafClientRecord[]>("/api/admin/urssaf/clients");
      setClients(data);
      if (!selectedClientId && data[0]) {
        setSelectedClientId(data[0].id);
      }
    } finally {
      setIsLoadingClients(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const loadTraces = useCallback(async () => {
    setIsLoadingTraces(true);
    try {
      const data = await apiRequest<UrssafTraceItem[]>("/api/admin/urssaf/traces");
      setTraceItems(data);
    } finally {
      setIsLoadingTraces(false);
    }
  }, []);

  useEffect(() => {
    void loadTraces();
  }, [loadTraces]);

  const loadStoredRequests = useCallback(async () => {
    setIsLoadingStoredRequests(true);
    try {
      const data = await apiRequest<UrssafStoredRequestRecord[]>("/api/admin/urssaf/payment-requests");
      setStoredRequests(data);
    } finally {
      setIsLoadingStoredRequests(false);
    }
  }, []);

  useEffect(() => {
    void loadStoredRequests();
  }, [loadStoredRequests]);

  async function syncAllStoredRequests() {
    setIsSyncingAllRequests(true);
    try {
      await apiRequest("/api/admin/urssaf/payment-requests/sync", {
        method: "POST",
      });
      await Promise.all([loadStoredRequests(), loadTraces()]);
    } finally {
      setIsSyncingAllRequests(false);
    }
  }

  async function checkStatus(client: UrssafClientRecord) {
    setSelectedClientId(client.id);
    setStatusResult(null);
    setStatusError(null);
    setPaymentError(null);
    setPaymentResult(null);
    setShowPaymentForm(false);
    setIsLoadingStatus(true);

    try {
      const result = await apiRequest<any>("/api/admin/urssaf/status", {
        method: "POST",
        body: JSON.stringify({
          idClient: client.id,
        }),
      });
      setStatusResult(result);
    } catch (error) {
      setStatusError(toErrorMessage(error, "Erreur lors de la recuperation du statut"));
    } finally {
      setIsLoadingStatus(false);
      void loadTraces();
    }
  }

  async function submitPayment() {
    if (!selectedClient?.studentId) {
      setPaymentError("Aucun eleve rattache a ce client URSSAF.");
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);
    setPaymentResult(null);

    try {
      const result = await apiRequest<any[]>("/api/admin/urssaf/payments", {
        method: "POST",
        body: JSON.stringify({
          studentId: selectedClient.studentId,
          amount: Number(paymentAmount),
          numFactureTiers: paymentFactureRef || undefined,
          dateDebutEmploi: paymentDateDebut ? toIsoFromLocalDateTime(paymentDateDebut) : undefined,
          dateFinEmploi: paymentDateFin ? toIsoFromLocalDateTime(paymentDateFin) : undefined,
          siretIntervenant: paymentSiret || undefined,
        }),
      });

      setPaymentResult(result);
      const lastFactureRef = result[0]?.numFactureTiers || paymentFactureRef;
      if (lastFactureRef) {
        setSearchFactureRef(lastFactureRef);
        setSearchDateDebut("");
        setSearchDateFin("");
      }
      setShowPaymentForm(false);
    } catch (error) {
      setPaymentError(toErrorMessage(error, "Erreur lors de la transmission de la demande de paiement"));
    } finally {
      setPaymentLoading(false);
      void Promise.all([loadTraces(), loadStoredRequests()]);
    }
  }

  async function searchPayments() {
    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const result = await apiRequest<SearchResult>("/api/admin/urssaf/payments/search", {
        method: "POST",
        body: JSON.stringify({
          numFactureTiers: searchFactureRef || undefined,
          dateDebut: searchDateDebut || undefined,
          dateFin: searchDateFin || undefined,
        }),
      });

      setSearchResult(result);
    } catch (error) {
      setSearchError(toErrorMessage(error, "Erreur lors de la recherche des demandes de paiement"));
    } finally {
      setSearchLoading(false);
      void loadTraces();
    }
  }

  async function clearTraces() {
    await apiRequest("/api/admin/urssaf/traces", { method: "DELETE" });
    setTraceItems([]);
  }

  function prepareSandboxPaymentStep() {
    setActiveTab("clients");
    setShowPaymentForm(true);
    setPaymentAmount("50");
    setPaymentFactureRef(buildSandboxFactureRef());
    const window = buildValidSandboxEmploymentWindow(statusResult?.statut?.description);
    setPaymentDateDebut(window.start);
    setPaymentDateFin(window.end);
  }

  function prepareSandboxSearchStep() {
    setActiveTab("factures");
    const lastFactureRef = paymentResult?.[0]?.numFactureTiers || paymentFactureRef;
    if (lastFactureRef) {
      setSearchFactureRef(lastFactureRef);
      setSearchDateDebut("");
      setSearchDateFin("");
    }
  }

  const requestsInProgress = useMemo(
    () => storedRequests.filter((item) => !isRequestSettled(item.statutCode) && !isRequestError(item.statutCode)).length,
    [storedRequests],
  );

  const requestsSettled = useMemo(
    () => storedRequests.filter((item) => isRequestSettled(item.statutCode)).length,
    [storedRequests],
  );

  const requestsErrored = useMemo(
    () => storedRequests.filter((item) => isRequestError(item.statutCode)).length,
    [storedRequests],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Urssaf</p>
            <h2 className="text-3xl font-semibold tracking-tight text-stone-900">Validation sandbox et suivi factures</h2>
            <p className="max-w-3xl text-sm leading-7 text-stone-600">
              Cette page reprend les flux URSSAF necessaires au cahier de tests : statut particulier (M020),
              transmission de demande de paiement (M050) et recherche de demandes (M070).
            </p>
            <p className="text-sm text-stone-500">
              L&apos;authentification OAuth sandbox/prod est geree automatiquement cote serveur a partir des variables
              d&apos;environnement URSSAF.
            </p>
            <p className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900">
              {TRACE_HINT}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setShowSandboxGuide((current) => !current)}
            className="rounded-full bg-amber-600 hover:bg-amber-700"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            {showSandboxGuide ? "Masquer le guide sandbox" : "Lancer le guide sandbox"}
          </Button>
        </div>
      </section>

      {showSandboxGuide ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Mode Sandbox</p>
            <h3 className="text-2xl font-semibold tracking-tight text-stone-900">
              Parcours guide pour le cahier de tests URSSAF
            </h3>
            <p className="max-w-4xl text-sm leading-7 text-stone-600">
              Suivez ces etapes dans l&apos;ordre. Le but n&apos;est pas d&apos;automatiser les captures, mais de vous
              preparer chaque ecran proprement pour prendre vos screenshots et produire les traces serveur.
            </p>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-white bg-white p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Etape 1</p>
              <p className="mt-2 text-lg font-semibold text-stone-900">Choisir un eleve fictif et preparer M010</p>
              <p className="mt-2 text-sm text-stone-600">
                Ouvrez une fiche eleve test dans le CRM, puis utilisez le bouton de pre-remplissage sandbox dans le
                formulaire URSSAF.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-stone-900 hover:bg-stone-800">
                  <Link href="/admin/students">Ouvrir les eleves</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white bg-white p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Etape 2</p>
              <p className="mt-2 text-lg font-semibold text-stone-900">Verifier M020 sur un client inscrit</p>
              <p className="mt-2 text-sm text-stone-600">
                Une fois M010 reussi, revenez ici, selectionnez le client URSSAF cree, puis demandez le statut.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => selectedClient ? void checkStatus(selectedClient) : undefined}
                  disabled={!selectedClient}
                  className="rounded-full bg-stone-900 hover:bg-stone-800"
                >
                  Verifier M020
                </Button>
                {statusResult ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    M020 pret pour capture
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-white bg-white p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Etape 3</p>
              <p className="mt-2 text-lg font-semibold text-stone-900">Preparer M050 avec un cas sandbox propre</p>
              <p className="mt-2 text-sm text-stone-600">
                Le bouton ci-dessous vous pre-remplit la demande de paiement test avec un montant standard et une
                reference facture sandbox.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={prepareSandboxPaymentStep}
                  disabled={!selectedClient?.studentId}
                  className="rounded-full bg-amber-600 hover:bg-amber-700"
                >
                  Preparer M050
                </Button>
                {paymentResult ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    M050 envoye
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-white bg-white p-5">
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Etape 4</p>
              <p className="mt-2 text-lg font-semibold text-stone-900">Basculer sur M070 avec la bonne reference</p>
              <p className="mt-2 text-sm text-stone-600">
                Apres M050, l&apos;interface reutilise la reference de facture envoyee pour vous faciliter la recherche.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={prepareSandboxSearchStep}
                  className="rounded-full bg-stone-900 hover:bg-stone-800"
                >
                  Preparer M070
                </Button>
                {searchResult ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    M070 lance
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-amber-300 bg-white px-4 py-4 text-sm text-stone-600">
            Pensez a capturer les ecrans M010, M020, M050 et M070, puis a recuperer les blocs `TRACE API` dans le
            terminal local ou dans `pm2 logs courstrompette` sur le serveur.
          </div>
        </section>
      ) : null}

      <section className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("clients")}
          className={`rounded-full px-5 py-3 text-sm font-bold transition ${activeTab === "clients" ? "bg-stone-900 text-white" : "border border-stone-300 bg-white text-stone-600 hover:border-amber-300 hover:text-amber-700"}`}
        >
          Base clients URSSAF
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("factures")}
          className={`rounded-full px-5 py-3 text-sm font-bold transition ${activeTab === "factures" ? "bg-stone-900 text-white" : "border border-stone-300 bg-white text-stone-600 hover:border-amber-300 hover:text-amber-700"}`}
        >
          Suivi factures URSSAF
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Clients URSSAF</p>
          <p className="mt-2 text-3xl font-black text-stone-900">{clients.length}</p>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Demandes en cours</p>
          <p className="mt-2 text-3xl font-black text-amber-700">{requestsInProgress}</p>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Demandes reglees</p>
          <p className="mt-2 text-3xl font-black text-emerald-700">{requestsSettled}</p>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Demandes en erreur</p>
          <p className="mt-2 text-3xl font-black text-rose-700">{requestsErrored}</p>
        </div>
      </section>

      {activeTab === "clients" ? (
        <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Clients inscrits</h3>
                <p className="text-sm text-stone-500">{clients.length} client(s) URSSAF en base</p>
              </div>
              <Button variant="outline" onClick={() => void loadClients()} className="rounded-full border-stone-200">
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
            </div>

            <div className="max-h-[680px] space-y-3 overflow-y-auto p-4">
              {isLoadingClients ? (
                <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-500">Chargement...</p>
              ) : clients.length === 0 ? (
                <div className="space-y-4 rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-500">
                  <p>Aucun client URSSAF pour le moment.</p>
                  <Link href="/admin/students" className="inline-flex items-center gap-2 font-semibold text-amber-700 hover:text-amber-600">
                    Aller sur les eleves pour lancer une inscription
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                clients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => void checkStatus(client)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${selectedClientId === client.id ? "border-amber-300 bg-amber-50 shadow-sm" : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-stone-900">{client.prenoms} {client.nomNaissance}</p>
                        <p className="mt-1 text-sm text-stone-500">{client.email}</p>
                        <p className="mt-2 text-xs text-stone-400">
                          {client.studentName ? `Eleve: ${client.studentName}` : "Aucun eleve relie"}
                        </p>
                      </div>
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-500">
                        {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            {!selectedClient ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center text-stone-500">
                <Database className="h-12 w-12 text-stone-300" />
                <div>
                  <p className="text-lg font-semibold text-stone-700">Selectionnez un client URSSAF</p>
                  <p className="text-sm">Le statut M020 et la DP M050 s&apos;afficheront ici.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">M020</p>
                    <h3 className="mt-2 text-2xl font-semibold text-stone-900">
                      {selectedClient.prenoms} {selectedClient.nomNaissance}
                    </h3>
                    <p className="mt-2 text-sm text-stone-500">
                      idClient URSSAF: <span className="font-mono text-stone-700">{selectedClient.id}</span>
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Eleve relie: {selectedClient.studentName || "aucun"}
                    </p>
                  </div>

                  <Button onClick={() => void checkStatus(selectedClient)} className="rounded-full bg-stone-900 hover:bg-stone-800">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verifier le statut
                  </Button>
                </div>

                {isLoadingStatus ? (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-8 text-sm text-stone-500">
                    Verification du statut en cours...
                  </div>
                ) : null}

                {statusError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                      <p>{statusError}</p>
                    </div>
                  </div>
                ) : null}

                {statusResult ? (
                  <div className="space-y-4">
                    <div className={`rounded-2xl border px-4 py-4 ${getStatusTone(statusResult?.statut?.code)}`}>
                      <p className="text-[11px] font-black uppercase tracking-widest">Statut de transmission</p>
                      <p className="mt-2 text-lg font-semibold">
                        {getStatusLabel(statusResult?.statut?.code, statusResult?.statut?.libelle)}
                        {statusResult?.statut?.code ? ` (code ${statusResult.statut.code})` : ""}
                      </p>
                      {statusResult?.statut?.description ? (
                        <p className="mt-2 text-sm">{statusResult.statut.description}</p>
                      ) : null}
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-700">
                      <p className="font-semibold text-stone-900">Donnees remontees</p>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        <p><span className="font-semibold">Nom:</span> {statusResult.nomNaissance || "-"}</p>
                        <p><span className="font-semibold">Nom usage:</span> {statusResult.nomUsage || "-"}</p>
                        <p><span className="font-semibold">Prenoms:</span> {statusResult.prenoms || "-"}</p>
                        <p><span className="font-semibold">idClient:</span> {statusResult.idClient || "-"}</p>
                      </div>
                    </div>

                      <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-stone-900">M050 - Demande de paiement</p>
                            <p className="text-sm text-stone-500">
                              Utilisez cette zone pour produire les captures et les traces du cahier de tests.
                            </p>
                            {statusResult?.statut?.description ? (
                              <p className="mt-2 text-xs font-medium text-amber-700">
                                Date de reference M020 : {statusResult.statut.description}
                              </p>
                            ) : null}
                          </div>
                          <Button
                          onClick={() => setShowPaymentForm((current) => !current)}
                          disabled={!selectedClient.studentId}
                          className="rounded-full bg-amber-600 hover:bg-amber-700"
                        >
                          <Landmark className="mr-2 h-4 w-4" />
                          {showPaymentForm ? "Fermer" : "Transmettre une DP"}
                        </Button>
                      </div>

                      {!selectedClient.studentId ? (
                        <p className="mt-4 text-sm text-rose-700">Ce client URSSAF n&apos;est relie a aucun eleve dans la base.</p>
                      ) : null}

                      {showPaymentForm ? (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <label className="space-y-2">
                            <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Montant TTC</span>
                            <Input value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} type="number" step="0.01" className="rounded-2xl border-stone-200" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Reference facture</span>
                            <Input value={paymentFactureRef} onChange={(event) => setPaymentFactureRef(event.target.value)} placeholder="FACT-TEST-001" className="rounded-2xl border-stone-200" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Date debut emploi</span>
                            <Input value={paymentDateDebut} onChange={(event) => setPaymentDateDebut(event.target.value)} type="datetime-local" className="rounded-2xl border-stone-200" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Date fin emploi</span>
                            <Input value={paymentDateFin} onChange={(event) => setPaymentDateFin(event.target.value)} type="datetime-local" className="rounded-2xl border-stone-200" />
                          </label>
                          <label className="space-y-2 md:col-span-2">
                            <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">SIRET intervenant</span>
                            <Input value={paymentSiret} onChange={(event) => setPaymentSiret(event.target.value)} placeholder="75292984400039" className="rounded-2xl border-stone-200" />
                          </label>

                          <div className="md:col-span-2 flex gap-3">
                            <Button onClick={() => void submitPayment()} disabled={paymentLoading} className="rounded-full bg-stone-900 hover:bg-stone-800">
                              {paymentLoading ? "Transmission..." : "Envoyer la demande"}
                            </Button>
                            <Button variant="outline" onClick={() => setShowPaymentForm(false)} className="rounded-full border-stone-200">
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {paymentError ? (
                        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
                          {paymentError}
                        </div>
                      ) : null}

                      {paymentResult ? (
                        <div className="mt-4 space-y-3">
                          {paymentResult.map((item, index) => (
                            <div key={index} className={`rounded-2xl border px-4 py-4 text-sm ${getPaymentResultTone(item)}`}>
                              <p className="font-semibold">
                                {Array.isArray(item?.errors) && item.errors.length > 0 ? "Transmission rejetee" : "Transmission reussie"}
                              </p>
                              <p className="mt-2">Facture: {item?.numFactureTiers || "-"}</p>
                              <p>ID demande: {item?.idDemandePaiement || "En attente"}</p>
                              <p>Statut: {item?.statut || "-"}</p>
                              {Array.isArray(item?.errors) && item.errors.length > 0 ? (
                                <div className="mt-3 space-y-2">
                                  {item.errors.map((error: any, errorIndex: number) => (
                                    <div key={`${error?.code || "err"}-${errorIndex}`} className="rounded-xl bg-white/70 px-3 py-3">
                                      <p className="font-semibold">{error?.code || "Erreur URSSAF"}</p>
                                      <p className="mt-1">{error?.message || "-"}</p>
                                      {error?.description ? <p className="mt-1 text-xs opacity-80">{error.description}</p> : null}
                                      {error?.code === "ERR_LIEN_PARTICULIER_PRESTATAIRE" && statusResult?.statut?.description ? (
                                        <p className="mt-2 text-xs font-medium text-amber-800">
                                          Reprenez M020 puis utilisez une periode d&apos;emploi posterieure a : {statusResult.statut.description}
                                        </p>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="rounded-3xl border border-stone-100 bg-stone-50 p-5">
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Vue globale</p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-900">Toutes les demandes URSSAF stockees</h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
                  Cette liste reprend les demandes creees depuis les fiches eleves: reference facture, eleve, statut,
                  montant, API id et dernieres synchronisations M070.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => void loadStoredRequests()} className="rounded-full border-stone-200">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {isLoadingStoredRequests ? "Chargement..." : "Actualiser"}
                </Button>
                <Button onClick={() => void syncAllStoredRequests()} disabled={isSyncingAllRequests} className="rounded-full bg-stone-900 hover:bg-stone-800">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {isSyncingAllRequests ? "Synchronisation..." : "Synchroniser tout M070"}
                </Button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {isLoadingStoredRequests ? (
                <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-500">
                  Chargement des demandes URSSAF...
                </div>
              ) : storedRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-500">
                  Aucune demande URSSAF stockee pour le moment.
                </div>
              ) : (
                storedRequests.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-stone-900">{item.numFactureTiers}</p>
                        <p className="mt-1 text-sm text-stone-500">
                          Eleve: {item.studentName} {item.urssafClientEmail ? `· ${item.urssafClientEmail}` : ""}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          API id: {item.idDemandePaiement || "En attente"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusTone(item.statutCode || undefined)}`}>
                          {getStatusLabel(item.statutCode || undefined, item.statutLabel || undefined)}
                          {item.statutCode ? ` (${item.statutCode})` : ""}
                        </span>
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-700">
                          {item.amountTtc.toFixed(2)} EUR
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <div className="rounded-2xl bg-stone-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase text-stone-400">Periode emploi</p>
                        <p className="mt-2 text-sm font-semibold text-stone-900">
                          {new Date(item.dateDebutEmploi).toLocaleDateString("fr-FR")} au {new Date(item.dateFinEmploi).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-stone-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase text-stone-400">Date facture</p>
                        <p className="mt-2 text-sm font-semibold text-stone-900">
                          {new Date(item.dateFacture).toLocaleString("fr-FR")}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-stone-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase text-stone-400">Derniere sync</p>
                        <p className="mt-2 text-sm font-semibold text-stone-900">
                          {item.lastSyncedAt ? new Date(item.lastSyncedAt).toLocaleString("fr-FR") : "Jamais"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-stone-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase text-stone-400">Cours rattaches</p>
                        <p className="mt-2 text-sm font-semibold text-stone-900">{item.lessons.length}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 border-b border-stone-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">M070</p>
              <h3 className="mt-2 text-2xl font-semibold text-stone-900">Recherche des demandes de paiement</h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
                Recherchez une facture URSSAF par reference ou par periode pour produire les preuves de tests.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-6 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Numero de facture tiers</span>
              <Input
                value={searchFactureRef}
                onChange={(event) => {
                  setSearchFactureRef(event.target.value);
                  if (event.target.value) {
                    setSearchDateDebut("");
                    setSearchDateFin("");
                  }
                }}
                placeholder="FACT-TEST-001"
                className="rounded-2xl border-stone-200 bg-white"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Date debut</span>
                <Input
                  value={searchDateDebut}
                  onChange={(event) => {
                    setSearchDateDebut(event.target.value);
                    if (event.target.value) {
                      setSearchFactureRef("");
                    }
                  }}
                  type="datetime-local"
                  className="rounded-2xl border-stone-200 bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Date fin</span>
                <Input
                  value={searchDateFin}
                  onChange={(event) => {
                    setSearchDateFin(event.target.value);
                    if (event.target.value) {
                      setSearchFactureRef("");
                    }
                  }}
                  type="datetime-local"
                  className="rounded-2xl border-stone-200 bg-white"
                />
              </label>
            </div>

            <div className="lg:col-span-2">
              <Button onClick={() => void searchPayments()} disabled={searchLoading} className="rounded-full bg-stone-900 hover:bg-stone-800">
                <Search className="mr-2 h-4 w-4" />
                {searchLoading ? "Recherche..." : "Lancer la recherche"}
              </Button>
            </div>
          </div>

          {searchError ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
              {searchError}
            </div>
          ) : null}

          {searchResult?.Errors?.length ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
              <p className="font-semibold">Avertissements URSSAF</p>
              <ul className="mt-3 space-y-2">
                {searchResult.Errors.map((error, index) => (
                  <li key={`${error.code}-${index}`}>
                    [{error.code}] {getFriendlyErrorMessage(error.code, error.message || error.description || error.code)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {searchResult ? (
            <div className="mt-6 space-y-4">
              {searchResult.infoDemandePaiements && searchResult.infoDemandePaiements.length > 0 ? (
                searchResult.infoDemandePaiements.map((item, index) => (
                  <div key={`${item.idDemandePaiement ?? item.demandePaiement?.numFactureTiers ?? index}`} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-stone-900">
                          Facture {item.demandePaiement?.numFactureTiers || "Sans reference"}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          idClient: {item.demandePaiement?.idClient || "-"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusTone(item.statut?.code)}`}>
                          {getStatusLabel(item.statut?.code, item.statut?.libelle)}
                          {item.statut?.code ? ` (${item.statut.code})` : ""}
                        </span>
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-700">
                          {item.demandePaiement?.mntFactureTTC || 0} EUR
                        </span>
                      </div>
                    </div>

                    {item.idDemandePaiement ? (
                      <p className="mt-4 text-sm text-stone-600">
                        API id: <span className="font-mono text-stone-900">{item.idDemandePaiement}</span>
                      </p>
                    ) : null}

                    {item.infoRejet ? (
                      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
                        <p className="font-semibold">Rejet {item.infoRejet.code || ""}</p>
                        <p className="mt-1">{item.infoRejet.commentaire || "Aucun commentaire fourni."}</p>
                      </div>
                    ) : null}

                    {item.infoVirement ? (
                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                        <p className="font-semibold">Virement</p>
                        <p className="mt-1">Montant: {item.infoVirement.mntVirement || 0} EUR</p>
                        <p>Date: {item.infoVirement.dateVirement || "-"}</p>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
                  Aucune demande de paiement trouvee pour ces criteres.
                </div>
              )}
            </div>
          ) : null}
        </section>
      )}

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <FileText className="mt-1 h-5 w-5 text-amber-600" />
          <div className="space-y-2 text-sm text-stone-600">
            <p className="font-semibold text-stone-900">Checklist avant envoi a l&apos;URSSAF</p>
            <p>1. Capture de l&apos;ecran d&apos;inscription M010 depuis la fiche eleve.</p>
            <p>2. Capture de l&apos;ecran M020 / M050 ici apres inscription.</p>
            <p>3. Capture de l&apos;ecran M070 avec une recherche reussie.</p>
            <p>4. Recuperez dans les logs serveur les blocs TRACE API pour M010, M020, M050 et M070.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Traces live</p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-900">Requetes / reponses URSSAF lisibles</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
              Ce panneau garde les derniers appels OAuth et metier pour vous aider a faire le cahier de tests sans
              dependre uniquement du terminal.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => void loadTraces()} className="rounded-full border-stone-200">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
            <Button variant="outline" onClick={() => void clearTraces()} className="rounded-full border-stone-200">
              Vider les traces
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {isLoadingTraces ? (
            <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-500">
              Chargement des traces...
            </div>
          ) : traceItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-sm text-stone-500">
              Aucune trace pour le moment. Lancez M010, M020, M050 ou M070 puis actualisez.
            </div>
          ) : (
            traceItems.map((trace) => (
              <div key={trace.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex flex-col gap-3 border-b border-stone-200 pb-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      {trace.method}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-stone-700">
                      {trace.phase}
                    </span>
                    {typeof trace.status === "number" ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-stone-700">
                        HTTP {trace.status}
                      </span>
                    ) : null}
                    <span className="text-sm font-semibold text-stone-900">{trace.label}</span>
                  </div>
                  <span className="text-xs text-stone-500">
                    {new Date(trace.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-white p-4 text-xs leading-6 text-stone-700">
                  {trace.payload}
                </pre>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
