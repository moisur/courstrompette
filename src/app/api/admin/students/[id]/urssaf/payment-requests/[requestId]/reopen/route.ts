import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { reopenFailedUrssafPaymentRequest } from "@/lib/services/urssaf-payment-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> },
) {
  const { id: studentId, requestId } = await params;
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const result = await reopenFailedUrssafPaymentRequest(studentId, requestId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "URSSAF_REQUEST_NOT_FOUND") {
        return NextResponse.json({ error: "Demande URSSAF introuvable" }, { status: 404 });
      }

      if (error.message === "URSSAF_REQUEST_NOT_REOPENABLE") {
        return NextResponse.json(
          { error: "Seules les demandes URSSAF en erreur peuvent etre remises a envoyer" },
          { status: 400 },
        );
      }
    }

    console.error("Student URSSAF reopen request error:", error);
    return NextResponse.json({ error: "Erreur lors de la remise en attente URSSAF" }, { status: 500 });
  }
}
