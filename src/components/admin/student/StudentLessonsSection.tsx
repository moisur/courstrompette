import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CoursePack, Lesson } from "@/hooks/use-student-detail";
import { 
  AlertTriangle, 
  Check, 
  CheckCircle, 
  CheckCircle2,
  Clock, 
  CreditCard, 
  History, 
  Loader2, 
  ReceiptText, 
  Send, 
  Trash2, 
  X,
  XCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentLessonsSectionProps {
  lessons: Lesson[];
  activePacks: CoursePack[];
  onOpenPayWithPack: (lessonId: string) => void;
  onTogglePayment: (lessonId: string, isPaid: boolean) => void;
  onDeleteLesson: (lessonId: string) => void;
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

function getUrssafLessonStatus(lesson: Lesson) {
  const code = lesson.urssafPaymentRequest?.statutCode ?? "";

  if (!lesson.urssafPaymentRequest) {
    return {
      label: "URSSAF a envoyer",
      className: "bg-sky-100 text-sky-700 border border-sky-200",
    };
  }

  if (["70", "120", "270"].includes(code)) {
    return {
      label: `URSSAF regle${code ? ` (${code})` : ""}`,
      className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    };
  }

  if (["10", "20", "30", "50"].includes(code)) {
    const labels: Record<string, string> = {
      "10": "URSSAF integree",
      "20": "URSSAF en attente",
      "30": "URSSAF validee",
      "50": "URSSAF prelevee",
    };

    return {
      label: `${labels[code] || "URSSAF envoye"} (${code})`,
      className: "bg-amber-100 text-amber-800 border border-amber-200",
    };
  }

  if (code.startsWith("ERR_")) {
    return {
      label: `URSSAF rejetee (${code})`,
      className: "bg-rose-100 text-rose-700 border border-rose-200",
    };
  }

  return {
    label: `URSSAF erreur${code ? ` (${code})` : ""}`,
    className: "bg-rose-100 text-rose-700 border border-rose-200",
  };
}

function hasActiveUrssafRequest(lesson: Lesson) {
  if (!lesson.urssafPaymentRequest) return false;
  const code = lesson.urssafPaymentRequest.statutCode ?? "";
  const cancelledCodes = ["110", "111", "112", "113"];
  return !cancelledCodes.includes(code);
}

// ─── Timeline component for nested lesson row ──────────────────
function LessonUrssafTimeline({ req }: { req: any }) {
  const [showHistory, setShowHistory] = useState(false);

  const formatDate = (iso?: string | Date | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const milestones: Array<{ label: string; date: string | Date | null; icon: React.ReactNode; tone: string }> = [
    {
      label: "Soumise",
      date: req.submittedAt ?? null,
      icon: <Clock size={10} />,
      tone: req.submittedAt ? "bg-blue-500 animate-pulse" : "bg-stone-300",
    },
    {
      label: "Intégrée",
      date: req.integreeAt ?? null,
      icon: <Clock size={10} />,
      tone: req.integreeAt ? "bg-amber-500 animate-pulse" : "bg-stone-300",
    },
    {
      label: "Validée",
      date: req.valideeAt ?? null,
      icon: <CheckCircle2 size={10} />,
      tone: req.valideeAt ? "bg-emerald-500" : "bg-stone-300",
    },
    {
      label: "Prélevée",
      date: req.preleveeAt ?? null,
      icon: <CheckCircle2 size={10} />,
      tone: req.preleveeAt ? "bg-emerald-600" : "bg-stone-300",
    },
    {
      label: "Payée",
      date: req.paidAt ?? null,
      icon: <CheckCircle2 size={10} />,
      tone: req.paidAt ? "bg-green-600 font-bold" : "bg-stone-300",
    },
  ];

  if (req.errorAt) {
    milestones.push({
      label: "Erreur",
      date: req.errorAt,
      icon: <XCircle size={10} />,
      tone: "bg-rose-500",
    });
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-wrap items-center gap-y-4 gap-x-1 sm:gap-x-2">
        {milestones.map((m, i) => (
          <div key={m.label} className="flex items-center">
            <div className="flex flex-col items-center min-w-[50px] text-center">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${m.tone}`}
                title={m.date ? `${m.label}: ${formatDate(m.date)}` : `${m.label}: en attente`}
              >
                {m.icon}
              </div>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-wide text-stone-500">
                {m.label}
              </span>
              {m.date && (
                <span className="text-[8px] text-stone-400">
                  {formatDate(m.date)?.split(" ")[0]}
                </span>
              )}
            </div>
            {i < milestones.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-4 sm:w-8 ${
                  m.date ? "bg-emerald-300" : "bg-stone-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {req.statusHistory && req.statusHistory.length > 0 && (
        <div className="pt-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-stone-600 transition-colors hover:bg-stone-100"
          >
            <History size={10} />
            {showHistory ? "Masquer" : "Voir"} l&apos;historique ({req.statusHistory.length})
          </button>

          {showHistory && (
            <div className="mt-2 ml-2 space-y-1 border-l-2 border-stone-200 pl-3">
              {req.statusHistory.map((h: any) => (
                <div key={h.id} className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-mono text-stone-400">{formatDate(h.changedAt)}</span>
                  <span className="text-stone-500">
                    {h.previousLabel ?? h.previousCode ?? "—"}
                  </span>
                  <span className="text-stone-400">→</span>
                  <span className="font-bold text-stone-700">
                    {h.newLabel ?? getStatusLabel(h.newCode)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StudentLessonsSection({
  lessons,
  activePacks,
  onOpenPayWithPack,
  onTogglePayment,
  onDeleteLesson,
}: StudentLessonsSectionProps) {
  const [urssafWarningLesson, setUrssafWarningLesson] = useState<Lesson | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  const toggleExpand = (lessonId: string) => {
    setExpandedLessonId(expandedLessonId === lessonId ? null : lessonId);
  };

  const handleClose = () => {
    setUrssafWarningLesson(null);
    if (sendResult?.success) {
      window.location.reload();
    }
    setSendResult(null);
  };

  const handleDeleteClick = (lesson: Lesson) => {
    if (hasActiveUrssafRequest(lesson)) {
      setUrssafWarningLesson(lesson);
      
      const req = lesson.urssafPaymentRequest;
      const dateStr = new Date(lesson.date).toLocaleDateString("fr-FR");
      const amountStr = Number(lesson.amount).toFixed(2);
      
      const initialSubject = `Demande d'annulation de demande de paiement — SIRET 75292984400039 — ${req?.numFactureTiers || ""}`;
      const initialBody = `Bonjour,\n\nJe souhaite demander l'annulation de la demande de paiement suivante :\n\n• SIRET du prestataire : 75292984400039\n• Numéro de facture (numFactureTiers) : ${req?.numFactureTiers || ""}\n• ID de la demande de paiement : ${req?.idDemandePaiement || "Non encore attribué"}\n• Statut actuel : ${req?.statutLabel || "Inconnu"} (code ${req?.statutCode || "—"})\n• Montant TTC : ${amountStr} EUR\n• Date du cours : ${dateStr}\n\nMotif de l'annulation : Cours annulé / erreur de saisie\n\nJe vous remercie par avance pour le traitement de cette demande.\n\nCordialement,\nJean-Christophe Yervant\njc@courstrompette.fr\nTél : 06 63 73 89 02`;
      
      setEmailSubject(initialSubject);
      setEmailBody(initialBody);
      setSendResult(null);
    } else {
      onDeleteLesson(lesson.id);
    }
  };

  const handleSendCancelRequest = async () => {
    if (!urssafWarningLesson?.urssafPaymentRequest) return;

    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/admin/urssaf/cancel-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numFactureTiers: urssafWarningLesson.urssafPaymentRequest.numFactureTiers,
          subject: emailSubject,
          emailBody: emailBody,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSendResult({ success: true, message: data.message || "Email envoyé avec succès !" });
      } else {
        setSendResult({ success: false, message: data.error || "Erreur lors de l'envoi" });
      }
    } catch {
      setSendResult({ success: false, message: "Erreur réseau. Vérifiez votre connexion." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-stone-800">
        <ReceiptText size={20} className="text-amber-600" />
        <h2 className="text-xl font-bold">Historique des cours</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-stone-50">
            <TableRow className="border-stone-200 hover:bg-transparent">
              <TableHead className="py-4 text-xs font-bold uppercase text-stone-500">Date</TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase text-stone-500">Commentaire</TableHead>
              <TableHead className="py-4 text-xs font-bold uppercase text-stone-500">Statut</TableHead>
              <TableHead className="py-4 text-right text-xs font-bold uppercase text-stone-500">Montant</TableHead>
              <TableHead className="w-[120px] py-4 text-right text-xs font-bold uppercase text-stone-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-stone-400">
                  Aucun cours enregistre pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              lessons.map((lesson) => {
                const isUrssafLesson = lesson.paymentMethod === "URSSAF";
                const urssafStatus = isUrssafLesson ? getUrssafLessonStatus(lesson) : null;
                const isExpanded = expandedLessonId === lesson.id;

                return (
                  <>
                    <TableRow key={lesson.id} className="border-stone-100 transition-colors hover:bg-stone-50/50">
                      <TableCell className="font-medium text-stone-700">
                        {new Date(lesson.date).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-stone-600">
                        {lesson.comment || "-"}
                      </TableCell>
                      <TableCell>
                        {isUrssafLesson && urssafStatus ? (
                          <span 
                            onClick={() => toggleExpand(lesson.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-bold transition-all hover:scale-105 active:scale-95 select-none hover:opacity-90 shadow-sm border",
                              urssafStatus.className
                            )}
                            title="Cliquer pour afficher l'historique et le suivi temps réel"
                          >
                            {urssafStatus.label}
                            <span className="text-[10px] opacity-75">⏱️</span>
                          </span>
                        ) : lesson.isPaid ? (
                          lesson.packId ? (
                            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                              Pack
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                              Direct
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                            A payer
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-black text-stone-800">
                        {Number(lesson.amount).toFixed(2)} EUR
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1.5">
                          {!lesson.isPaid && !isUrssafLesson && activePacks.length > 0 ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => onOpenPayWithPack(lesson.id)}
                              title="Payer avec un pack"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          ) : null}

                          {!isUrssafLesson ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-8 w-8 transition-colors",
                                lesson.isPaid
                                  ? "text-stone-400 hover:bg-red-50 hover:text-red-500"
                                  : "text-green-500 hover:bg-green-50 hover:text-green-700",
                              )}
                              onClick={() => onTogglePayment(lesson.id, !lesson.isPaid)}
                              title={lesson.isPaid ? "Marquer comme non paye" : "Marquer comme paye"}
                            >
                              {lesson.isPaid ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </Button>
                          ) : null}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-stone-300 hover:bg-red-50 hover:text-red-500"
                            onClick={() => handleDeleteClick(lesson)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expandable URSSAF timeline row */}
                    {isExpanded && isUrssafLesson && lesson.urssafPaymentRequest && (
                      <TableRow className="bg-stone-50/50 hover:bg-stone-50/50">
                        <TableCell colSpan={5} className="py-4 px-6 border-stone-100">
                          <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-stone-100 pb-2">
                              <p className="text-[11px] font-black uppercase tracking-widest text-stone-500">
                                Suivi Temps Réel — Facture {lesson.urssafPaymentRequest.numFactureTiers}
                              </p>
                              <span className="text-[10px] text-stone-400 font-mono">
                                ID URSSAF : {lesson.urssafPaymentRequest.idDemandePaiement || "Non encore attribué"}
                              </span>
                            </div>
                            <LessonUrssafTimeline req={lesson.urssafPaymentRequest} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* URSSAF Annulation Warning Dialog */}
      <Dialog open={Boolean(urssafWarningLesson)} onOpenChange={(open) => { if (!open) { handleClose(); } }}>
        <DialogContent className="sm:max-w-[640px] border-none bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-7 w-7 text-amber-600" />
            </div>
            <DialogTitle className="text-center text-xl font-black text-stone-900">
              Demande d&apos;annulation URSSAF
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-stone-500">
              Ce cours est lié à une facture URSSAF active. Vous devez soumettre une demande d&apos;annulation.
              Vous pouvez relire et modifier le mail ci-dessous avant envoi.
            </DialogDescription>
          </DialogHeader>

          {urssafWarningLesson && !sendResult?.success && (
            <div className="space-y-4">
              <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-stone-500 block mb-1">Destinataire</label>
                  <div className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-stone-700">
                    avance-immediate@urssaf.fr <span className="text-stone-400 font-normal">(en copie : jc@courstrompette.fr)</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-stone-500 block mb-1">Objet du mail</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-bold text-stone-800 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-stone-500 block mb-1">Corps du mail (Éditable)</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 font-mono placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    rows={12}
                  />
                </div>
              </div>

              {sendResult && !sendResult.success && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  ❌ {sendResult.message}
                </div>
              )}
            </div>
          )}

          {sendResult?.success && (
            <div className="space-y-4 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-center text-lg font-bold text-stone-900">Email envoyé avec succès !</p>
              <p className="text-center text-sm text-stone-500">
                Votre demande d&apos;annulation a été envoyée à l&apos;URSSAF.
                Une copie de confirmation a été envoyée à jc@courstrompette.fr.
              </p>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="rounded-full border-stone-200"
              >
                Fermer
              </Button>
              {!sendResult?.success && urssafWarningLesson && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    onDeleteLesson(urssafWarningLesson.id);
                    setUrssafWarningLesson(null);
                  }}
                  className="rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  title="Supprime uniquement le cours dans notre base, sans envoyer d'email à l'URSSAF"
                >
                  Forcer la suppression locale (Sans mail)
                </Button>
              )}
            </div>
            {!sendResult?.success && urssafWarningLesson && (
              <Button
                onClick={handleSendCancelRequest}
                disabled={isSending}
                className="rounded-full bg-amber-600 px-6 font-bold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Envoyer la demande d&apos;annulation
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
