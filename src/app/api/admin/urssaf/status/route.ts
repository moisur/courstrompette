import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { UrssafApiError, UrssafConfigurationError, UrssafService } from "@/lib/services/urssaf-service";
import { logUrssafTrace } from "@/lib/urssaf/tracing";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const idClient = String(body.idClient ?? "").trim();

    if (!idClient) {
      return NextResponse.json({ error: "idClient requis" }, { status: 400 });
    }

    logUrssafTrace({
      method: "M020",
      phase: "REQUEST",
      label: "STATUT PARTICULIER",
      payload: { idClient },
    });

    const result = await UrssafService.getClientStatusRequest(idClient);

    logUrssafTrace({
      method: "M020",
      phase: "RESPONSE",
      label: "STATUT PARTICULIER",
      payload: result.data,
      status: result.status,
    });

    return NextResponse.json(result.data);
  } catch (error: unknown) {
    if (error instanceof UrssafApiError) {
      logUrssafTrace({
        method: "M020",
        phase: "RESPONSE",
        label: "STATUT PARTICULIER",
        payload: error.payload,
        status: error.status,
      });

      return NextResponse.json(error.payload, { status: error.status });
    }

    if (error instanceof UrssafConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error("URSSAF status error:", error);

    return NextResponse.json({ error: "Erreur lors de la recuperation du statut URSSAF" }, { status: 500 });
  }
}
