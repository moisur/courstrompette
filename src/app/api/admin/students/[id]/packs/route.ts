import { NextResponse } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth/session";
import { createCoursePack, listStudentPacks } from "@/lib/services/course-pack-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  const { id } = await params;

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Admin can see all, students only their own
  if (!isAdmin(session) && session.studentId !== id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const packs = await listStudentPacks(id);
  return NextResponse.json(packs);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  const { id } = await params;

  if (!session || !isAdmin(session)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const pack = await createCoursePack({
      ...body,
      studentId: id
    });
    return NextResponse.json(pack);
  } catch (error: any) {
    console.error("API: Course Pack Create Error", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
