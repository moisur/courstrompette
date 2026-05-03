export interface Service {
  id: string;
  date: string;
  description: string;
  numberOfLessons: number;
  rate: number;
}

export interface InvoiceData {
  companyName: string;
  companyAddress: string;
  siret: string;
  agreementNumber: string;
  clientName: string;
  clientAddress: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  services: Service[];
  paymentMethod?: string;
  attestationYear?: string;
  totalAmountPaid?: number;
  showAgreementInfo?: boolean;
}
