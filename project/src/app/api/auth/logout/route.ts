import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { clearAuthCookies, getRequestCookie } from "@/lib/auth/cookies";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { hashOpaqueToken } from "@/lib/auth/security";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const refreshFromBody = body && typeof body.refreshToken === "string" ? body.refreshToken : null;
  const refreshToken = getRequestCookie(request, REFRESH_TOKEN_COOKIE) || refreshFromBody;
  if (refreshToken) {
    const tokenHash = hashOpaqueToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
