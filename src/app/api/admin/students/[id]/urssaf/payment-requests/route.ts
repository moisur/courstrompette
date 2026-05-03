import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { submitPendingUrssafLessonsForStudent, UrssafPaymentSubmissionError } from "@/lib/services/urssaf-payment-service";
import { UrssafApiError, UrssafConfigurationError } from "@/lib/services/urssaf-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: studentId } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const requests = await prisma.urssafPaymentRequest.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: {
      lessons: {
        select: {
          id: true,
          date: true,
          amount: true,
          comment: true,
          isPaid: true,
        },
        orderBy: { date: "asc" },
      },
    },
  });

  return NextResponse.json(
    requests.map((requestItem) => ({
      id: requestItem.id,
      numFactureTiers: requestItem.numFactureTiers,
      idDemandePaiement: requestItem.idDemandePaiement,
      statutCode: requestItem.statutCode,
      statutLabel: requestItem.statutLabel,
      amountTtc: Number(requestItem.amountTtc),
      dateFacture: requestItem.dateFacture.toISOString(),
      dateDebutEmploi: requestItem.dateDebutEmploi.toISOString(),
      dateFinEmploi: requestItem.dateFinEmploi.toISOString(),
      submittedAt: requestItem.submittedAt?.toISOString() ?? null,
      lastSyncedAt: requestItem.lastSyncedAt?.toISOString() ?? null,
      lessons: requestItem.lessons.map((lesson) => ({
        id: lesson.id,
        date: lesson.date.toISOString(),
        amount: Number(lesson.amount),
        comment: lesson.comment,
        isPaid: lesson.isPaid,
      })),
    })),
  );
}

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
    const body = await request.json().catch(() => ({}));
    const lessonIds = Array.isArray(body.lessonIds)
      ? body.lessonIds.filter((value: unknown): value is string => typeof value === "string" && value.trim().length > 0)
      : undefined;

    const result = await submitPendingUrssafLessonsForStudent(studentId, lessonIds);

    return NextResponse.json({
      requestId: result.request.id,
      numFactureTiers: result.request.numFactureTiers,
      statutCode: result.request.statutCode,
      statutLabel: result.request.statutLabel,
      response: result.response,
    });
  } catch (error) {
    if (error instanceof UrssafPaymentSubmissionError) {
      console.error("UrssafPaymentSubmissionError:", JSON.stringify(error.payload, null, 2));
      return NextResponse.json(error.payload, { status: error.status });
    }

    if (error instanceof UrssafApiError) {
      console.error("UrssafApiError:", JSON.stringify(error.payload, null, 2));
      return NextResponse.json(error.payload, { status: error.status });
    }

    if (error instanceof UrssafConfigurationError) {
      console.error("UrssafConfigurationError:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (error instanceof Error) {
      console.error("Error submitting URSSAF lessons:", error.message);
      if (error.message === "URSSAF_STUDENT_NOT_READY") {
        return NextResponse.json({ error: "Eleve non pret pour l'URSSAF" }, { status: 400 });
      }
      if (error.message === "NO_PENDING_URSSAF_LESSONS") {
        return NextResponse.json({ error: "Aucun cours URSSAF en attente d'envoi" }, { status: 400 });
      }
      if (error.message === "URSSAF_MULTIPLE_MONTHS") {
        return NextResponse.json({ error: "Les cours URSSAF a transmettre doivent etre dans le meme mois" }, { status: 400 });
      }
    }

    console.error("Student URSSAF payment request unknown error:", error);
    return NextResponse.json({ error: "Erreur lors de la transmission URSSAF" }, { status: 500 });
  }
}
