import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { badRequest, forbidden, serverError, unauthorized } from "@/lib/api-responses";
import { normalizeEmail, verifyPassword } from "@/lib/auth/security";
import { setAuthCookies } from "@/lib/auth/cookies";
import { issueRefreshToken, signAccessToken } from "@/lib/auth/tokens";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid email or password format");
    }

    const email = normalizeEmail(parsed.data.email);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return unauthorized("Invalid credentials");
    }

    if (!user.isActive) {
      return forbidden("Account is inactive");
    }

    const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!passwordMatches) {
      return unauthorized("Invalid credentials");
    }

    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
      studentId: user.student?.id,
    });

    const refresh = issueRefreshToken();
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refresh.tokenHash,
        expiresAt: refresh.expiresAt,
        userAgent: request.headers.get("user-agent") ?? undefined,
        ip: request.headers.get("x-forwarded-for") ?? undefined,
      },
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        studentId: user.student?.id,
      },
      tokens: {
        accessToken,
        refreshToken: refresh.token,
      },
    });
    setAuthCookies(response, accessToken, refresh.token);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return serverError("Error while logging in");
  }
}
