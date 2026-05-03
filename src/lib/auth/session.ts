import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { SessionUser } from "@/lib/auth/types";
import { getAdminSession } from "@/lib/admin-auth";

export async function getSessionUser(): Promise<SessionUser | null> {
  // 1. Try Super Admin (Environment-based)
  const adminSession = await getAdminSession();
  if (adminSession) {
    return {
      id: "super-admin",
      email: adminSession.email,
      role: "ADMIN",
      isActive: true,
      mustChangePassword: false,
    };
  }

  // 2. Try DB User (JWT-based)
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return null;
  }

  // Fetch user from DB
  try {
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
      email: user.email ?? "",
      role: user.role === "ADMIN" ? "ADMIN" : "STUDENT",
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      studentId: user.student?.id,
    };
  } catch (error) {
    console.error("Auth: DB Fetch Error", error);
    return null;
  }
}

export function isAdmin(user: SessionUser): boolean {
  return user.role === "ADMIN";
}

export function canAccessStudent(user: SessionUser, studentId: string): boolean {
  return isAdmin(user) || user.studentId === studentId;
}
