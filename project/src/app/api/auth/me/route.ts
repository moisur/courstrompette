import { requireSession } from "@/lib/require-auth";

export async function GET(request: Request) {
  const session = await requireSession(request);
  if (session instanceof Response) {
    return session;
  }

  return Response.json({
    user: {
      id: session.id,
      email: session.email,
      role: session.role,
      studentId: session.studentId,
      mustChangePassword: session.mustChangePassword,
    },
  });
}
