import { z } from "zod";
import { badRequest, notFound, serverError } from "@/lib/api-responses";
import { requireAdminSession, RouteContext } from "@/lib/route-helpers";
import { applyPackToLessons, setLessonPaymentStatus } from "@/lib/services/lesson-service";

const usePackSchema = z.object({
  packId: z.string(),
  lessonIds: z.array(z.string()).min(1),
});

const singleLessonSchema = z.object({
  lessonId: z.string(),
  isPaid: z.boolean(),
});

type UpdatePaymentsContext = RouteContext<{ id: string }>;

export async function POST(request: Request, context: UpdatePaymentsContext) {
  try {
    const session = await requireAdminSession(request);
    if (session instanceof Response) {
      return session;
    }

    const { id: studentId } = await context.params;
    const body = await request.json();

    const parsedPackRequest = usePackSchema.safeParse(body);
    if (parsedPackRequest.success) {
      const result = await applyPackToLessons(studentId, parsedPackRequest.data.packId, parsedPackRequest.data.lessonIds);
      return Response.json({
        success: true,
        updatedLessons: result.updatedLessons,
        remainingLessons: result.remainingLessons,
      });
    }

    const parsedSingleLessonRequest = singleLessonSchema.safeParse(body);
    if (parsedSingleLessonRequest.success) {
      const result = await setLessonPaymentStatus(studentId, parsedSingleLessonRequest.data.lessonId, parsedSingleLessonRequest.data.isPaid);
      return Response.json({
        success: true,
        lessonId: result.lessonId,
        isPaid: result.isPaid,
      });
    }

    return badRequest("Invalid request parameters");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PACK_NOT_FOUND") {
        return notFound("Pack not found");
      }
      if (error.message === "NOT_ENOUGH_LESSONS") {
        return badRequest("Not enough lessons remaining in the pack");
      }
      if (error.message === "LESSON_NOT_FOUND") {
        return notFound("Lesson not found");
      }
    }

    console.error("Error updating payments:", error);
    return serverError("Error updating payments");
  }
}
