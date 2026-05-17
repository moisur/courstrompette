import { serverError } from "@/lib/api-responses";
import { requireSession } from "@/lib/require-auth";
import { requireStudentAccount } from "@/lib/route-helpers";
import { serializeCoursePack } from "@/lib/serializers";
import { listStudentPacks } from "@/lib/services/course-pack-service";

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
    const packs = await listStudentPacks(studentId);
    return Response.json(packs.map((pack) => serializeCoursePack(pack)));
  } catch (error) {
    console.error("Get me packs error:", error);
    return serverError("Error fetching packs");
  }
}
