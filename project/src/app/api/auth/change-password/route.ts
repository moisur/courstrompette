import { z } from "zod";
import prisma from "@/lib/db";
import { badRequest, serverError, unauthorized } from "@/lib/api-responses";
import { hashPassword, verifyPassword } from "@/lib/auth/security";
import { requireSession } from "@/lib/require-auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).optional(),
  newPassword: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    if (session instanceof Response) {
      return session;
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid password payload");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        passwordHash: true,
        mustChangePassword: true,
      },
    });

    if (!user) {
      return unauthorized();
    }

    if (!user.mustChangePassword) {
      if (!parsed.data.currentPassword) {
        return badRequest("Current password is required");
      }

      const currentMatches = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
      if (!currentMatches) {
        return unauthorized("Current password is incorrect");
      }
    }

    const nextHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: nextHash,
        mustChangePassword: false,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return serverError("Error while changing password");
  }
}
