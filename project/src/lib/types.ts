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
  invoiceNumber?: string; // Made optional
  invoiceDate?: string; // Made optional
  services: Service[];
  paymentMethod?: string; // Made optional
  attestationYear?: string; // Added for attestation
  totalAmountPaid?: number; // Added for attestation
  showAgreementInfo?: boolean; // Added for optional agreement info
}

export interface CoursePack {
  _id: string;
  studentId: string;
  totalLessons: number;
  remainingLessons: number;
  purchaseDate: string;
  expiryDate?: string;
  price: number;
  createdAt: string;
}

export interface PaymentStatus {
  isPaid: boolean;
  packId?: string;
}

export interface Student {
  _id: string;
  name: string;
  rate: number;
  declared: boolean;
  createdAt: string;
  archived?: boolean;
  phone?: string;
  address?: string;
  courseDay?: string;
  courseHour?: string;
  email?: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
  hasLogin?: boolean;
}

export interface Lesson {
  _id: string;
  student?: Student;
  studentId?: string;
  date: string;
  amount: number;
  comment?: string;
  isPaid?: boolean;
  packId?: string;
}

export type UserRole = "ADMIN" | "STUDENT";

export interface AuthUser {
  id: string;
  email: string | null;
  role: UserRole;
  studentId?: string;
  mustChangePassword: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface StudentSummary {
  totalLessons: number;
  paidLessons: number;
  unpaidLessons: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  activePacks: number;
}
