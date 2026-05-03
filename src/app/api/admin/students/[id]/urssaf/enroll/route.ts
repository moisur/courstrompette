import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { UrssafApiError, UrssafConfigurationError, UrssafService } from "@/lib/services/urssaf-service";
import { prisma } from "@/lib/db";
import { logUrssafTrace } from "@/lib/urssaf/tracing";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: studentId } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();

    logUrssafTrace({
      method: "M010",
      phase: "REQUEST",
      label: "INSCRIPTION PARTICULIER",
      payload: body,
    });

    // 1. Logic to register on URSSAF EDI
    const result = await UrssafService.registerClientRequest(body);

    logUrssafTrace({
      method: "M010",
      phase: "RESPONSE",
      label: "INSCRIPTION PARTICULIER",
      payload: result.data,
      status: result.status,
    });

    if (result.data && result.data.idClient) {
      // 2. Save result to database
      await prisma.urssafClient.upsert({
        where: { id: result.data.idClient },
        update: {
          nomNaissance: body.nomNaissance,
          prenoms: body.prenoms,
          email: body.adresseMail,
          dateNaissance: body.dateNaissance,
          studentId: studentId
        },
        create: {
          id: result.data.idClient,
          nomNaissance: body.nomNaissance,
          prenoms: body.prenoms,
          email: body.adresseMail,
          dateNaissance: body.dateNaissance,
          studentId: studentId
        }
      });

      // 3. Mark student as declared
      await prisma.student.update({
        where: { id: studentId },
        data: { declared: true }
      });
    }

    return NextResponse.json(result.data);
  } catch (error: unknown) {
    console.error("URSSAF Enrollment Error:", error);

    if (error instanceof UrssafApiError) {
      logUrssafTrace({
        method: "M010",
        phase: "RESPONSE",
        label: "INSCRIPTION PARTICULIER",
        payload: error.payload,
        status: error.status,
      });

      return NextResponse.json(error.payload, { status: error.status });
    }

    if (error instanceof UrssafConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Erreur lors de l'inscription URSSAF" }, { status: 500 });
  }
}
