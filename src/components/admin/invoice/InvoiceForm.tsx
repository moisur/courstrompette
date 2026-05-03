"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Calendar, CreditCard, FileText, Plus, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/client-api";
import { InvoiceData, Service } from "@/lib/types/invoice";

import ServiceLine from "./ServiceLine";

interface InvoiceFormProps {
  onUpdate: (data: InvoiceData) => void;
  initialData?: Partial<InvoiceData>;
  studentId?: string;
  studentRate?: number;
}

interface FetchedLesson {
  id: string;
  date: string;
  comment?: string;
  amount: number;
}

function buildInitialInvoiceData(initialData: Partial<InvoiceData>): InvoiceData {
  return {
    companyName: "YERVANT Jean-Christophe",
    companyAddress: "9 rue de la Fontaine au Roi 75011 PARIS",
    siret: "75292984400039",
    agreementNumber: "752929844",
    clientName: initialData.clientName || "",
    clientAddress: initialData.clientAddress || "",
    invoiceNumber: `F${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-`,
    invoiceDate: new Date().toISOString().split("T")[0],
    attestationYear: String(new Date().getFullYear() - 1),
    totalAmountPaid: 0,
    services: [],
    paymentMethod: "Virement bancaire",
    showAgreementInfo: true,
  };
}

