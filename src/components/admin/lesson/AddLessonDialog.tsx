"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, toErrorMessage } from "@/lib/client-api";
import { CoursePack, Student } from "@/hooks/use-student-detail";
import { CalendarDays, CheckCircle2, Landmark, Loader2, MessageSquare, Music2, WalletCards, XCircle } from "lucide-react";

interface AddLessonDialogProps {
  students: Student[];
  isOpen: boolean;
  onClose: () => void;
  onLessonAdded: () => void | Promise<void>;
  preselectedStudentId?: string;
}

type PaymentMode = "urssaf" | "paid" | "unpaid" | "pack";

interface UrssafDPResult {
  numFactureTiers: string;
  idDemandePaiement?: string | null;
  statutCode?: string | null;
  statutLabel?: string | null;
}

interface LessonCreateResponse {
  lesson?: any;
  urssafDP?: UrssafDPResult | null;
  urssafDPError?: string;
  id?: string;
}

export function AddLessonDialog({
  students,
  isOpen,
  onClose,
  onLessonAdded,
  preselectedStudentId,
}: AddLessonDialogProps) {
  const [loading, setLoading] = useState(false);
  const [packs, setPacks] = useState<Record<string, CoursePack[]>>({});
  const [selectedStudent, setSelectedStudent] = useState("");
  const [lessonType, setLessonType] = useState<"full" | "half">("full");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("paid");
  const [selectedPackId, setSelectedPackId] = useState("");
  const [comment, setComment] = useState("");
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split("T")[0]);
  const [dpResult, setDpResult] = useState<{ success: boolean; data?: UrssafDPResult; error?: string } | null>(null);
  const { toast } = useToast();

  const fetchStudentPacks = useCallback(async (studentId: string) => {
    if (!studentId) {
      setPacks((current) => ({ ...current, [studentId]: [] }));
      return;
    }

    try {
      const data = await apiRequest<CoursePack[]>(`/api/admin/students/${studentId}/packs`);
      setPacks((current) => ({
        ...current,
        [studentId]: data.filter((pack) => Number(pack.remainingLessons) > 0),
      }));
    } catch (error) {
      console.error("Error loading packs", error);
      setPacks((current) => ({ ...current, [studentId]: [] }));
    }
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      void fetchStudentPacks(selectedStudent);
    }
  }, [fetchStudentPacks, selectedStudent]);

  const selectedStudentData = useMemo(
    () => (Array.isArray(students) ? students.find((student) => student.id === selectedStudent) ?? null : null),
    [selectedStudent, students],
  );

  const studentPacks = useMemo(
    () => (selectedStudent ? packs[selectedStudent] || [] : []),
    [packs, selectedStudent],
  );
  const hasActivePacks = studentPacks.length > 0;
  const hasUrssaf = Boolean(selectedStudentData?.hasUrssafClient || selectedStudentData?.urssafClient);

  // Auto-select URSSAF mode when an URSSAF student is chosen
  useEffect(() => {
    if (hasUrssaf) {
      setPaymentMode("urssaf");
    } else if (paymentMode === "urssaf") {
      setPaymentMode("paid");
    }
  }, [hasUrssaf]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedStudent(preselectedStudentId ?? "");
    setLessonType("full");
    setPaymentMode(preselectedStudentId ? "paid" : "paid"); // will be overridden by hasUrssaf effect
    setSelectedPackId("");
    setComment("");
    setLessonDate(new Date().toISOString().split("T")[0]);
    setDpResult(null);
  }, [isOpen, preselectedStudentId]);

  useEffect(() => {
    if (paymentMode === "pack" && !selectedPackId && studentPacks[0]) {
      setSelectedPackId(studentPacks[0].id);
    }
  }, [paymentMode, selectedPackId, studentPacks]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedStudent || !selectedStudentData) {
      return;
    }

    setLoading(true);
    setDpResult(null);
    const fullRate = Number(selectedStudentData.rate) || 0;
    const amount = lessonType === "full" ? fullRate : fullRate / 2;
    const packId = paymentMode === "pack" ? selectedPackId || studentPacks[0]?.id : undefined;

    const resolvedPaymentMethod =
      paymentMode === "urssaf"
        ? "URSSAF"
        : paymentMode === "pack"
          ? "PACK"
          : paymentMode === "paid"
            ? "DIRECT"
            : "MANUAL";

    try {
      const response = await apiRequest<LessonCreateResponse>(`/api/admin/students/${selectedStudent}/lessons`, {
        method: "POST",
        body: JSON.stringify({
          date: new Date(lessonDate).toISOString(),
          amount,
          comment: comment.trim() || undefined,
          isPaid: paymentMode === "paid" || paymentMode === "pack",
          packId,
          paymentMethod: resolvedPaymentMethod,
        }),
      });

      // Handle URSSAF DP result
      if (resolvedPaymentMethod === "URSSAF") {
        if (response.urssafDP) {
          setDpResult({ success: true, data: response.urssafDP });
          toast({
            title: "Cours ajouté + DP envoyée ✅",
            description: `Facture ${response.urssafDP.numFactureTiers} — ${response.urssafDP.statutLabel || "En attente"}`,
          });
        } else if (response.urssafDPError) {
          setDpResult({ success: false, error: response.urssafDPError });
          toast({
            variant: "destructive",
            title: "Cours créé mais DP échouée",
            description: response.urssafDPError,
          });
        } else {
          // No DP info — lesson created but no URSSAF response
          toast({
            title: "Cours ajouté",
            description: "La DP URSSAF sera envoyée ultérieurement.",
          });
        }
      } else {
        toast({ title: "Succes", description: "Cours ajoute avec succes" });
      }

      await onLessonAdded();

      // For non-URSSAF lessons, close immediately. For URSSAF, show result briefly.
      if (resolvedPaymentMethod !== "URSSAF") {
        onClose();
      } else {
        // Auto-close after 2s to let user see the DP result
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: toErrorMessage(error, "Impossible d'ajouter le cours"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] border-stone-200">
        <DialogHeader className="border-b border-stone-100 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <span className="rounded-lg bg-amber-100 p-1.5 text-amber-700">
              <Music2 size={18} />
            </span>
            Nouveau cours
            {hasUrssaf && (
              <span className="ml-auto rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700">
                URSSAF
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* DP Result overlay */}
        {dpResult && (
          <div className={`rounded-2xl border px-4 py-4 ${dpResult.success ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
            <div className="flex items-start gap-3">
              {dpResult.success ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 text-rose-600 shrink-0" />
              )}
              <div>
                {dpResult.success && dpResult.data ? (
                  <>
                    <p className="text-sm font-bold text-emerald-900">DP envoyée avec succès</p>
                    <p className="mt-1 text-xs text-emerald-700">
                      Facture : <span className="font-mono font-bold">{dpResult.data.numFactureTiers}</span>
                    </p>
                    {dpResult.data.idDemandePaiement && (
                      <p className="text-xs text-emerald-700">
                        ID demande : <span className="font-mono">{dpResult.data.idDemandePaiement}</span>
                      </p>
                    )}
                    <p className="text-xs text-emerald-700">
                      Statut : {dpResult.data.statutLabel || dpResult.data.statutCode || "En attente"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-rose-900">Erreur DP URSSAF</p>
                    <p className="mt-1 text-xs text-rose-700">{dpResult.error}</p>
                    <p className="mt-2 text-xs text-rose-600">Le cours a été créé. Vous pouvez relancer la DP depuis la fiche élève.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-stone-500">Eleve</Label>
            <Select
              value={selectedStudent}
              onValueChange={(value) => {
                setSelectedStudent(value);
                setSelectedPackId("");
                setDpResult(null);
              }}
            >
              <SelectTrigger className="border-stone-200 bg-stone-50">
                <SelectValue placeholder="Selectionner un eleve" />
              </SelectTrigger>
              <SelectContent>
                {students
                  .filter((student) => !student.archived)
                  .map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <span className="flex items-center gap-2">
                        {student.name} - {Number(student.rate)} EUR
                        {(student.hasUrssafClient || student.urssafClient) && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">URSSAF</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-xs font-bold uppercase text-stone-500">
              <CalendarDays size={12} /> Date du cours
            </Label>
            <Input
              type="date"
              value={lessonDate}
              onChange={(event) => setLessonDate(event.target.value)}
              required
              className="border-stone-200 bg-stone-50"
            />
          </div>

          {selectedStudentData ? (
            <div className="space-y-4 rounded-lg border border-stone-100 bg-stone-50 p-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Duree du cours</Label>
                <RadioGroup
                  value={lessonType}
                  onValueChange={(value) => setLessonType(value as "full" | "half")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="lesson-full" className="text-amber-600" />
                    <Label htmlFor="lesson-full" className="cursor-pointer text-sm">
                      Complet ({Number(selectedStudentData.rate)} EUR)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="half" id="lesson-half" className="text-amber-600" />
                    <Label htmlFor="lesson-half" className="cursor-pointer text-sm">
                      Demi ({Number(selectedStudentData.rate) / 2} EUR)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  <WalletCards size={10} /> Facturation
                </Label>
                <RadioGroup
                  value={paymentMode}
                  onValueChange={(value) => setPaymentMode(value as PaymentMode)}
                  className="space-y-2"
                >
                  {/* URSSAF option — only for URSSAF students, shown first */}
                  {hasUrssaf && (
                    <div className="flex items-center space-x-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                      <RadioGroupItem value="urssaf" id="payment-urssaf" className="text-blue-600" />
                      <Label htmlFor="payment-urssaf" className="cursor-pointer text-sm font-bold text-blue-800 flex items-center gap-2">
                        <Landmark size={14} />
                        URSSAF — Avance Immédiate
                      </Label>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="payment-paid" className="text-green-600" />
                    <Label htmlFor="payment-paid" className="cursor-pointer text-sm">
                      Regle direct
                    </Label>
                  </div>

                  {!hasUrssaf && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unpaid" id="payment-unpaid" className="text-red-600" />
                      <Label htmlFor="payment-unpaid" className="cursor-pointer text-sm font-bold text-red-600">
                        A regler plus tard
                      </Label>
                    </div>
                  )}

                  {hasActivePacks ? (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pack" id="payment-pack" className="text-blue-600" />
                      <Label htmlFor="payment-pack" className="cursor-pointer text-sm font-semibold text-blue-700">
                        Utiliser un pack
                      </Label>
                    </div>
                  ) : null}

                </RadioGroup>

                {paymentMode === "pack" && hasActivePacks ? (
                  <div className="mt-3 border-l-2 border-blue-100 pl-6">
                    <Select value={selectedPackId} onValueChange={setSelectedPackId}>
                      <SelectTrigger className="h-8 border-blue-100 bg-white text-xs text-blue-700">
                        <SelectValue placeholder="Choisir un pack" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentPacks.map((pack) => (
                          <SelectItem key={pack.id} value={pack.id} className="text-xs">
                            Pack {pack.totalLessons} ({pack.remainingLessons} restants)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                {paymentMode === "urssaf" && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-xs text-blue-900">
                    <div className="flex items-start gap-2">
                      <Landmark className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        La demande de paiement URSSAF (DP) sera <strong>envoyée automatiquement</strong> à la validation.
                        Le numéro de facture et le statut s&apos;afficheront dans la fiche élève.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-xs font-bold uppercase text-stone-500">
              <MessageSquare size={12} /> Notes
            </Label>
            <Textarea
              placeholder="Contenu du cours, exercices..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="min-h-[80px] border-stone-200 bg-stone-50"
            />
          </div>

          <DialogFooter className="border-t border-stone-100 pt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="font-semibold text-stone-500">
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedStudent || dpResult !== null}
              className={`px-8 font-bold text-white ${
                paymentMode === "urssaf"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {paymentMode === "urssaf" ? "Envoi URSSAF..." : "Ajout..."}
                </>
              ) : paymentMode === "urssaf" ? (
                <>
                  <Landmark className="mr-2 h-4 w-4" />
                  Enregistrer + Envoyer DP
                </>
              ) : (
                "Enregistrer le cours"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
