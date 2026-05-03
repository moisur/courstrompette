import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { deleteCoursePack } from "@/lib/services/course-pack-service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; packId: string }> },
) {
  const { id, packId } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const unpaidLessons = await deleteCoursePack(id, packId);
    return NextResponse.json({
      success: true,
      unpaidLessons,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PACK_NOT_FOUND") {
      return NextResponse.json({ error: "Pack non trouve" }, { status: 404 });
    }

    console.error("Admin delete pack error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du pack" }, { status: 500 });
  }
}
