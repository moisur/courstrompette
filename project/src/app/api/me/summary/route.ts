import prisma from "@/lib/db";
import { serverError } from "@/lib/api-responses";
import { requireSession } from "@/lib/require-auth";
import { requireStudentAccount } from "@/lib/route-helpers";

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
    const [lessons, packs] = await Promise.all([
      prisma.lesson.findMany({
        where: { studentId },
      }),
      prisma.coursePack.findMany({
        where: {
          studentId,
          remainingLessons: { gt: 0 },
        },
      }),
    ]);

    const paidLessons = lessons.filter((lesson) => lesson.isPaid);
    const unpaidLessons = lessons.filter((lesson) => !lesson.isPaid);

    const totalAmount = lessons.reduce((sum, lesson) => sum + Number(lesson.amount.toString()), 0);
    const paidAmount = paidLessons.reduce((sum, lesson) => sum + Number(lesson.amount.toString()), 0);
    const unpaidAmount = unpaidLessons.reduce((sum, lesson) => sum + Number(lesson.amount.toString()), 0);

    return Response.json({
      totalLessons: lessons.length,
      paidLessons: paidLessons.length,
      unpaidLessons: unpaidLessons.length,
      totalAmount,
      paidAmount,
      unpaidAmount,
      activePacks: packs.length,
    });
  } catch (error) {
    console.error("Get me summary error:", error);
    return serverError("Error fetching summary");
  }
}
