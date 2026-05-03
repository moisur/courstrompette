import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { UrssafApiError, UrssafConfigurationError, UrssafService } from "@/lib/services/urssaf-service";
import { logUrssafTrace } from "@/lib/urssaf/tracing";

function toIso(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const payload: Record<string, unknown> = {};

    const numFactureTiers = String(body.numFactureTiers ?? "").trim();
    const dateDebut = String(body.dateDebut ?? "").trim();
    const dateFin = String(body.dateFin ?? "").trim();

    if (numFactureTiers) {
      payload.numFactureTiers = [numFactureTiers];
    } else if (dateDebut && dateFin) {
      payload.dateDebut = toIso(dateDebut);
      payload.dateFin = toIso(dateFin);
    } else {
      return NextResponse.json({ error: "Renseignez un numero de facture ou une periode." }, { status: 400 });
    }

    logUrssafTrace({
      method: "M070",
      phase: "REQUEST",
      label: "RECHERCHE DEMANDE DE PAIEMENT",
      payload,
    });

    const result = await UrssafService.searchPaymentRequestsRequest(payload);

    logUrssafTrace({
      method: "M070",
      phase: "RESPONSE",
      label: "RECHERCHE DEMANDE DE PAIEMENT",
      payload: result.data,
      status: result.status,
    });

    return NextResponse.json(result.data);
  } catch (error: unknown) {
    if (error instanceof UrssafApiError) {
      logUrssafTrace({
        method: "M070",
        phase: "RESPONSE",
        label: "RECHERCHE DEMANDE DE PAIEMENT",
        payload: error.payload,
        status: error.status,
      });

      return NextResponse.json(error.payload, { status: error.status });
    }

    if (error instanceof UrssafConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error("URSSAF payment search error:", error);

    return NextResponse.json({ error: "Erreur lors de la recherche des demandes de paiement" }, { status: 500 });
  }
}
