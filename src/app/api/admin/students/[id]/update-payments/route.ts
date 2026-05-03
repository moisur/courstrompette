import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { applyPackToLessons, setLessonPaymentStatus } from "@/lib/services/lesson-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: studentId } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (typeof body.packId === "string" && Array.isArray(body.lessonIds) && body.lessonIds.length > 0) {
      const result = await applyPackToLessons(studentId, body.packId, body.lessonIds);
      return NextResponse.json({
        success: true,
        updatedLessons: result.updatedLessons,
        remainingLessons: result.remainingLessons,
      });
    }

    if (typeof body.lessonId === "string" && typeof body.isPaid === "boolean") {
      const result = await setLessonPaymentStatus(studentId, body.lessonId, body.isPaid);
      return NextResponse.json({
        success: true,
        lessonId: result.lessonId,
        isPaid: result.isPaid,
      });
    }

    return NextResponse.json({ error: "Parametres invalides" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PACK_NOT_FOUND") {
        return NextResponse.json({ error: "Pack non trouve" }, { status: 404 });
      }
      if (error.message === "NOT_ENOUGH_LESSONS") {
        return NextResponse.json({ error: "Le pack ne contient pas assez de cours restants" }, { status: 400 });
      }
      if (error.message === "LESSON_NOT_FOUND") {
        return NextResponse.json({ error: "Cours non trouve" }, { status: 404 });
      }
    }

    console.error("Admin update payments error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise a jour des paiements" }, { status: 500 });
  }
}
