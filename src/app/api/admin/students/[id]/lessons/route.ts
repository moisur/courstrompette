import { NextResponse } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth/session";
import { createLesson } from "@/lib/services/lesson-service";
import { submitSingleLessonAsUrssafDP, UrssafPaymentSubmissionError } from "@/lib/services/urssaf-payment-service";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  const { id } = await params;

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Admin can see all, students only their own
  if (!isAdmin(session) && session.studentId !== id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const lessons = await prisma.lesson.findMany({
    where: { studentId: id },
    orderBy: { date: "desc" },
    include: {
      pack: true,
      urssafPaymentRequest: {
        select: {
          id: true,
          numFactureTiers: true,
          idDemandePaiement: true,
          statutCode: true,
          statutLabel: true,
          submittedAt: true,
          lastSyncedAt: true,
        },
      },
    }
  });

  return NextResponse.json(lessons);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  const { id } = await params;

  if (!session || !isAdmin(session)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const lesson = await createLesson({
      ...body,
      studentId: id
    });

    // If the lesson is URSSAF, automatically submit the DP (M050)
    if (lesson.paymentMethod === "URSSAF") {
      try {
        const dpResult = await submitSingleLessonAsUrssafDP(id, lesson.id);
        return NextResponse.json({
          lesson,
          urssafDP: {
            numFactureTiers: dpResult.numFactureTiers,
            idDemandePaiement: dpResult.idDemandePaiement,
            statutCode: dpResult.statutCode,
            statutLabel: dpResult.statutLabel,
          },
        });
      } catch (dpError: any) {
        // Lesson was created but DP failed — return lesson with DP error info
        console.error("API: URSSAF DP auto-submit failed", dpError);
        const dpErrorMessage = dpError instanceof UrssafPaymentSubmissionError
          ? dpError.message
          : dpError?.message || "Erreur de transmission URSSAF";
        return NextResponse.json({
          lesson,
          urssafDP: null,
          urssafDPError: dpErrorMessage,
        });
      }
    }

    return NextResponse.json(lesson);
  } catch (error: any) {
    console.error("API: Lesson Create Error", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
