import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const requests = await prisma.urssafPaymentRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
        },
      },
      urssafClient: {
        select: {
          id: true,
          email: true,
          prenoms: true,
          nomNaissance: true,
        },
      },
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
      studentId: requestItem.studentId,
      studentName: requestItem.student.name,
      studentPhone: requestItem.student.phone,
      studentAddress: requestItem.student.address,
      urssafClientId: requestItem.urssafClientId,
      urssafClientEmail: requestItem.urssafClient?.email ?? null,
      urssafClientName: requestItem.urssafClient
        ? `${requestItem.urssafClient.prenoms} ${requestItem.urssafClient.nomNaissance}`.trim()
        : null,
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
      createdAt: requestItem.createdAt.toISOString(),
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
