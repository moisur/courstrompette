import { NextResponse } from "next/server";
import { forbidden, unauthorized } from "@/lib/api-responses";
import { getSessionUser } from "@/lib/auth/session";
import { SessionUser } from "@/lib/auth/types";

export async function requireSession(request: Request): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser(request);
  if (!user) {
    return unauthorized();
  }
  return user;
}

export function requireAdmin(user: SessionUser): NextResponse | null {
  if (user.role !== "ADMIN") {
    return forbidden();
  }
  return null;
}
