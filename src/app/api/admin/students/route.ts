import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth/session";
import { createStudent } from "@/lib/services/student-service";

function mapStudentRecord(student: {
  id: string;
  createdAt: Date;
  name: string;
  phone: string | null;
  address: string | null;
  rate: unknown;
  declared: boolean;
  archived: boolean;
  notes: string | null;
  courseDay: string | null;
  courseHour: string | null;
  user: {
    email: string | null;
    isActive: boolean;
    mustChangePassword: boolean;
  } | null;
  lead: {
    id: string;
    name: string;
    email: string;
    experience: string;
    stage: string;
  } | null;
  urssafClient: {
    id: string;
  } | null;
}) {
  return {
    id: student.id,
    createdAt: student.createdAt.toISOString(),
    name: student.name,
    phone: student.phone,
    address: student.address,
    rate: Number(student.rate),
    declared: student.declared,
    archived: student.archived,
    notes: student.notes,
    courseDay: student.courseDay,
    courseHour: student.courseHour,
    email: student.user?.email ?? student.lead?.email ?? null,
    experience: student.lead?.experience ?? null,
    user: student.user,
    lead: student.lead,
    hasUrssafClient: Boolean(student.urssafClient),
  };
}

export async function GET() {
  const session = await getSessionUser();
  if (!session || !isAdmin(session)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          isActive: true,
          mustChangePassword: true,
        },
      },
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
          experience: true,
          stage: true,
        },
      },
      urssafClient: {
        select: {
          id: true,
        },
      },
    },
  });

  return NextResponse.json(students.map(mapStudentRecord));
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session || !isAdmin(session)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const rate = Number(body.rate ?? 0);

    if (!name) {
      return new NextResponse("Nom requis", { status: 400 });
    }

    if (!Number.isFinite(rate) || rate <= 0) {
      return new NextResponse("Tarif invalide", { status: 400 });
    }

    const result = await createStudent({
      name,
      rate,
      declared: Boolean(body.declared),
      phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
      address: typeof body.address === "string" ? body.address.trim() || null : null,
      notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
      courseDay: typeof body.courseDay === "string" ? body.courseDay.trim() || null : null,
      courseHour: typeof body.courseHour === "string" ? body.courseHour.trim() || null : null,
      email: typeof body.email === "string" ? body.email.trim() : undefined,
      createLogin: Boolean(body.createLogin),
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error && error.message ? error.message : "Internal Server Error";
    console.error("API: Student Create Error", error);
    return new NextResponse(message, { status: 500 });
  }
}
