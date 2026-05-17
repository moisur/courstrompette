import { notFound, serverError } from "@/lib/api-responses";
import { requireAdminSession, RouteContext } from "@/lib/route-helpers";
import { deleteCoursePack } from "@/lib/services/course-pack-service";

type DeletePackContext = RouteContext<{ id: string; packId: string }>;

export async function DELETE(request: Request, context: DeletePackContext) {
  try {
    const session = await requireAdminSession(request);
    if (session instanceof Response) {
      return session;
    }

    const { id, packId } = await context.params;
    const unpaidLessons = await deleteCoursePack(id, packId);

    return Response.json({
      success: true,
      unpaidLessons,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PACK_NOT_FOUND") {
      return notFound("Pack not found");
    }

    console.error("Error deleting pack:", error);
    return serverError("Error deleting pack");
  }
}
