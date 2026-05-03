import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { UrssafApiError, UrssafConfigurationError, UrssafService } from "@/lib/services/urssaf-service";
import { logUrssafTrace } from "@/lib/urssaf/tracing";

function buildFactureRef(studentName: string) {
  const slug = studentName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();

  return `FACT-${slug}-${Date.now()}`;
}

function toIsoOrNow(value: string | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function formatIntervenantIdentifier(value: string) {
  const trimmed = value.trim().toUpperCase();

  if (!trimmed) {
    return "";
  }

  if (/^(SAP\d{9}|SIR\d{14})$/.test(trimmed)) {
    return trimmed;
  }

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (/^\d{14}$/.test(digitsOnly)) {
    return `SIR${digitsOnly}`;
  }

  if (/^\d{9}$/.test(digitsOnly)) {
    return `SAP${digitsOnly}`;
  }

  return trimmed;
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const studentId = String(body.studentId ?? "").trim();

    if (!studentId) {
      return NextResponse.json({ error: "studentId requis" }, { status: 400 });
    }

    const amount = Number(body.amount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        urssafClient: true,
      },
    });

    if (!student || !student.urssafClient) {
      return NextResponse.json({ error: "Eleve non inscrit a l'URSSAF" }, { status: 400 });
    }

    const dateFacture = toIsoOrNow(typeof body.dateFacture === "string" ? body.dateFacture : undefined);
    const dateDebutEmploi = toIsoOrNow(typeof body.dateDebutEmploi === "string" ? body.dateDebutEmploi : undefined);
    const dateFinEmploi = toIsoOrNow(typeof body.dateFinEmploi === "string" ? body.dateFinEmploi : undefined);
    const numFactureTiers = String(body.numFactureTiers ?? "").trim() || buildFactureRef(student.name);
    const siretIntervenant =
      String(body.siretIntervenant ?? "").trim() ||
      process.env.URSSAF_INTERVENANT_SIRET?.trim() ||
      process.env.SIRET?.trim() ||
      "";
    const intervenantIdentifier = formatIntervenantIdentifier(siretIntervenant);
    const idTiersFacturation =
      process.env.URSSAF_TIERS_FACTURATION_ID?.trim() ||
      process.env.URSSAF_ID_TIERS_FACTURATION?.trim() ||
      `facturation-${student.id}`;

    const payload = [
      {
        idTiersFacturation,
        idClient: student.urssafClient.id,
        dateNaissanceClient: student.urssafClient.dateNaissance,
        numFactureTiers,
        dateFacture,
        dateDebutEmploi,
        dateFinEmploi,
        mntFactureTTC: amount,
        mntFactureHT: amount,
        inputPrestations: [
          {
            codeNature: "100",
            codeActivite: "100A001",
            quantite: 1,
            unite: "FORFAIT",
            mntUnitaireTTC: amount,
            mntPrestationTTC: amount,
            mntPrestationHT: amount,
            mntPrestationTVA: 0,
            complement2: intervenantIdentifier || undefined,
          },
        ],
      },
    ];

    logUrssafTrace({
      method: "M050",
      phase: "REQUEST",
      label: "TRANSMISSION DEMANDE DE PAIEMENT",
      payload,
    });

    const result = await UrssafService.submitPaymentRequestRequest(payload);

    logUrssafTrace({
      method: "M050",
      phase: "RESPONSE",
      label: "TRANSMISSION DEMANDE DE PAIEMENT",
      payload: result.data,
      status: result.status,
    });

    return NextResponse.json(result.data);
  } catch (error: unknown) {
    if (error instanceof UrssafApiError) {
      logUrssafTrace({
        method: "M050",
        phase: "RESPONSE",
        label: "TRANSMISSION DEMANDE DE PAIEMENT",
        payload: error.payload,
        status: error.status,
      });

      return NextResponse.json(error.payload, { status: error.status });
    }

    if (error instanceof UrssafConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error("URSSAF payment error:", error);

    return NextResponse.json({ error: "Erreur lors de la transmission de la demande de paiement" }, { status: 500 });
  }
}
