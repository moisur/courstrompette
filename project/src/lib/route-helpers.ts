import { NextResponse } from "next/server";
import { forbidden } from "@/lib/api-responses";
import { canAccessStudent } from "@/lib/auth/session";
import { SessionUser } from "@/lib/auth/types";
import { requireAdmin, requireSession } from "@/lib/require-auth";

export interface RouteContext<T extends Record<string, string>> {
  params: Promise<T>;
}

export async function requireAdminSession(request: Request): Promise<SessionUser | NextResponse> {
  const session = await requireSession(request);
  if (session instanceof Response) {
    return session;
  }

  const adminGate = requireAdmin(session);
  if (adminGate) {
    return adminGate;
  }

  return session;
}

export function requireStudentAccount(session: SessionUser, message = "Student account required") {
  if (!session.studentId) {
    return forbidden(message);
  }

  return null;
}

export function requireStudentAccess(session: SessionUser, studentId: string) {
  if (!canAccessStudent(session, studentId)) {
    return forbidden();
  }

  return null;
}
