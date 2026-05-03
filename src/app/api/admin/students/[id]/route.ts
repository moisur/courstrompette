import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { deleteStudent } from "@/lib/services/student-service";

function mapStudentResponse(student: {
  id: string;
  name: string;
  rate: unknown;
  declared: boolean;
  archived: boolean;
  phone: string | null;
  address: string | null;
  notes: string | null;
  courseDay: string | null;
  courseHour: string | null;
  user: {
    email: string | null;
    isActive: boolean;
    mustChangePassword: boolean;
  } | null;
  urssafClient: unknown;
  lead: {
    email: string;
    experience: string;
  } | null;
}) {
  return {
    ...student,
    email: student.user?.email ?? student.lead?.email ?? null,
    experience: student.lead?.experience ?? null,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
            mustChangePassword: true,
          },
        },
        urssafClient: true,
        lead: {
          select: {
            email: true,
            experience: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Eleve non trouve" }, { status: 404 });
    }

    return NextResponse.json(mapStudentResponse(student));
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { declared, archived, name, rate, phone, address, courseDay, courseHour, notes } = body;

    const updated = await prisma.student.update({
      where: { id },
      data: {
        declared,
        archived,
        name,
        phone,
        address,
        courseDay,
        courseHour,
        notes,
        rate: rate === "" || rate === null || typeof rate === "undefined" ? undefined : Number(rate),
      },
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
            mustChangePassword: true,
          },
        },
        urssafClient: true,
        lead: {
          select: {
            email: true,
            experience: true,
          },
        },
      },
    });

    return NextResponse.json(mapStudentResponse(updated));
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise a jour" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    await deleteStudent(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "STUDENT_NOT_FOUND") {
      return NextResponse.json({ error: "Eleve non trouve" }, { status: 404 });
    }

    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
