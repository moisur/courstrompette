import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const clients = await prisma.urssafClient.findMany({
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
    },
  });

  return NextResponse.json(
    clients.map((client) => ({
      id: client.id,
      nomNaissance: client.nomNaissance,
      prenoms: client.prenoms,
      email: client.email,
      dateNaissance: client.dateNaissance,
      createdAt: client.createdAt.toISOString(),
      studentId: client.student?.id ?? null,
      studentName: client.student?.name ?? null,
      phone: client.student?.phone ?? null,
      address: client.student?.address ?? null,
    })),
  );
}
