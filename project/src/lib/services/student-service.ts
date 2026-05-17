import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { generateRandomPassword, hashPassword, normalizeEmail } from "@/lib/auth/security";

export const studentUserSelect = {
  user: {
    select: {
      email: true,
      isActive: true,
      mustChangePassword: true,
    },
  },
} as const;

export interface CreateStudentInput {
  name: string;
  rate: number;
  phone?: string | null;
  address?: string | null;
  courseDay?: string | null;
  courseHour?: string | null;
  email?: string;
  createLogin?: boolean;
}

export interface UpdateStudentInput {
  id: string;
  name?: string;
  rate?: number;
  phone?: string | null;
  address?: string | null;
  courseDay?: string | null;
  courseHour?: string | null;
  declared?: boolean;
  archived?: boolean;
  activationEmail?: string;
  activateLogin?: boolean;
  deactivateLogin?: boolean;
  resetPassword?: boolean;
}

export async function createStudentWithOptionalLogin(input: CreateStudentInput) {
  return prisma.$transaction(async (tx) => {
    let userId: string | null = null;
    let temporaryPassword: string | null = null;

    if (input.email) {
      temporaryPassword = generateRandomPassword();
      const passwordHash = await hashPassword(temporaryPassword);

      const user = await tx.user.create({
        data: {
          email: normalizeEmail(input.email),
          passwordHash,
          role: "STUDENT",
          isActive: true,
          mustChangePassword: true,
        },
      });

      userId = user.id;
    }

    const student = await tx.student.create({
      data: {
        name: input.name,
        rate: new Prisma.Decimal(input.rate),
        declared: false,
        archived: false,
        phone: input.phone ?? undefined,
        address: input.address ?? undefined,
        courseDay: input.courseDay ?? undefined,
        courseHour: input.courseHour ?? undefined,
        userId: userId ?? undefined,
      },
      include: studentUserSelect,
    });

    return {
      student,
      temporaryPassword,
    };
  });
}

export async function updateStudentWithLogin(input: UpdateStudentInput) {
  const student = await prisma.student.findUnique({
    where: { id: input.id },
    include: { user: true },
  });

  if (!student) {
    throw new Error("STUDENT_NOT_FOUND");
  }

  const studentUpdateData: Prisma.StudentUpdateInput = {};

  if (input.name !== undefined) studentUpdateData.name = input.name;
  if (input.rate !== undefined) studentUpdateData.rate = new Prisma.Decimal(input.rate);
  if (input.phone !== undefined) studentUpdateData.phone = input.phone ?? null;
  if (input.address !== undefined) studentUpdateData.address = input.address ?? null;
  if (input.courseDay !== undefined) studentUpdateData.courseDay = input.courseDay ?? null;
  if (input.courseHour !== undefined) studentUpdateData.courseHour = input.courseHour ?? null;
  if (input.declared !== undefined) studentUpdateData.declared = input.declared;
  if (input.archived !== undefined) studentUpdateData.archived = input.archived;

  return prisma.$transaction(async (tx) => {
    let temporaryPassword: string | null = null;

    if (Object.keys(studentUpdateData).length > 0) {
      await tx.student.update({
        where: { id: input.id },
        data: studentUpdateData,
      });
    }

    if (input.deactivateLogin && student.userId) {
      await tx.user.update({
        where: { id: student.userId },
        data: { isActive: false },
      });
    }

    const shouldActivateOrReset = Boolean(input.activateLogin || input.resetPassword);
    if (shouldActivateOrReset) {
      const targetEmail = normalizeEmail(input.activationEmail ?? student.user?.email ?? "");
      if (!targetEmail) {
        throw new Error("ACTIVATION_EMAIL_REQUIRED");
      }

      temporaryPassword = generateRandomPassword();
      const passwordHash = await hashPassword(temporaryPassword);

      if (student.userId) {
        await tx.user.update({
          where: { id: student.userId },
          data: {
            email: targetEmail,
            isActive: true,
            mustChangePassword: true,
            passwordHash,
          },
        });
      } else {
        const createdUser = await tx.user.create({
          data: {
            email: targetEmail,
            role: "STUDENT",
            isActive: true,
            mustChangePassword: true,
            passwordHash,
          },
        });

        await tx.student.update({
          where: { id: input.id },
          data: { userId: createdUser.id },
        });
      }
    } else if (input.activationEmail && student.userId) {
      await tx.user.update({
        where: { id: student.userId },
        data: { email: normalizeEmail(input.activationEmail) },
      });
    }

    const updatedStudent = await tx.student.findUnique({
      where: { id: input.id },
      include: studentUserSelect,
    });

    if (!updatedStudent) {
      throw new Error("STUDENT_NOT_FOUND");
    }

    return {
      student: updatedStudent,
      temporaryPassword,
    };
  });
}

export async function deleteStudentWithLogin(id: string) {
  const student = await prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!student) {
    throw new Error("STUDENT_NOT_FOUND");
  }

  await prisma.$transaction(async (tx) => {
    await tx.student.delete({ where: { id } });
    if (student.userId) {
      await tx.user.delete({ where: { id: student.userId } });
    }
  });
}
