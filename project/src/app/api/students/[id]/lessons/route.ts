import prisma from "@/lib/db";
import { serverError } from "@/lib/api-responses";
import { requireSession } from "@/lib/require-auth";
import { requireStudentAccess, RouteContext } from "@/lib/route-helpers";
import { serializeLesson } from "@/lib/serializers";

type GetStudentLessonsContext = RouteContext<{ id: string }>;

export async function GET(request: Request, context: GetStudentLessonsContext) {
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

    const lessons = await prisma.lesson.findMany({
      where: { studentId: id },
      orderBy: { date: "desc" },
    });

    return Response.json(lessons.map((lesson) => serializeLesson(lesson)));
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return serverError("Error fetching lessons");
  }
}
