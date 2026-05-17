import { notFound, serverError } from "@/lib/api-responses";
import { requireAdminSession, RouteContext } from "@/lib/route-helpers";
import { deleteLessonById } from "@/lib/services/lesson-service";

type DeleteLessonContext = RouteContext<{ id: string }>;

export async function DELETE(request: Request, context: DeleteLessonContext) {
  try {
    const session = await requireAdminSession(request);
    if (session instanceof Response) {
      return session;
    }

    const { id } = await context.params;
    await deleteLessonById(id);

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "LESSON_NOT_FOUND") {
      return notFound("Lesson not found");
    }

    console.error("Error deleting lesson:", error);
    return serverError("Error deleting lesson");
  }
}
