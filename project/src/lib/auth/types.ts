import { UserRole } from "@prisma/client";

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  studentId?: string;
  type: "access";
}

export interface SessionUser {
  id: string;
  email: string | null;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  studentId?: string;
}
