import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { syncUrssafPaymentRequests } from "@/lib/services/urssaf-payment-service";
import { UrssafApiError, UrssafConfigurationError } from "@/lib/services/urssaf-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: studentId } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const synced = await syncUrssafPaymentRequests({ studentId });
    return NextResponse.json({ synced });
  } catch (error) {
    if (error instanceof UrssafApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }

    if (error instanceof UrssafConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error("Student URSSAF sync error:", error);
    return NextResponse.json({ error: "Erreur lors de la synchronisation URSSAF" }, { status: 500 });
  }
}
