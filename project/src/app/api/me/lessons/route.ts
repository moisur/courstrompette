import prisma from "@/lib/db";
import { serverError } from "@/lib/api-responses";
import { requireSession } from "@/lib/require-auth";
import { requireStudentAccount } from "@/lib/route-helpers";
import { serializeLesson } from "@/lib/serializers";

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    if (session instanceof Response) {
      return session;
    }

    const studentGate = requireStudentAccount(session);
    if (studentGate) {
      return studentGate;
    }

    const studentId = session.studentId as string;
    const lessons = await prisma.lesson.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
    });

    return Response.json(lessons.map((lesson) => serializeLesson(lesson)));
  } catch (error) {
    console.error("Get me lessons error:", error);
    return serverError("Error fetching lessons");
  }
}
