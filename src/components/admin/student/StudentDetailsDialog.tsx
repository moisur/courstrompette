"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentDetail } from "@/hooks/use-student-detail";
import { StudentOverviewCards } from "./StudentOverviewCards";
import { StudentPacksSection } from "./StudentPacksSection";
import { StudentLessonsSection } from "./StudentLessonsSection";
import { AddLessonDialog } from "../lesson/AddLessonDialog";
import { StudentPackDialog } from "./StudentPackDialog";
import { UrssafEnrollmentForm } from "../urssaf/UrssafEnrollmentForm";
import InvoiceForm from "../invoice/InvoiceForm";
import InvoicePreview from "../invoice/InvoicePreview";
import AttestationPreview from "../invoice/AttestationPreview";
import { InvoiceData } from "@/lib/types/invoice";
import { CheckCircle2, FileDown, Landmark, Plus, RotateCcw, ShieldCheck, UserCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, toErrorMessage } from "@/lib/client-api";

interface StudentDetailsDialogProps {
  studentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

interface UrssafPaymentRequestRecord {
  id: string;
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
  lessons: Array<{
    id: string;
    date: string;
    amount: number;
    comment?: string | null;
    isPaid: boolean;
  }>;
}

function isUrssafErrorRequest(requestItem: UrssafPaymentRequestRecord) {
  return Boolean(
    !requestItem.idDemandePaiement ||
      (requestItem.statutCode && (requestItem.statutCode.startsWith("ERR_") || ["40", "60", "110", "111", "112", "113", "260"].includes(requestItem.statutCode))),
  );
}

async function downloadPdf(elementId: string, filename: string) {
  const html2pdf = (await import("html2pdf.js")).default;
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Cible PDF introuvable");

  await html2pdf()
    .set({
      margin: [1, 1, 1, 1],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .save();
}

export function StudentDetailsDialog({
  studentId,
  open,
  onOpenChange,
  onRefresh,
}: StudentDetailsDialogProps) {
  const { toast } = useToast();
  const {
    student,
    lessons,
    packs,
    activePacks,
    totalPaid,
    totalDue,
    totalRemainingLessons,
    refresh,
    toggleDeclared,
    createPack,
    updateStudent,
    deleteStudent,
    deletePack,
    setLessonPaid,
    deleteLesson,
    payLessonsWithPack,
  } = useStudentDetail(studentId || "");

  const [activeTab, setActiveTab] = useState("overview");
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddPack, setShowAddPack] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isTogglingArchive, setIsTogglingArchive] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [packPaymentLessonId, setPackPaymentLessonId] = useState<string | null>(null);
  const [selectedPackId, setSelectedPackId] = useState("");
  const [isApplyingPack, setIsApplyingPack] = useState(false);
  const [urssafRequests, setUrssafRequests] = useState<UrssafPaymentRequestRecord[]>([]);
  const [isLoadingUrssafRequests, setIsLoadingUrssafRequests] = useState(false);
  const [isSubmittingUrssafLessons, setIsSubmittingUrssafLessons] = useState(false);
  const [isSyncingUrssafRequests, setIsSyncingUrssafRequests] = useState(false);
  const [reopeningRequestId, setReopeningRequestId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    courseDay: "",
    courseHour: "",
    rate: "",
    notes: "",
  });

  useEffect(() => {
    if (!student) {
      return;
    }

    setProfileForm({
      name: student.name ?? "",
      phone: student.phone ?? "",
      address: student.address ?? "",
      courseDay: student.courseDay ?? "",
      courseHour: student.courseHour ?? "",
      rate: student.rate ? String(student.rate) : "",
      notes: student.notes ?? "",
    });
  }, [student]);

  useEffect(() => {
    setInvoiceData(null);
  }, [studentId]);

  useEffect(() => {
    setUrssafRequests([]);
  }, [studentId]);

  useEffect(() => {
    if (activePacks[0] && !selectedPackId) {
      setSelectedPackId(activePacks[0].id);
    }
  }, [activePacks, selectedPackId]);

