import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { recomputePackRemaining } from "@/lib/course-packs";

interface CreateLessonInput {
  studentId: string;
  date: string;
  amount: number;
  comment?: string | null;
  isPaid?: boolean;
  packId?: string | null;
}

export async function createLesson(input: CreateLessonInput) {
  return prisma.$transaction(async (tx) => {
    if (input.packId) {
      const pack = await tx.coursePack.findFirst({
        where: {
          id: input.packId,
          studentId: input.studentId,
        },
      });

      if (!pack) {
        throw new Error("PACK_NOT_FOUND");
      }
    }

    const lesson = await tx.lesson.create({
      data: {
        studentId: input.studentId,
        date: new Date(input.date),
        amount: new Prisma.Decimal(input.amount),
        comment: input.comment ?? undefined,
        isPaid: input.isPaid ?? true,
        packId: input.packId ?? null,
      },
    });

    if (input.packId) {
      await recomputePackRemaining(tx, input.packId);
    }

    return lesson;
  });
}

export async function deleteLessonById(id: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    select: {
      id: true,
      packId: true,
    },
  });

  if (!lesson) {
    throw new Error("LESSON_NOT_FOUND");
  }

  await prisma.$transaction(async (tx) => {
    await tx.lesson.delete({ where: { id } });
    if (lesson.packId) {
      await recomputePackRemaining(tx, lesson.packId);
    }
  });
}

export async function applyPackToLessons(studentId: string, packId: string, lessonIds: string[]) {
  return prisma.$transaction(async (tx) => {
    const pack = await tx.coursePack.findFirst({
      where: {
        id: packId,
        studentId,
      },
    });

    if (!pack) {
      throw new Error("PACK_NOT_FOUND");
    }

    if (pack.remainingLessons < lessonIds.length) {
      throw new Error("NOT_ENOUGH_LESSONS");
    }

    const updateResult = await tx.lesson.updateMany({
      where: {
        id: { in: lessonIds },
        studentId,
      },
      data: {
        isPaid: true,
        packId: pack.id,
      },
    });

    const remainingLessons = await recomputePackRemaining(tx, pack.id);
    return {
      updatedLessons: updateResult.count,
      remainingLessons,
    };
  });
}

export async function setLessonPaymentStatus(studentId: string, lessonId: string, isPaid: boolean) {
  return prisma.$transaction(async (tx) => {
    const lesson = await tx.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson || lesson.studentId !== studentId) {
      throw new Error("LESSON_NOT_FOUND");
    }

    const previousPackId = lesson.packId;
    await tx.lesson.update({
      where: { id: lesson.id },
      data: {
        isPaid,
        packId: isPaid ? lesson.packId : null,
      },
    });

    if (previousPackId) {
      await recomputePackRemaining(tx, previousPackId);
    }

    return {
      lessonId: lesson.id,
      isPaid,
    };
  });
}
