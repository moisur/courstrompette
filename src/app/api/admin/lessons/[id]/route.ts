import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { deleteLessonById } from "@/lib/services/lesson-service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    await deleteLessonById(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "LESSON_NOT_FOUND") {
      return NextResponse.json({ error: "Cours non trouve" }, { status: 404 });
    }

    console.error("Admin delete lesson error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du cours" }, { status: 500 });
  }
}
