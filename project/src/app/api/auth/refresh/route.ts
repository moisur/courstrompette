import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { clearAuthCookies, getRequestCookie, setAuthCookies } from "@/lib/auth/cookies";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { hashOpaqueToken } from "@/lib/auth/security";
import { issueRefreshToken, signAccessToken } from "@/lib/auth/tokens";
import { unauthorized, serverError } from "@/lib/api-responses";

function unauthorizedWithCookieClear() {
  const response = unauthorized("Invalid refresh token");
  clearAuthCookies(response);
  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const refreshTokenFromBody =
      body && typeof body.refreshToken === "string" ? body.refreshToken : null;
    const refreshTokenValue = getRequestCookie(request, REFRESH_TOKEN_COOKIE) || refreshTokenFromBody;
    if (!refreshTokenValue) {
      return unauthorizedWithCookieClear();
    }

    const refreshTokenHash = hashOpaqueToken(refreshTokenValue);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: refreshTokenHash },
      include: {
        user: {
          include: {
            student: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      return unauthorizedWithCookieClear();
    }

    if (!storedToken.user.isActive) {
      return unauthorizedWithCookieClear();
    }

    const nextRefresh = issueRefreshToken();
    const accessToken = signAccessToken({
      sub: storedToken.user.id,
      role: storedToken.user.role,
      studentId: storedToken.user.student?.id,
    });

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      await tx.refreshToken.create({
        data: {
          userId: storedToken.user.id,
          tokenHash: nextRefresh.tokenHash,
          expiresAt: nextRefresh.expiresAt,
          userAgent: request.headers.get("user-agent") ?? undefined,
          ip: request.headers.get("x-forwarded-for") ?? undefined,
        },
      });
    });

    const response = NextResponse.json({
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
        mustChangePassword: storedToken.user.mustChangePassword,
        studentId: storedToken.user.student?.id,
      },
      tokens: {
        accessToken,
        refreshToken: nextRefresh.token,
      },
    });
    setAuthCookies(response, accessToken, nextRefresh.token);
    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return serverError("Error while refreshing session");
  }
}
