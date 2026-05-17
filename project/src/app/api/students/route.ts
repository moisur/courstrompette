import { z } from "zod";
import prisma from "@/lib/db";
import { badRequest, serverError } from "@/lib/api-responses";
import { numericInputSchema } from "@/lib/number-input";
import { requireAdminSession } from "@/lib/route-helpers";
import { serializeStudent } from "@/lib/serializers";
import { createStudentWithOptionalLogin, studentUserSelect } from "@/lib/services/student-service";

const createStudentSchema = z.object({
  name: z.string().min(1),
  rate: numericInputSchema,
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  courseDay: z.string().optional().nullable(),
  courseHour: z.string().optional().nullable(),
  email: z.string().email().optional(),
  createLogin: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession(request);
    if (session instanceof Response) {
      return session;
    }

    const body = await request.json();
    const parsed = createStudentSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid student payload");
    }

    if (!Number.isFinite(parsed.data.rate)) {
      return badRequest("Rate must be a valid number");
    }

    if (parsed.data.createLogin && !parsed.data.email) {
      return badRequest("Email is required when creating login credentials");
    }

    const result = await createStudentWithOptionalLogin(parsed.data);

    return Response.json({
      ...serializeStudent(result.student),
      temporaryPassword: result.temporaryPassword ?? undefined,
    });
  } catch (error) {
    const prismaError = error as { code?: string } | null;
    if (prismaError?.code === "P2002") {
      return badRequest("This email is already used by another account");
    }

    console.error("Error creating student:", error);
    return serverError("Error creating student");
  }
}

export async function GET(request: Request) {
  try {
    const session = await requireAdminSession(request);
    if (session instanceof Response) {
      return session;
    }

    const students = await prisma.student.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: studentUserSelect,
    });

    return Response.json(students.map((student) => serializeStudent(student)));
  } catch (error) {
    console.error("Error fetching students:", error);
    return serverError("Error fetching students");
  }
}
