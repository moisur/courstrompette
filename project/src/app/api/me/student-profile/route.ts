import prisma from "@/lib/db";
import { notFound, serverError } from "@/lib/api-responses";
import { requireSession } from "@/lib/require-auth";
import { requireStudentAccount } from "@/lib/route-helpers";
import { serializeStudent } from "@/lib/serializers";
import { studentUserSelect } from "@/lib/services/student-service";

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
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: studentUserSelect,
    });

    if (!student) {
      return notFound("Student profile not found");
    }

    return Response.json(serializeStudent(student));
  } catch (error) {
    console.error("Get me student profile error:", error);
    return serverError("Error fetching student profile");
  }
}
