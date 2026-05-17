import { z } from "zod";
import { badRequest, serverError } from "@/lib/api-responses";
import { numericInputSchema } from "@/lib/number-input";
import { requireAdminSession, requireStudentAccess, RouteContext } from "@/lib/route-helpers";
import { requireSession } from "@/lib/require-auth";
import { serializeCoursePack } from "@/lib/serializers";
import { createCoursePack, listStudentPacks } from "@/lib/services/course-pack-service";

const createPackSchema = z.object({
  totalLessons: numericInputSchema,
  purchaseDate: z.string(),
  expiryDate: z.string().optional().nullable(),
  price: numericInputSchema,
});

type StudentPacksContext = RouteContext<{ id: string }>;

export async function GET(request: Request, context: StudentPacksContext) {
  try {
    const session = await requireSession(request);
    if (session instanceof Response) {
      return session;
    }

    const { id } = await context.params;
    const accessGate = requireStudentAccess(session, id);
    if (accessGate) {
      return accessGate;
    }

    const packs = await listStudentPacks(id);
    return Response.json(packs.map((pack) => serializeCoursePack(pack)));
  } catch (error) {
    console.error("Error fetching course packs:", error);
    return serverError("Error fetching course packs");
  }
}

export async function POST(request: Request, context: StudentPacksContext) {
  try {
    const session = await requireAdminSession(request);
    if (session instanceof Response) {
      return session;
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = createPackSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid course pack payload");
    }

    if (!Number.isInteger(parsed.data.totalLessons) || parsed.data.totalLessons <= 0) {
      return badRequest("totalLessons must be a positive integer");
    }

    if (!Number.isFinite(parsed.data.price)) {
      return badRequest("price must be a valid number");
    }

    const pack = await createCoursePack({
      studentId: id,
      totalLessons: parsed.data.totalLessons,
      purchaseDate: parsed.data.purchaseDate,
      expiryDate: parsed.data.expiryDate,
      price: parsed.data.price,
    });

    return Response.json(serializeCoursePack(pack));
  } catch (error) {
    console.error("Error creating course pack:", error);
    return serverError("Error creating course pack");
  }
}