  const updateProfileField = (field: keyof typeof profileForm, value: string) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleDownload = async (type: "invoice" | "attestation") => {
    if (!invoiceData) return;

    setIsGeneratingPdf(true);
    try {
      const elementId = type === "invoice" ? "invoice-preview" : "attestation-preview";
      const filename = `${type}-${student?.name}-${new Date().toISOString().split("T")[0]}.pdf`;
      await downloadPdf(elementId, filename);
      toast({ title: "Succes", description: "Le document a ete genere" });
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Echec de generation PDF" });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    const didSave = await updateStudent({
      name: profileForm.name.trim() || student?.name,
      phone: profileForm.phone.trim() || null,
      address: profileForm.address.trim() || null,
      courseDay: profileForm.courseDay.trim() || null,
      courseHour: profileForm.courseHour.trim() || null,
      notes: profileForm.notes.trim() || null,
      rate: profileForm.rate.trim() || undefined,
    });
    setIsSavingProfile(false);

    if (didSave) {
      onRefresh?.();
    }
  };

  const handleToggleDeclared = async () => {
    const didToggle = await toggleDeclared();
    if (didToggle) {
      onRefresh?.();
    }
  };

  const handleToggleArchive = async () => {
    if (!student) {
      return;
    }

    setIsTogglingArchive(true);
    const didUpdate = await updateStudent({
      archived: !student.archived,
    });
    setIsTogglingArchive(false);

    if (didUpdate) {
      onRefresh?.();
    }
  };

  const handleDeleteStudent = async () => {
    if (!student) {
      return;
    }

    setIsDeletingStudent(true);
    const didDelete = await deleteStudent();
    setIsDeletingStudent(false);

    if (didDelete) {
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
      onRefresh?.();
    }
  };

  const handleApplyPack = async () => {
    if (!packPaymentLessonId || !selectedPackId) {
      return;
    }

    setIsApplyingPack(true);
    const didApply = await payLessonsWithPack(selectedPackId, [packPaymentLessonId]);
    setIsApplyingPack(false);

    if (didApply) {
      setPackPaymentLessonId(null);
      onRefresh?.();
    }
  };

  const loadUrssafRequests = useCallback(async () => {
    if (!studentId) {
      return;
    }

    setIsLoadingUrssafRequests(true);
    try {
      const data = await apiRequest<UrssafPaymentRequestRecord[]>(`/api/admin/students/${studentId}/urssaf/payment-requests`);
      setUrssafRequests(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de charger les demandes URSSAF"),
      });
    } finally {
      setIsLoadingUrssafRequests(false);
    }
  }, [studentId, toast]);

  const handleSubmitUrssafLessons = async () => {
    if (!studentId) {
      return;
    }

    setIsSubmittingUrssafLessons(true);
    try {
      const result = await apiRequest<{
        numFactureTiers?: string | null;
        statutCode?: string | null;
        statutLabel?: string | null;
      }>(`/api/admin/students/${studentId}/urssaf/payment-requests`, {
        method: "POST",
      });
      await Promise.all([refresh(), loadUrssafRequests()]);
      onRefresh?.();
      toast({
        title: "Succes",
        description: result.numFactureTiers
          ? `Demande URSSAF envoyee: ${result.numFactureTiers}${result.statutCode ? ` (${result.statutCode})` : ""}`
          : "Les cours URSSAF en attente ont ete transmis.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de transmettre les cours URSSAF"),
      });
    } finally {
      setIsSubmittingUrssafLessons(false);
    }
  };

  const handleSyncUrssafRequests = async () => {
    if (!studentId) {
      return;
    }

    setIsSyncingUrssafRequests(true);
    try {
      await apiRequest(`/api/admin/students/${studentId}/urssaf/payment-requests/sync`, {
        method: "POST",
      });
      await Promise.all([refresh(), loadUrssafRequests()]);
      onRefresh?.();
      toast({
        title: "Succes",
        description: "Les statuts URSSAF ont ete resynchronises via M070.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de synchroniser les statuts URSSAF"),
      });
    } finally {
      setIsSyncingUrssafRequests(false);
    }
  };

  const handleReopenUrssafRequest = async (requestId: string) => {
    if (!studentId) {
      return;
    }

    setReopeningRequestId(requestId);
    try {
      await apiRequest(`/api/admin/students/${studentId}/urssaf/payment-requests/${requestId}/reopen`, {
        method: "POST",
      });
      await Promise.all([refresh(), loadUrssafRequests()]);
      onRefresh?.();
      toast({
        title: "Succes",
        description: "Les cours de cette demande URSSAF ont ete remis a envoyer.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible de remettre cette demande URSSAF a envoyer"),
      });
    } finally {
      setReopeningRequestId(null);
    }
  };

  useEffect(() => {
    if (!open || !studentId || activeTab !== "billing" || !student?.urssafClient) {
      return;
    }

    void loadUrssafRequests();
  }, [activeTab, loadUrssafRequests, open, studentId, student?.urssafClient]);

  if (!student) return null;

  const pendingUrssafLessons = lessons.filter(
    (lesson) => lesson.paymentMethod === "URSSAF" && !lesson.urssafPaymentRequest,
  );
  const transmittedUrssafLessons = lessons.filter(
    (lesson) =>
      lesson.paymentMethod === "URSSAF" &&
      lesson.urssafPaymentRequest &&
      !["70", "120", "270"].includes(lesson.urssafPaymentRequest.statutCode || ""),
  );
  const settledUrssafLessons = lessons.filter(
    (lesson) =>
      lesson.paymentMethod === "URSSAF" &&
      lesson.urssafPaymentRequest &&
      ["70", "120", "270"].includes(lesson.urssafPaymentRequest.statutCode || ""),
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="h-[90vh] w-[1400px] max-w-[95vw] overflow-hidden border-none bg-stone-50 p-0">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-6 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-full bg-stone-100 p-2 text-stone-600">
                <UserCircle2 size={32} />
              </div>
              <div className="min-w-0">
                <DialogTitle className="truncate text-2xl font-black text-stone-900">{student.name}</DialogTitle>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    {student.user?.email || student.email || "Pas d'email"}
                  </span>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={() => void handleToggleDeclared()}
                    className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-black uppercase transition-colors ${
                      student.declared
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-stone-200 bg-stone-100 text-stone-400 hover:border-amber-200 hover:text-amber-600"
                    }`}
                  >
                    {student.declared ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {student.declared ? "Declare" : "Non declare"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                onClick={() => void handleToggleArchive()}
                variant="outline"
                disabled={isTogglingArchive}
                className="rounded-xl border-stone-200 font-bold text-stone-700 hover:bg-stone-50"
              >
                {isTogglingArchive ? "Mise a jour..." : student.archived ? "Desarchiver" : "Archiver"}
              </Button>
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="outline"
                className="rounded-xl border-rose-200 font-bold text-rose-700 hover:bg-rose-50"
              >
                Supprimer
              </Button>
              <Button
                onClick={() => setShowAddLesson(true)}
                variant="outline"
                className="rounded-xl border-stone-200 font-bold text-stone-700 hover:bg-stone-50"
              >
                <Plus size={16} className="mr-1.5" /> Ajouter un cours
              </Button>
              <Button
                onClick={() => setShowAddPack(true)}
                variant="outline"
                className="rounded-xl border-stone-200 font-bold text-stone-700 hover:bg-stone-50"
              >
                <Plus size={16} className="mr-1.5" /> Nouveau pack
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="shrink-0 border-b border-stone-200 bg-white px-6">
                <TabsList className="h-12 gap-8 bg-transparent">
                  <TabsTrigger value="overview" className="h-12 rounded-none border-b-4 border-transparent text-xs font-black uppercase tracking-widest text-stone-500 data-[state=active]:border-amber-600 data-[state=active]:bg-transparent data-[state=active]:text-stone-900 data-[state=active]:shadow-none">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="invoice" className="h-12 rounded-none border-b-4 border-transparent text-xs font-black uppercase tracking-widest text-stone-500 data-[state=active]:border-amber-600 data-[state=active]:bg-transparent data-[state=active]:text-stone-900 data-[state=active]:shadow-none">
                    Facture
                  </TabsTrigger>
                  <TabsTrigger value="attestation" className="h-12 rounded-none border-b-4 border-transparent text-xs font-black uppercase tracking-widest text-stone-500 data-[state=active]:border-amber-600 data-[state=active]:bg-transparent data-[state=active]:text-stone-900 data-[state=active]:shadow-none">
                    Attestation fiscale
                  </TabsTrigger>
                  <TabsTrigger value="billing" className="h-12 rounded-none border-b-4 border-transparent text-xs font-black uppercase tracking-widest text-stone-500 data-[state=active]:border-amber-600 data-[state=active]:bg-transparent data-[state=active]:text-stone-900 data-[state=active]:shadow-none">
                    Urssaf AI
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200">
                <TabsContent value="overview" className="mt-0 space-y-8 p-6">
                  <StudentOverviewCards
                    student={student}
                    lessons={lessons}
                    totalDue={totalDue}
                    totalPaid={totalPaid}
                    totalRemainingLessons={totalRemainingLessons}
                  />

                  <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 md:flex-row md:items-end md:justify-between">
                      <div>
                        <h3 className="text-lg font-black text-stone-900">Fiche eleve</h3>
                        <p className="mt-1 text-sm font-medium text-stone-500">
                          Modifiez les informations admin, puis enregistrez pour retrouver ces changements partout dans l app.
                        </p>
                      </div>
                      <Button
                        onClick={() => void handleSaveProfile()}
                        disabled={isSavingProfile}
                        className="rounded-full bg-stone-900 px-6 font-black text-white hover:bg-stone-800"
                      >
                        {isSavingProfile ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Nom</span>
                        <input
                          value={profileForm.name}
                          onChange={(event) => updateProfileField("name", event.target.value)}
                          className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-medium text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Telephone</span>
                        <input
                          value={profileForm.phone}
                          onChange={(event) => updateProfileField("phone", event.target.value)}
                          className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-medium text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Jour du cours</span>
                        <input
                          value={profileForm.courseDay}
                          onChange={(event) => updateProfileField("courseDay", event.target.value)}
                          placeholder="Lundi"
                          className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-medium text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Heure</span>
                        <input
                          value={profileForm.courseHour}
                          onChange={(event) => updateProfileField("courseHour", event.target.value)}
                          placeholder="18h30 ou 18:30"
                          className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-medium text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                        />
                      </label>

                      <label className="space-y-2 md:col-span-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Adresse</span>
                        <input
                          value={profileForm.address}
                          onChange={(event) => updateProfileField("address", event.target.value)}
                          className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-medium text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Tarif</span>
                        <input
                          value={profileForm.rate}
                          onChange={(event) => updateProfileField("rate", event.target.value)}
                          inputMode="decimal"
                          className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-medium text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                        />
                      </label>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                      <label className="space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Notes</span>
                        <textarea
                          value={profileForm.notes}
                          onChange={(event) => updateProfileField("notes", event.target.value)}
                          rows={5}
                          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                        />
                      </label>

                      <div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Contact source</p>
                          <p className="mt-2 text-sm font-semibold text-stone-900">{student.email || "Pas d'email"}</p>
                          <p className="mt-1 text-xs text-stone-500">
                            {student.experience ? `Niveau formulaire: ${student.experience}` : "Aucun niveau formulaire"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <p className="text-sm font-black text-stone-900">Etat CRM</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                                student.archived
                                  ? "border-stone-200 bg-stone-100 text-stone-500"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {student.archived ? "Archive" : "Actif"}
                            </span>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                                student.declared
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-stone-200 bg-stone-100 text-stone-500"
                              }`}
                            >
                              {student.declared ? "Declare" : "Non declare"}
                            </span>
                          </div>
                          <p className="mt-3 text-xs text-stone-500">
                            Le bouton d archivage en haut applique la modification immediatement.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <StudentLessonsSection
                        lessons={lessons}
                        activePacks={activePacks}
                        onOpenPayWithPack={(id) => {
                          setPackPaymentLessonId(id);
                          if (activePacks[0]) {
                            setSelectedPackId(activePacks[0].id);
                          }
                        }}
                        onTogglePayment={setLessonPaid}
                        onDeleteLesson={(id) => void deleteLesson(id)}
                      />
                    </div>
                    <div className="space-y-8">
                      <StudentPacksSection packs={packs} onDeletePack={(id) => void deletePack(id)} />
                      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                        <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-stone-900">
                          Notes et observations
                        </h4>
                        <div className="min-h-[100px] rounded-2xl bg-stone-50 p-4 text-sm italic text-stone-600">
                          {student.notes || "Aucune note pour cet eleve."}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="invoice" className="mt-0 h-full">
                  <div className="flex h-full flex-col lg:flex-row">
                    <div className="flex-1 overflow-y-auto border-r border-stone-200 bg-white p-6">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-xl font-black leading-none text-stone-900">Modifier la facture</h3>
                        <Button
                          onClick={() => void handleDownload("invoice")}
                          disabled={!invoiceData || isGeneratingPdf}
                          className="h-10 rounded-full bg-amber-600 px-6 font-bold text-white hover:bg-amber-700"
                        >
                          <FileDown size={18} className="mr-2" />
                          {isGeneratingPdf ? "Generation..." : "Telecharger PDF"}
                        </Button>
                      </div>
                      <InvoiceForm
                        onUpdate={setInvoiceData}
                        studentId={student.id}
                        studentRate={Number(student.rate)}
                        initialData={{ clientName: student.name, clientAddress: student.address || "" }}
                      />
                    </div>
                    <div className="flex flex-1 justify-center overflow-y-auto bg-stone-100 p-8">
                      <div id="invoice-preview" className="h-fit bg-white shadow-2xl">
                        <InvoicePreview
                          data={
                            invoiceData || {
                              companyName: "Jean-Christophe Yervant",
                              companyAddress: "9 r de la Fontaine au Roi, 75011 Paris",
                              siret: "75292984400039",
                              agreementNumber: "SAP752929844",
                              clientName: student.name,
                              clientAddress: student.address || "",
                              invoiceNumber: "DEMO-",
                              invoiceDate: new Date().toISOString(),
                              services: [],
                              paymentMethod: "Virement",
                              totalAmountPaid: 0,
                              showAgreementInfo: true,
                            }
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="attestation" className="mt-0 h-full">
                  <div className="flex h-full flex-col lg:flex-row">
                    <div className="flex-1 overflow-y-auto border-r border-stone-200 bg-white p-6">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-xl font-black leading-none text-stone-900">Attestation fiscale</h3>
                        <Button
                          onClick={() => void handleDownload("attestation")}
                          disabled={!invoiceData || isGeneratingPdf}
                          className="h-10 rounded-full bg-stone-900 px-6 font-bold text-white hover:bg-stone-800"
                        >
                          <FileDown size={18} className="mr-2" />
                          {isGeneratingPdf ? "Generation..." : "Telecharger PDF"}
                        </Button>
                      </div>
                      <InvoiceForm
                        onUpdate={setInvoiceData}
                        studentId={student.id}
                        studentRate={Number(student.rate)}
                        initialData={{ clientName: student.name, clientAddress: student.address || "" }}
                      />
                    </div>
                    <div className="flex flex-1 justify-center overflow-y-auto bg-stone-100 p-8">
                      <div id="attestation-preview" className="h-fit bg-white shadow-2xl">
                        <AttestationPreview
                          data={
                            invoiceData || {
                              companyName: "Jean-Christophe Yervant",
                              companyAddress: "9 r de la Fontaine au Roi, 75011 Paris",
                              siret: "75292984400039",
                              agreementNumber: "SAP752929844",
                              clientName: student.name,
                              clientAddress: student.address || "",
                              invoiceNumber: "DEMO-",
                              invoiceDate: new Date().toISOString(),
                              services: [],
                              paymentMethod: "Virement",
                              totalAmountPaid: 0,
                              showAgreementInfo: true,
                              attestationYear: String(new Date().getFullYear() - 1),
                            }
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="billing" className="mt-0 space-y-6 p-6">
                  <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-stone-200 bg-stone-50 px-6 py-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-black text-stone-900">
                        <ShieldCheck size={20} className="text-amber-600" />
                        Avance Immediate (CESU / API-EDI)
                      </h3>
                      <p className="text-sm font-medium text-stone-500">
                        Gestion automatisee du credit d impot instantane via API de confiance.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full border border-dashed px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                          student.urssafClient
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {student.urssafClient ? "Inscrit API-EDI" : "Non inscrit API"}
                      </div>
                    </div>
                  </div>

                  {!student.urssafClient ? (
                    <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                      <div className="mx-auto max-w-3xl">
                        <div className="mb-8">
                          <h4 className="mb-2 text-xl font-black tracking-tight text-stone-900">
                            Inscription au service
                          </h4>
                          <p className="text-sm leading-relaxed text-stone-500">
                            Remplissez le formulaire ci-dessous pour inscrire cet eleve au service Avance Immediate de l URSSAF.
                          </p>
                        </div>
                        <UrssafEnrollmentForm
                          studentId={student.id}
                          initialData={{
                            name: student.name,
                            email: student.user?.email || student.email || undefined,
                            phone: student.phone || undefined,
                          }}
                          onSuccess={() => {
                            void refresh();
                            onRefresh?.();
                          }}
                        />
                      </div>
                    </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
                          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-3 border-b border-stone-100 pb-4">
                              <div className="rounded-xl bg-stone-100 p-2 text-stone-500">
                                <Landmark size={20} />
                              </div>
                              <h4 className="text-xs font-black uppercase tracking-widest text-stone-900">
                                Identifiants URSSAF
                              </h4>
                            </div>
                            <div className="space-y-4">
                              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                                <p className="mb-1 text-[10px] font-bold uppercase text-stone-400">ID client unique</p>
                                <p className="font-mono text-lg font-bold text-stone-900">{student.urssafClient.id}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl bg-stone-50/50 p-3">
                                  <p className="text-[10px] font-bold uppercase text-stone-400">Etat civil</p>
                                  <p className="truncate text-sm font-black italic text-stone-900">
                                    {student.urssafClient.prenoms}
                                  </p>
                                </div>
                                <div className="rounded-xl bg-stone-50/50 p-3">
                                  <p className="text-[10px] font-bold uppercase text-stone-400">Email certifie</p>
                                  <p className="truncate text-sm font-black text-stone-900">
                                    {student.urssafClient.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-3xl border border-stone-900 bg-stone-900 p-6 text-white shadow-xl shadow-stone-200">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-amber-300">
                                  Cours URSSAF
                                </p>
                                <h4 className="mt-2 text-2xl font-black tracking-tight">
                                  Pilotage clair depuis la fiche eleve
                                </h4>
                                <p className="mt-2 max-w-2xl text-sm text-stone-300">
                                  Une fois l eleve inscrit a l URSSAF, vous n avez plus a refaire le formulaire M010. Vous
                                  pouvez creer des cours en mode URSSAF dans cette fiche, puis les transmettre en demande de
                                  paiement groupee et suivre leur reglement via M070.
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <Button
                                  onClick={() => void handleSubmitUrssafLessons()}
                                  disabled={isSubmittingUrssafLessons || pendingUrssafLessons.length === 0}
                                  className="rounded-full bg-amber-600 font-black text-white hover:bg-amber-700"
                                >
                                  {isSubmittingUrssafLessons
                                    ? "Transmission..."
                                    : `Envoyer ${pendingUrssafLessons.length} cours URSSAF`}
                                </Button>
                                <Button
                                  onClick={() => void handleSyncUrssafRequests()}
                                  disabled={isSyncingUrssafRequests}
                                  variant="outline"
                                  className="rounded-full border-stone-600 bg-transparent font-black text-white hover:bg-stone-800"
                                >
                                  {isSyncingUrssafRequests ? "Synchronisation..." : "Synchroniser M070"}
                                </Button>
                              </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl bg-white/5 px-4 py-4">
                                <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Cours a envoyer</p>
                                <p className="mt-2 text-3xl font-black text-white">{pendingUrssafLessons.length}</p>
                              </div>
                              <div className="rounded-2xl bg-white/5 px-4 py-4">
                                <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Demandes en cours</p>
                                <p className="mt-2 text-3xl font-black text-white">{transmittedUrssafLessons.length}</p>
                              </div>
                              <div className="rounded-2xl bg-white/5 px-4 py-4">
                                <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Cours regles URSSAF</p>
                                <p className="mt-2 text-3xl font-black text-white">{settledUrssafLessons.length}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                          <div className="flex flex-col gap-4 border-b border-stone-100 pb-4 md:flex-row md:items-end md:justify-between">
                            <div>
                              <h4 className="text-lg font-black text-stone-900">Demandes de paiement URSSAF</h4>
                              <p className="mt-1 text-sm text-stone-500">
                                Groupement par defaut : meme eleve + meme mois = 1 demande de paiement.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => void loadUrssafRequests()}
                              disabled={isLoadingUrssafRequests}
                              className="rounded-full border-stone-200"
                            >
                              {isLoadingUrssafRequests ? "Chargement..." : "Actualiser"}
                            </Button>
                          </div>

                          <div className="mt-5 space-y-4">
                            {urssafRequests.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
                                Aucune demande URSSAF stockee pour cet eleve pour le moment.
                              </div>
                            ) : (
                              urssafRequests.map((requestItem) => (
                                <div key={requestItem.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                      <p className="text-lg font-semibold text-stone-900">{requestItem.numFactureTiers}</p>
                                      <p className="mt-1 text-sm text-stone-500">
                                        API id: {requestItem.idDemandePaiement || "En attente"}
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                                        requestItem.statutCode && ["70", "120", "270", "30", "50"].includes(requestItem.statutCode)
                                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                          : requestItem.statutCode && ["40", "60", "110", "111", "112", "113", "260"].includes(requestItem.statutCode)
                                            ? "border-rose-200 bg-rose-50 text-rose-800"
                                            : requestItem.statutCode && ["10", "20"].includes(requestItem.statutCode)
                                              ? "border-amber-200 bg-amber-50 text-amber-800"
                                              : "border-stone-200 bg-stone-100 text-stone-600"
                                      }`}>
                                        {requestItem.statutCode && ["70", "120", "270"].includes(requestItem.statutCode) ? (
                                          <CheckCircle2 size={12} />
                                        ) : requestItem.statutCode && ["40", "60", "110", "111", "112", "113", "260"].includes(requestItem.statutCode) ? (
                                          <XCircle size={12} />
                                        ) : (
                                          <Landmark size={12} />
                                        )}
                                        {requestItem.statutLabel || "Sans statut"}
                                        {requestItem.statutCode ? ` (${requestItem.statutCode})` : ""}
                                      </span>
                                      <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-stone-700">
                                        {requestItem.amountTtc.toFixed(2)} EUR
                                      </span>
                                      {isUrssafErrorRequest(requestItem) ? (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => void handleReopenUrssafRequest(requestItem.id)}
                                          disabled={reopeningRequestId === requestItem.id}
                                          className="rounded-full border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                                        >
                                          <RotateCcw size={14} className="mr-2" />
                                          {reopeningRequestId === requestItem.id ? "Remise en attente..." : "Remettre a envoyer"}
                                        </Button>
                                      ) : null}
                                    </div>
                                  </div>

                                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                                    <div className="rounded-2xl bg-white px-4 py-3">
                                      <p className="text-[10px] font-bold uppercase text-stone-400">Periode emploi</p>
                                      <p className="mt-2 text-sm font-semibold text-stone-900">
                                        {new Date(requestItem.dateDebutEmploi).toLocaleDateString("fr-FR")} au{" "}
                                        {new Date(requestItem.dateFinEmploi).toLocaleDateString("fr-FR")}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl bg-white px-4 py-3">
                                      <p className="text-[10px] font-bold uppercase text-stone-400">Date facture</p>
                                      <p className="mt-2 text-sm font-semibold text-stone-900">
                                        {new Date(requestItem.dateFacture).toLocaleString("fr-FR")}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl bg-white px-4 py-3">
                                      <p className="text-[10px] font-bold uppercase text-stone-400">Derniere sync</p>
                                      <p className="mt-2 text-sm font-semibold text-stone-900">
                                        {requestItem.lastSyncedAt
                                          ? new Date(requestItem.lastSyncedAt).toLocaleString("fr-FR")
                                          : "Jamais"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-4 rounded-2xl border border-stone-200 bg-white px-4 py-4">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                                      Cours rattaches
                                    </p>
                                    {isUrssafErrorRequest(requestItem) ? (
                                      <p className="mt-2 text-xs text-rose-600">
                                        Cette demande a ete rejetee. Vous pouvez remettre ces cours a envoyer, puis relancer
                                        une transmission propre une fois la cause corrigee.
                                      </p>
                                    ) : null}
                                    <div className="mt-3 space-y-2">
                                      {requestItem.lessons.map((lesson) => (
                                        <div key={lesson.id} className="flex flex-col gap-1 rounded-xl bg-stone-50 px-3 py-3 text-sm text-stone-700 md:flex-row md:items-center md:justify-between">
                                          <div>
                                            <p className="font-semibold text-stone-900">
                                              {new Date(lesson.date).toLocaleDateString("fr-FR")} - {lesson.amount.toFixed(2)} EUR
                                            </p>
                                            <p className="text-xs text-stone-500">{lesson.comment || "Sans commentaire"}</p>
                                          </div>
                                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${lesson.isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                                            {lesson.isPaid ? "Regle" : "En attente"}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <AddLessonDialog
        isOpen={showAddLesson}
        onClose={() => setShowAddLesson(false)}
        students={[student]}
        preselectedStudentId={student.id}
        onLessonAdded={() => {
          void refresh();
          onRefresh?.();
        }}
      />

      <StudentPackDialog
        open={showAddPack}
        onOpenChange={setShowAddPack}
        onSubmit={createPack}
      />

      <Dialog open={Boolean(packPaymentLessonId)} onOpenChange={(nextOpen) => !nextOpen && setPackPaymentLessonId(null)}>
        <DialogContent className="sm:max-w-[420px] border-stone-200">
          <DialogTitle className="text-xl font-bold text-stone-900">Payer le cours avec un pack</DialogTitle>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-stone-500">Selectionnez le pack a debiter pour ce cours non paye.</p>
            <Select value={selectedPackId} onValueChange={setSelectedPackId}>
              <SelectTrigger className="rounded-2xl border-stone-200">
                <SelectValue placeholder="Choisir un pack" />
              </SelectTrigger>
              <SelectContent>
                {activePacks.map((pack) => (
                  <SelectItem key={pack.id} value={pack.id}>
                    {pack.totalLessons} cours - {pack.remainingLessons} restant(s)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                className="rounded-full border-stone-200"
                onClick={() => setPackPaymentLessonId(null)}
              >
                Annuler
              </Button>
              <Button
                onClick={() => void handleApplyPack()}
                disabled={!selectedPackId || isApplyingPack}
                className="rounded-full bg-stone-900 hover:bg-stone-800"
              >
                {isApplyingPack ? "Application..." : "Utiliser ce pack"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[480px] border-stone-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-stone-900">
              Supprimer definitivement cet eleve ?
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-stone-500">
              Cette action retire la fiche de l eleve, coupe les liaisons CRM et supprime aussi l acces eleve associe s il existe.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-rose-700">Eleve concerne</p>
            <p className="mt-2 text-lg font-semibold text-stone-900">{student.name}</p>
            <p className="mt-1 text-sm text-stone-600">
              {student.phone || "Pas de telephone"} · {student.email || "Pas d email"}
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-full border-stone-200"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => void handleDeleteStudent()}
              disabled={isDeletingStudent}
              className="rounded-full bg-rose-600 text-white hover:bg-rose-700"
            >
              {isDeletingStudent ? "Suppression..." : "Supprimer definitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
