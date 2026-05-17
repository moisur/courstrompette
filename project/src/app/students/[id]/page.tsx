"use client";

import { useState } from "react";
import AttestationPreview from "@/components/invoice/AttestationPreview";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import { AddLessonDialog } from "@/components/lesson/AddLessonDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { StudentEditDialog } from "@/features/students/student-edit-dialog";
import { StudentLessonsSection } from "@/features/students/student-lessons-section";
import { StudentOverviewCards } from "@/features/students/student-overview-cards";
import { StudentPackDialog } from "@/features/students/student-pack-dialog";
import { BulkPackPaymentDialog, SinglePackPaymentDialog } from "@/features/students/student-payment-dialogs";
import { StudentPacksSection } from "@/features/students/student-packs-section";
import { useStudentDetail } from "@/features/students/use-student-detail";
import { InvoiceData } from "@/lib/types";
import { ArrowLeft, Check, FileDown, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

async function downloadPdf({
  elementId,
  filename,
}: {
  elementId: string;
  filename: string;
}) {
  const html2pdf = (await import("html2pdf.js")).default;
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("PDF target not found");
  }

  await html2pdf().set({
    margin: 1,
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
  }).from(element).save();
}

export default function StudentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const studentId = params.id as string;
  const {
    student,
    allStudents,
    lessons,
    packs,
    activePacks,
    unpaidLessons,
    totalPaid,
    totalDue,
    totalRemainingLessons,
    refreshLessonsAndPacks,
    updateStudent,
    toggleDeclared,
    createPack,
    deletePack,
    setLessonPaid,
    deleteLesson,
    payLessonsWithPack,
  } = useStudentDetail(studentId);

  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [attestationData, setAttestationData] = useState<InvoiceData | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showAttestationDialog, setShowAttestationDialog] = useState(false);
  const [showPackDialog, setShowPackDialog] = useState(false);
  const [showBulkPaymentDialog, setShowBulkPaymentDialog] = useState(false);
  const [showSinglePaymentDialog, setShowSinglePaymentDialog] = useState(false);
  const [showEditStudentDialog, setShowEditStudentDialog] = useState(false);
  const [isAddLessonDialogOpen, setIsAddLessonDialogOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const handlePdfDownload = async ({
    elementId,
    filename,
    successMessage,
    errorMessage,
  }: {
    elementId: string;
    filename: string;
    successMessage: string;
    errorMessage: string;
  }) => {
    try {
      await downloadPdf({ elementId, filename });
      toast({ title: "Succès", description: successMessage });
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: errorMessage });
    }
  };

  if (!student) {
    return (
      <div className="container py-6">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/students")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/students")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">{student.name}</h1>
        <div className="flex items-center gap-4 flex-wrap justify-end">
          <div className="text-muted-foreground">
            Tarif: <span className="font-semibold">{student.rate}€</span>
          </div>
          <Button onClick={toggleDeclared} variant={student.declared ? "default" : "outline"}>
            {student.declared ? "Déclaré" : "Non déclaré"}
          </Button>
          <Button onClick={() => setIsAddLessonDialogOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un cours
          </Button>
          <Button onClick={() => setShowPackDialog(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un pack
          </Button>
          {unpaidLessons.length > 0 && activePacks.length > 0 ? (
            <Button onClick={() => setShowBulkPaymentDialog(true)} variant="outline">
              <Check className="mr-2 h-4 w-4" />
              Payer des cours avec un pack
            </Button>
          ) : null}
          <Button
            onClick={() => {
              setAttestationData(null);
              setShowInvoiceDialog(true);
            }}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Générer une facture
          </Button>
          <Button
            onClick={() => {
              setInvoiceData(null);
              setShowAttestationDialog(true);
            }}
            variant="secondary"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Générer une attestation
          </Button>
          <Button onClick={() => setShowEditStudentDialog(true)} variant="outline">
            Modifier
          </Button>
        </div>
      </div>

      <StudentOverviewCards
        student={student}
        lessons={lessons}
        totalDue={totalDue}
        totalPaid={totalPaid}
        totalRemainingLessons={totalRemainingLessons}
      />

      <StudentPacksSection packs={packs} onDeletePack={deletePack} />
      <StudentLessonsSection
        lessons={lessons}
        activePacks={activePacks}
        onOpenPayWithPack={(lessonId) => {
          setSelectedLessonId(lessonId);
          setShowSinglePaymentDialog(true);
        }}
        onTogglePayment={setLessonPaid}
        onDeleteLesson={deleteLesson}
      />

      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Générer une facture</DialogTitle>
          </DialogHeader>
          <div className="flex gap-4 overflow-auto">
            <div className="flex-1 min-w-[300px] overflow-y-auto">
              <InvoiceForm
                onUpdate={(data) => {
                  setInvoiceData(data);
                  if (showAttestationDialog) {
                    setAttestationData(data);
                  }
                }}
                initialData={{ clientName: student.name }}
                studentId={studentId}
                studentRate={student.rate}
              />
            </div>
            {invoiceData ? (
              <div className="flex-1 min-w-[300px] overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 pb-2">
                  <div className="flex justify-end mb-2">
                    <Button
                      onClick={() =>
                        handlePdfDownload({
                          elementId: "invoice-preview",
                          filename: `facture-${invoiceData.invoiceNumber}.pdf`,
                          successMessage: "La facture a été téléchargée",
                          errorMessage: "Impossible de générer le PDF",
                        })
                      }
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Télécharger en PDF
                    </Button>
                  </div>
                </div>
                <div id="invoice-preview" className="overflow-y-auto">
                  <InvoicePreview data={invoiceData} />
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAttestationDialog} onOpenChange={setShowAttestationDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Générer une attestation fiscale annuelle</DialogTitle>
          </DialogHeader>
          <div className="flex gap-4 overflow-auto">
            <div className="flex-1 min-w-[300px] overflow-y-auto">
              <InvoiceForm
                onUpdate={(data) => {
                  setAttestationData(data);
                  if (showInvoiceDialog) {
                    setInvoiceData(data);
                  }
                }}
                initialData={{ clientName: student.name }}
                studentId={studentId}
                studentRate={student.rate}
              />
            </div>
            {attestationData ? (
              <div className="flex-1 min-w-[300px] overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 pb-2">
                  <div className="flex justify-end mb-2">
                    <Button
                      onClick={() =>
                        handlePdfDownload({
                          elementId: "attestation-preview",
                          filename: `attestation-${attestationData.clientName}-${attestationData.attestationYear}.pdf`,
                          successMessage: "L'attestation a été téléchargée",
                          errorMessage: "Impossible de générer le PDF de l'attestation",
                        })
                      }
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Télécharger attestation PDF
                    </Button>
                  </div>
                </div>
                <div id="attestation-preview" className="overflow-y-auto">
                  <AttestationPreview data={attestationData} />
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AddLessonDialog
        students={allStudents}
        isOpen={isAddLessonDialogOpen}
        onClose={() => setIsAddLessonDialogOpen(false)}
        onLessonAdded={refreshLessonsAndPacks}
        preselectedStudentId={studentId}
      />

      <StudentPackDialog open={showPackDialog} onOpenChange={setShowPackDialog} onSubmit={createPack} />
      <StudentEditDialog open={showEditStudentDialog} onOpenChange={setShowEditStudentDialog} student={student} onSubmit={updateStudent} />
      <SinglePackPaymentDialog
        open={showSinglePaymentDialog}
        onOpenChange={(open) => {
          setShowSinglePaymentDialog(open);
          if (!open) {
            setSelectedLessonId(null);
          }
        }}
        lessonId={selectedLessonId}
        lessons={lessons}
        activePacks={activePacks}
        onSubmit={payLessonsWithPack}
      />
      <BulkPackPaymentDialog
        open={showBulkPaymentDialog}
        onOpenChange={setShowBulkPaymentDialog}
        unpaidLessons={unpaidLessons}
        activePacks={activePacks}
        onSubmit={payLessonsWithPack}
      />
    </div>
  );
}
