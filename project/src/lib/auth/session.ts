import { UserRole } from "@prisma/client";
import prisma from "@/lib/db";
import { getRequestCookie } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { SessionUser } from "@/lib/auth/types";

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const authorizationHeader = request.headers.get("authorization");
  const bearerToken =
    authorizationHeader && authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.slice("Bearer ".length).trim()
      : null;

  const accessToken = bearerToken || getRequestCookie(request, ACCESS_TOKEN_COOKIE);
  if (!accessToken) {
    return null;
  }

  const payload = verifyAccessToken(accessToken);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      student: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    studentId: user.student?.id,
  };
}

export function isAdmin(user: SessionUser): boolean {
  return user.role === UserRole.ADMIN;
}

export function canAccessStudent(user: SessionUser, studentId: string): boolean {
  return isAdmin(user) || user.studentId === studentId;
}