const InvoiceForm = ({ onUpdate, initialData = {}, studentId, studentRate }: InvoiceFormProps) => {
  const initialClientName = initialData.clientName || "";
  const initialClientAddress = initialData.clientAddress || "";

  const [formData, setFormData] = useState<InvoiceData>(() =>
    buildInitialInvoiceData({
      clientName: initialClientName,
      clientAddress: initialClientAddress,
    }),
  );

  // Stable ref to avoid stale closures
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // Single effect that propagates form changes to parent AFTER render
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    onUpdateRef.current(formData);
  }, [formData]);

  useEffect(() => {
    const nextData = buildInitialInvoiceData({
      clientName: initialClientName,
      clientAddress: initialClientAddress,
    });
    setFormData(nextData);
  }, [initialClientAddress, initialClientName, studentId]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!studentId) {
        return;
      }

      try {
        const lessons = await apiRequest<FetchedLesson[]>(`/api/admin/students/${studentId}/lessons`);
        const services = lessons.map((lesson) => ({
          id: lesson.id,
          date: new Date(lesson.date).toISOString().split("T")[0],
          description: lesson.comment || "Cours de musique a domicile",
          numberOfLessons: 1,
          rate: Number(lesson.amount),
        }));
        const availableYears = Array.from(new Set(services.map((service) => service.date.slice(0, 4)))).sort(
          (left, right) => Number(right) - Number(left),
        );

        setFormData((current) => {
          const hasCurrentAttestationYear = availableYears.includes(current.attestationYear || "");
          return {
            ...current,
            attestationYear: hasCurrentAttestationYear ? current.attestationYear : availableYears[0] || current.attestationYear,
            services,
          };
        });
      } catch (error) {
        console.error("Erreur lors de la recuperation des cours:", error);
      }
    };

    void fetchLessons();
  }, [studentId]);

  const handleChange = (field: keyof InvoiceData, value: string | number | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const addService = () => {
    const newService: Service = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      description: "Cours de musique a domicile",
      numberOfLessons: 1,
      rate: studentRate || 60,
    };

    setFormData((current) => ({
      ...current,
      services: [...current.services, newService],
    }));
  };

  const updateService = (id: string, field: keyof Service, value: string | number) => {
    setFormData((current) => {
      const nextServices = current.services.map((service) =>
        service.id === id ? { ...service, [field]: value } : service,
      );
      return { ...current, services: nextServices };
    });
  };

  const deleteService = (id: string) => {
    setFormData((current) => {
      const nextServices = current.services.filter((service) => service.id !== id);
      return { ...current, services: nextServices };
    });
  };

  useEffect(() => {
    const year = formData.attestationYear;
    if (!year || !formData.services) {
      setFormData((current) => ({ ...current, totalAmountPaid: 0 }));
      return;
    }

    const totalForYear = formData.services
      .filter((service) => service.date.startsWith(year))
      .reduce((sum, service) => sum + service.numberOfLessons * service.rate, 0);

    setFormData((current) => ({ ...current, totalAmountPaid: totalForYear }));
  }, [formData.attestationYear, formData.services]);

  return (
    <div className="space-y-8 rounded-xl border border-stone-200 bg-stone-50/50 p-6">
      <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
        <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
          <FileText size={20} />
        </div>
        <h2 className="text-xl font-bold text-stone-800">Edition Facture / Attestation</h2>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
              <Building2 size={14} />
              <span>Emetteur</span>
            </div>
            <div className="space-y-1 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <p className="font-bold text-stone-800">{formData.companyName}</p>
              <p className="text-sm text-stone-600">{formData.companyAddress}</p>
              <p className="mt-2 text-xs text-stone-500">SIRET: {formData.siret}</p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
              <User size={14} />
              <span>Destinataire</span>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="clientName" className="mb-1 block text-xs text-stone-500">
                  Nom complet
                </Label>
                <Input
                  id="clientName"
                  placeholder="Nom du client"
                  value={formData.clientName}
                  onChange={(event) => handleChange("clientName", event.target.value)}
                  className="border-stone-200 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="clientAddress" className="mb-1 block text-xs text-stone-500">
                  Adresse postale
                </Label>
                <Input
                  id="clientAddress"
                  placeholder="Adresse du client"
                  value={formData.clientAddress}
                  onChange={(event) => handleChange("clientAddress", event.target.value)}
                  className="border-stone-200 bg-white"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
              <Calendar size={14} />
              <span>Parametres du document</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block text-xs text-stone-500">No Facture</Label>
                <Input
                  value={formData.invoiceNumber}
                  onChange={(event) => handleChange("invoiceNumber", event.target.value)}
                  className="border-stone-200 bg-white"
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs text-stone-500">Date</Label>
                <Input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(event) => handleChange("invoiceDate", event.target.value)}
                  className="border-stone-200 bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block text-xs text-stone-500">Annee Attestation</Label>
                <Input
                  type="number"
                  value={formData.attestationYear}
                  onChange={(event) => handleChange("attestationYear", event.target.value)}
                  className="border-stone-200 bg-white"
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs text-stone-500">Total annuel</Label>
                <div className="flex h-10 items-center rounded-md border border-stone-200 bg-stone-100 px-3 font-bold text-stone-700">
                  {formData.totalAmountPaid?.toFixed(2)} EUR
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Checkbox
                id="showAgreementInfo"
                checked={formData.showAgreementInfo}
                onCheckedChange={(checked) => handleChange("showAgreementInfo", !!checked)}
              />
              <Label htmlFor="showAgreementInfo" className="cursor-pointer text-sm font-medium text-stone-600">
                Afficher les informations d&apos;agrement SAP
              </Label>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
              <CreditCard size={14} />
              <span>Reglement</span>
            </div>
            <Input
              value={formData.paymentMethod}
              onChange={(event) => handleChange("paymentMethod", event.target.value)}
              placeholder="Ex: Virement bancaire"
              className="border-stone-200 bg-white"
            />
          </section>
        </div>
      </div>

      <section className="space-y-4 border-t border-stone-200 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
            <span>Detail des prestations</span>
          </div>
          <Button
            onClick={addService}
            variant="outline"
            size="sm"
            className="border-2 border-stone-200 bg-white font-bold text-stone-700 hover:bg-stone-50"
          >
            <Plus size={16} className="mr-1" /> Ajouter une ligne
          </Button>
        </div>

        <div className="space-y-1">
          {formData.services.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-stone-200 bg-white py-12 text-center text-sm text-stone-400">
              Aucune prestation saisie
            </div>
          ) : (
            formData.services.map((service) => (
              <ServiceLine
                key={service.id}
                service={service}
                onChange={updateService}
                onDelete={deleteService}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default InvoiceForm;
