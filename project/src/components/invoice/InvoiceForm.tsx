import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ServiceLine from "./ServiceLine";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/client-api";
import { InvoiceData, Service } from "@/lib/types";

interface InvoiceFormProps {
  onUpdate: (data: InvoiceData) => void;
  initialData?: Partial<InvoiceData>;
  studentId?: string;
  studentRate?: number;
}

interface FetchedLesson {
  _id: string;
  date: string;
  comment?: string;
  amount: number;
}

const InvoiceForm = ({
  onUpdate,
  initialData = {},
  studentId,
  studentRate,
}: InvoiceFormProps) => {
  const [formData, setFormData] = useState<InvoiceData>({
    companyName: "YERVANT Jean-Christophe",
    companyAddress: "9 rue de la Fontaine au Roi 75011 PARIS",
    siret: "75292984400039",
    agreementNumber: "752929844",
    clientName: initialData.clientName || "",
    clientAddress: initialData.clientAddress || "",
    invoiceNumber: `F${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-`,
    invoiceDate: new Date().toISOString().split("T")[0],
    attestationYear: (new Date().getFullYear() - 1).toString(),
    totalAmountPaid: 0,
    services: [],
    paymentMethod: "Virement bancaire",
    showAgreementInfo: true,
  });

  useEffect(() => {
    const fetchLessons = async () => {
      if (!studentId) {
        return;
      }

      try {
        const lessons = await apiRequest<FetchedLesson[]>(`/api/students/${studentId}/lessons`);
        const services = lessons.map((lesson) => ({
          id: lesson._id,
          date: new Date(lesson.date).toISOString().split("T")[0],
          description: lesson.comment || "Cours de musique à domicile",
          numberOfLessons: 1,
          rate: lesson.amount,
        }));

        const nextData = { ...formData, services };
        setFormData(nextData);
        onUpdate(nextData);
      } catch (error) {
        console.error("Erreur lors de la récupération des cours:", error);
      }
    };

    fetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const handleChange = (field: keyof InvoiceData, value: string | number | boolean) => {
    const nextData = { ...formData, [field]: value };
    setFormData(nextData);
    onUpdate(nextData);
  };

  const addService = () => {
    const newService: Service = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      description: "Cours de musique à domicile",
      numberOfLessons: 1,
      rate: studentRate || 60,
    };

    const nextData = {
      ...formData,
      services: [...formData.services, newService],
    };
    setFormData(nextData);
    onUpdate(nextData);
  };

  const updateService = (id: string, field: keyof Service, value: string | number) => {
    const nextServices = formData.services.map((service) => (
      service.id === id ? { ...service, [field]: value } : service
    ));
    const nextData = { ...formData, services: nextServices };
    setFormData(nextData);
    onUpdate(nextData);
  };

  const deleteService = (id: string) => {
    const nextServices = formData.services.filter((service) => service.id !== id);
    const nextData = { ...formData, services: nextServices };
    setFormData(nextData);
    onUpdate(nextData);
  };

  useEffect(() => {
    const year = formData.attestationYear;
    if (!year || !formData.services) {
      handleChange("totalAmountPaid", 0);
      return;
    }

    const totalForYear = formData.services
      .filter((service) => service.date.startsWith(year))
      .reduce((sum, service) => sum + (service.numberOfLessons * service.rate), 0);

    handleChange("totalAmountPaid", totalForYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.services, formData.attestationYear]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">Édition de la facture/attestation</h1>

      <div className="space-y-1 border p-4 rounded-md bg-gray-50 text-sm">
        <h2 className="text-lg font-semibold mb-2">Informations sur l&apos;entreprise</h2>
        <p><strong>Dénomination sociale:</strong> {formData.companyName}</p>
        <p><strong>Adresse:</strong> {formData.companyAddress}</p>
        <p><strong>N°SIRET:</strong> {formData.siret}</p>
        <p><strong>Date :</strong> {new Date(formData.invoiceDate || new Date()).toLocaleDateString("fr-FR")}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Informations sur le client</h2>
        <Input placeholder="Nom du client" value={formData.clientName} onChange={(event) => handleChange("clientName", event.target.value)} />
        <Input placeholder="Adresse du client" value={formData.clientAddress} onChange={(event) => handleChange("clientAddress", event.target.value)} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Détails de la facture/attestation</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="Numéro de facture" value={formData.invoiceNumber} onChange={(event) => handleChange("invoiceNumber", event.target.value)} />
          <Input type="date" placeholder="Date de la facture" value={formData.invoiceDate} onChange={(event) => handleChange("invoiceDate", event.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="attestationYear">Année de l&apos;attestation</Label>
            <Input id="attestationYear" type="number" placeholder="Année" value={formData.attestationYear} onChange={(event) => handleChange("attestationYear", event.target.value)} />
          </div>
          <div>
            <Label htmlFor="totalAmountPaid">Montant total acquitté (€)</Label>
            <Input id="totalAmountPaid" type="number" placeholder="Montant total" value={formData.totalAmountPaid || 0} readOnly className="bg-gray-100" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="showAgreementInfo" checked={formData.showAgreementInfo} onCheckedChange={(checked) => handleChange("showAgreementInfo", !!checked)} />
          <Label htmlFor="showAgreementInfo">Afficher les informations d&apos;agrément sur le PDF</Label>
        </div>
      </div>

      <div className="space-y-2 mt-4 p-4 border rounded-md bg-gray-50 text-sm">
        <p>
          Je soussigné, {formData.companyName}, certifie que {formData.clientName || "[Prénom Nom du bénéficiaire]"},
          a bénéficié de services à la personne : cours de trompette à domicile.
        </p>
        <p>
          En {formData.attestationYear || "[Année]"}, le montant des factures effectivement acquittées représente une somme totale de : {formData.totalAmountPaid || "[Montant]"} €.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Prestations</h2>
          <Button onClick={addService} variant="outline" className="flex items-center gap-2">
            <Plus size={20} /> Ajouter une prestation
          </Button>
        </div>
        <div className="space-y-2">
          {formData.services
            .filter((service) => !formData.attestationYear || formData.attestationYear.length < 4 || service.date.startsWith(formData.attestationYear))
            .map((service) => (
              <ServiceLine key={service.id} service={service} onChange={updateService} onDelete={deleteService} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
