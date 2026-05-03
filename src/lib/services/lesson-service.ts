import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { recomputePackRemaining } from "@/lib/course-packs";

type LessonPaymentMethod = "DIRECT" | "PACK" | "MANUAL" | "URSSAF";

interface CreateLessonInput {
  studentId: string;
  date: string;
  amount: number;
  comment?: string | null;
  isPaid?: boolean;
  packId?: string | null;
  paymentMethod?: LessonPaymentMethod;
}

function resolvePaymentMethod(input: CreateLessonInput): LessonPaymentMethod {
  if (input.paymentMethod === "URSSAF") {
    return "URSSAF";
  }

  if (input.packId) {
    return "PACK";
  }

  if (input.isPaid ?? true) {
    return "DIRECT";
  }

  return "MANUAL";
}

export async function createLesson(input: CreateLessonInput) {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({
      where: { id: input.studentId },
      select: {
        id: true,
        urssafClient: {
          select: { id: true },
        },
      },
    });

    if (!student) {
      throw new Error("STUDENT_NOT_FOUND");
    }

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

    let paymentMethod = resolvePaymentMethod(input);
    if (paymentMethod === "MANUAL" && !(input.isPaid ?? true) && student.urssafClient) {
      paymentMethod = "URSSAF";
    }
    const isPaid = paymentMethod === "URSSAF" ? false : (input.isPaid ?? true);

    const lesson = await tx.lesson.create({
      data: {
        studentId: input.studentId,
        date: new Date(input.date),
        amount: new Prisma.Decimal(input.amount),
        comment: input.comment ?? undefined,
        isPaid,
        paymentMethod,
        packId: paymentMethod === "PACK" ? input.packId ?? null : null,
      },
    });

    if (paymentMethod === "PACK" && input.packId) {
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
        paymentMethod: "PACK",
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
        paymentMethod: isPaid ? "DIRECT" : "MANUAL",
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
