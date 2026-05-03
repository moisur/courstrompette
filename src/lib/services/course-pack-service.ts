import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { recomputePackRemaining } from "@/lib/course-packs";

export async function listStudentPacks(studentId: string) {
  const packs = await prisma.coursePack.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });

  await prisma.$transaction(async (tx) => {
    for (const pack of packs) {
      await recomputePackRemaining(tx, pack.id);
    }
  });

  return prisma.coursePack.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });
}

interface CreateCoursePackInput {
  studentId: string;
  totalLessons: number;
  purchaseDate: string;
  expiryDate?: string | null;
  price: number;
}

export async function createCoursePack(input: CreateCoursePackInput) {
  return prisma.coursePack.create({
    data: {
      studentId: input.studentId,
      totalLessons: input.totalLessons,
      remainingLessons: input.totalLessons,
      purchaseDate: new Date(input.purchaseDate),
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      price: new Prisma.Decimal(input.price),
    },
  });
}

export async function deleteCoursePack(studentId: string, packId: string) {
  const pack = await prisma.coursePack.findFirst({
    where: {
      id: packId,
      studentId,
    },
    select: {
      id: true,
    },
  });

  if (!pack) {
    throw new Error("PACK_NOT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    const lessons = await tx.lesson.findMany({
      where: { packId },
      select: { id: true },
    });

    if (lessons.length > 0) {
      await tx.lesson.updateMany({
        where: { packId },
        data: {
          isPaid: false,
          packId: null,
        },
      });
    }

    await tx.coursePack.delete({ where: { id: packId } });

    return lessons.length;
  });
}
