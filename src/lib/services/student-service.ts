import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
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
  declared?: boolean;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  courseDay?: string | null;
  courseHour?: string | null;
  email?: string;
  createLogin?: boolean;
}

function normalizePhoneForMatch(value?: string | null) {
  if (!value) {
    return "";
  }

  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  if (digits.startsWith("33") && digits.length === 11) {
    return `0${digits.slice(2)}`;
  }

  if (digits.length === 9 && /^[67]/.test(digits)) {
    return `0${digits}`;
  }

  return digits;
}

async function findMatchingLead(
  tx: Prisma.TransactionClient,
  email?: string,
  phone?: string | null,
) {
  const normalizedEmail = email ? normalizeEmail(email) : "";
  const normalizedPhone = normalizePhoneForMatch(phone);

  if (!normalizedEmail && !normalizedPhone) {
    return null;
  }

  const leads = await tx.lead.findMany({
    where: {
      studentId: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (normalizedEmail) {
    const emailMatch = leads.find((lead) => normalizeEmail(lead.email) === normalizedEmail);
    if (emailMatch) {
      return emailMatch;
    }
  }

  if (normalizedPhone) {
    const phoneMatch = leads.find((lead) => normalizePhoneForMatch(lead.phone) === normalizedPhone);
    if (phoneMatch) {
      return phoneMatch;
    }
  }

  return null;
}

export async function createStudent(input: CreateStudentInput) {
  return prisma.$transaction(async (tx) => {
    const normalizedEmail = input.email ? normalizeEmail(input.email) : "";
    const matchedLead = await findMatchingLead(tx, normalizedEmail, input.phone);
    let userId: string | null = null;
    let temporaryPassword: string | null = null;

    if (input.createLogin && normalizedEmail) {
      temporaryPassword = generateRandomPassword();
      const passwordHash = await hashPassword(temporaryPassword);

      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
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
        declared: input.declared ?? false,
        archived: false,
        phone: input.phone ?? matchedLead?.phone ?? undefined,
        address: input.address ?? undefined,
        notes: input.notes?.trim() || matchedLead?.message || "",
        courseDay: input.courseDay ?? undefined,
        courseHour: input.courseHour ?? undefined,
        userId: userId ?? undefined,
      },
      include: studentUserSelect,
    });

    if (matchedLead) {
      await tx.lead.update({
        where: { id: matchedLead.id },
        data: {
          studentId: student.id,
          stage: "student",
          convertedAt: new Date(),
        },
      });
    }

    return {
      student,
      temporaryPassword,
      linkedLead: matchedLead
        ? {
            id: matchedLead.id,
            name: matchedLead.name,
          }
        : null,
    };
  });
}

export async function updateStudent(id: string, data: Partial<CreateStudentInput> & { declared?: boolean, archived?: boolean }) {
  const updateData: Prisma.StudentUpdateInput = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.rate !== undefined) updateData.rate = new Prisma.Decimal(data.rate);
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.courseDay !== undefined) updateData.courseDay = data.courseDay;
  if (data.courseHour !== undefined) updateData.courseHour = data.courseHour;
  if (data.declared !== undefined) updateData.declared = data.declared;
  if (data.archived !== undefined) updateData.archived = data.archived;

  return prisma.student.update({
    where: { id },
    data: updateData,
    include: studentUserSelect,
  });
}

export async function deleteStudent(id: string) {
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
    await tx.lead.updateMany({
      where: { studentId: id },
      data: {
        studentId: null,
        convertedAt: null,
        stage: "contacted",
      },
    });

    await tx.urssafClient.updateMany({
      where: { studentId: id },
      data: { studentId: null },
    });

    await tx.student.delete({
      where: { id },
    });

    if (student.userId) {
      await tx.user.delete({
        where: { id: student.userId },
      });
    }
  });
}
