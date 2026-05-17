import { z } from "zod";
import prisma from "@/lib/db";
import { badRequest, notFound, serverError } from "@/lib/api-responses";
import { numericInputSchema } from "@/lib/number-input";
import { requireAdminSession, requireStudentAccess, RouteContext } from "@/lib/route-helpers";
import { requireSession } from "@/lib/require-auth";
import { serializeStudent } from "@/lib/serializers";
import { deleteStudentWithLogin, studentUserSelect, updateStudentWithLogin } from "@/lib/services/student-service";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  rate: numericInputSchema.optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  courseDay: z.string().nullable().optional(),
  courseHour: z.string().nullable().optional(),
  declared: z.boolean().optional(),
  archived: z.boolean().optional(),
  activationEmail: z.string().email().optional(),
  activateLogin: z.boolean().optional(),
  deactivateLogin: z.boolean().optional(),
  resetPassword: z.boolean().optional(),
});

type StudentRouteContext = RouteContext<{ id: string }>;

export async function GET(request: Request, context: StudentRouteContext) {
  try {
    const session = await requireSession(request);
    if (session instanceof Response) {
      return session;
    }

    const { id } = await context.params;
    const accessGate = requireStudentAccess(session, id);
    if (accessGate) {
      return accessGate;
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: studentUserSelect,
    });

    if (!student) {
      return notFound("Student not found");
    }

    return Response.json(serializeStudent(student));
  } catch (error) {
    console.error("Error fetching student:", error);
    return serverError("Error fetching student");
  }
}

export async function PATCH(request: Request, context: StudentRouteContext) {
  try {
    const session = await requireAdminSession(request);
    if (session instanceof Response) {
      return session;
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid student payload");
    }

    if (parsed.data.rate !== undefined && !Number.isFinite(parsed.data.rate)) {
      return badRequest("Rate must be a valid number");
    }

    const result = await updateStudentWithLogin({ id, ...parsed.data });

    return Response.json({
      ...serializeStudent(result.student),
      temporaryPassword: result.temporaryPassword ?? undefined,
    });
  } catch (error) {
    const prismaError = error as { code?: string } | null;
    if (prismaError?.code === "P2002") {
      return badRequest("This email is already used by another account");
    }

    if (error instanceof Error) {
      if (error.message === "ACTIVATION_EMAIL_REQUIRED") {
        return badRequest("Activation email is required");
      }
      if (error.message === "STUDENT_NOT_FOUND") {
        return notFound("Student not found");
      }
    }

    console.error("Error updating student:", error);
    return serverError("Error updating student");
  }
}

export async function DELETE(request: Request, context: StudentRouteContext) {
  try {
    const session = await requireAdminSession(request);
    if (session instanceof Response) {
      return session;
    }

    const { id } = await context.params;
    await deleteStudentWithLogin(id);

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "STUDENT_NOT_FOUND") {
      return notFound("Student not found");
    }

    console.error("Error deleting student:", error);
    return serverError("Error deleting student");
  }
}
