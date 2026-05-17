import { z } from "zod";
import prisma from "@/lib/db";
import { badRequest, notFound, serverError } from "@/lib/api-responses";
import { numericInputSchema } from "@/lib/number-input";
import { requireAdminSession } from "@/lib/route-helpers";
import { serializeLesson } from "@/lib/serializers";
import { createLesson } from "@/lib/services/lesson-service";

const createLessonSchema = z.object({
  studentId: z.string(),
  date: z.string(),
  amount: numericInputSchema,
  comment: z.string().optional().nullable(),
  isPaid: z.boolean().optional(),
  packId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession(request);
    if (session instanceof Response) {
      return session;
    }

    const body = await request.json();
    const parsed = createLessonSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid lesson payload");
    }

    if (!Number.isFinite(parsed.data.amount)) {
      return badRequest("Amount must be a valid number");
    }

    const lesson = await createLesson(parsed.data);
    return Response.json(serializeLesson(lesson));
  } catch (error) {
    if (error instanceof Error && error.message === "PACK_NOT_FOUND") {
      return notFound("Pack not found");
    }

    console.error("Error creating lesson:", error);
    return serverError("Error creating lesson");
  }
}

export async function GET(request: Request) {
  try {
    const session = await requireAdminSession(request);
    if (session instanceof Response) {
      return session;
    }

    const lessons = await prisma.lesson.findMany({
      orderBy: {
        date: "desc",
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true,
                isActive: true,
                mustChangePassword: true,
              },
            },
          },
        },
      },
    });

    return Response.json(lessons.map((lesson) => serializeLesson(lesson)));
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return serverError("Error fetching lessons");
  }
}
