import { UserRole } from "@prisma/client";

export type { UserRole };

export type AccessTokenPayload = {
  sub: string;
  role: "ADMIN" | "STUDENT";
  studentId?: string;
  type: "access";
};

export type SessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  isActive: boolean;
  mustChangePassword: boolean;
  studentId?: string;
};
