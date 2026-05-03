import { prisma } from '@/lib/db';
import { Lead, Student } from '@prisma/client';

export type LeadStage = 'new' | 'contacted' | 'scheduled' | 'student' | 'lost';
export type LeadMailStatus = 'pending' | 'sent' | 'failed';

export type LeadRecord = Lead & { studentId: string | null };
export type StudentRecord = Student & { email: string | null };

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  experience: string;
  message: string;
};

export type TimelineSnapshot = {
  id: 'month' | 'quarter' | 'year';
  label: string;
  periodLabel: string;
  revenue: number;
  declaredRevenue: number;
  undeclaredRevenue: number;
  lessonCount: number;
  paidLessons: number;
  unpaidLessons: number;
  newStudents: number;
  newLeads: number;
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: 'Debutant total',
  intermediate: 'Intermediaire',
  advanced: 'Avance',
};

function normalizeEmailForMatch(value?: string | null) {
  return value?.trim().toLowerCase() || '';
}

async function findMatchingLead(input: LeadInput) {
  const normalizedEmail = normalizeEmailForMatch(input.email);
  const normalizedPhone = normalizePhoneForMatch(input.phone);

  if (!normalizedEmail && !normalizedPhone) {
    return null;
  }

  const leads = await prisma.lead.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return (
    leads.find((lead) => normalizeEmailForMatch(lead.email) === normalizedEmail) ||
    leads.find((lead) => normalizePhoneForMatch(lead.phone) === normalizedPhone) ||
    null
  );
}

function normalizePhoneForMatch(value?: string | null) {
  if (!value) {
    return '';
  }

  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.startsWith('33') && digits.length === 11) {
    return `0${digits.slice(2)}`;
  }

  if (digits.length === 9 && /^[67]/.test(digits)) {
    return `0${digits}`;
  }

  return digits;
}

/**
 * Creates a new lead in the database using Prisma.
 * This ensures the "bonne tupo" (correct schema) requested by the user.
 */
export async function createLead(input: LeadInput) {
  const matchingLead = await findMatchingLead(input);

  if (matchingLead) {
    return prisma.lead.update({
      where: { id: matchingLead.id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        experience: input.experience,
        message: input.message || '',
        stage: matchingLead.studentId ? 'student' : matchingLead.stage,
        mailStatus: 'pending',
        mailError: null,
      },
    });
  }

  return prisma.lead.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      experience: input.experience,
      message: input.message || '',
      stage: 'new',
      mailStatus: 'pending',
    },
  });
}

export async function updateLeadMailStatus(id: string, mailStatus: LeadMailStatus, mailError: string | null = null) {
  return await prisma.lead.update({
    where: { id },
    data: {
      mailStatus,
      mailError,
    },
  });
}

/**
 * Converts a lead to a student.
 * If the student already exists (linked by leadId), updates it.
 * Otherwise, creates a new student and links it.
 */
export async function convertLeadToStudent(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    throw new Error('Lead not found.');
  }

  const normalizedEmail = lead.email.trim().toLowerCase();
  const normalizedPhone = normalizePhoneForMatch(lead.phone);

  const existingStudent = lead.studentId
    ? await prisma.student.findUnique({
        where: { id: lead.studentId },
      })
    : null;

  if (existingStudent) {
    // Already converted
    return existingStudent;
  }

  const candidates = await prisma.student.findMany({
    where: { archived: false },
    include: {
      user: { select: { email: true } },
      lead: { select: { id: true, email: true } },
    },
  });

  const matchedStudent =
    candidates.find((student) => {
      const studentEmail = student.user?.email || student.lead?.email || '';
      return studentEmail.trim().toLowerCase() === normalizedEmail;
    }) ||
    candidates.find((student) => normalizePhoneForMatch(student.phone) === normalizedPhone);

  if (matchedStudent) {
    const linkedLead = await prisma.lead.findFirst({
      where: {
        studentId: matchedStudent.id,
      },
      select: {
        id: true,
        notes: true,
      },
    });

    if (linkedLead && linkedLead.id !== leadId) {
      const duplicateNote = [
        linkedLead.notes || '',
        `Doublon CRM fusionne depuis ${lead.name} (${lead.email} / ${lead.phone}) le ${new Date().toLocaleDateString('fr-FR')}.`,
        lead.message ? `Message recu: ${lead.message}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      await prisma.$transaction([
        prisma.lead.update({
          where: { id: linkedLead.id },
          data: {
            notes: duplicateNote,
          },
        }),
        prisma.lead.update({
          where: { id: leadId },
          data: {
            stage: 'student',
            convertedAt: new Date(),
            notes: [
              lead.notes || '',
              `Doublon rattache a l eleve existant ${matchedStudent.name}.`,
            ]
              .filter(Boolean)
              .join('\n\n'),
          },
        }),
      ]);
    } else {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          studentId: matchedStudent.id,
          stage: 'student',
          convertedAt: new Date(),
        },
      });
    }

    return matchedStudent;
  }

  // Create new student from lead info
  const student = await prisma.student.create({
    data: {
      name: lead.name,
      phone: lead.phone,
      notes: lead.message || '',
      address: '', // Default empty, can be updated in admin
      rate: 40.00,  // Default rate, can be updated in admin
      declared: false,
      archived: false,
    },
  });

  // Update lead stage
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      studentId: student.id,
      stage: 'student',
      convertedAt: new Date(),
    },
  });

  return student;
}

export async function listLeads() {
  return await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      student: {
        select: { id: true }
      }
    }
  });
}

export async function listStudents() {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
    where: { archived: false },
    include: {
      user: { select: { email: true } },
      lead: { select: { email: true } },
    }
  });

  return students.map(s => ({
    ...s,
    email: s.user?.email || s.lead?.email || null
  }));
}

export async function getCrmStats() {
  const [leadCount, studentCount, mailStats] = await Promise.all([
    prisma.lead.count(),
    prisma.student.count({ where: { archived: false } }),
    prisma.lead.groupBy({
      by: ['mailStatus'],
      _count: true,
    }),
  ]);

  const convertedCount = await prisma.lead.count({
    where: { stage: 'student' }
  });

  const latestLead = await prisma.lead.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  const latestStudent = await prisma.student.findFirst({
    orderBy: { createdAt: 'desc' },
    where: { archived: false },
  });

  const sentCount = mailStats.find(s => s.mailStatus === 'sent')?._count ?? 0;
  const failedCount = mailStats.find(s => s.mailStatus === 'failed')?._count ?? 0;

  return {
    leads: leadCount,
    students: studentCount,
    sent: sentCount,
    failed: failedCount,
    converted: convertedCount,
    latestLead,
    latestStudent,
  };
}

function sumLessonAmounts(
  lessons: Array<{ amount: { toNumber(): number } | number }>,
) {
  return lessons.reduce((sum, lesson) => {
    const value = typeof lesson.amount === 'number' ? lesson.amount : lesson.amount.toNumber();
    return sum + value;
  }, 0);
}

function getQuarterIndex(monthIndex: number) {
  return Math.floor(monthIndex / 3) + 1;
}

export async function getTimelineSnapshots(referenceDate = new Date()): Promise<TimelineSnapshot[]> {
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const quarterStart = new Date(referenceDate.getFullYear(), Math.floor(referenceDate.getMonth() / 3) * 3, 1);
  const yearStart = new Date(referenceDate.getFullYear(), 0, 1);

  const [lessons, students, leads] = await Promise.all([
    prisma.lesson.findMany({
      select: {
        amount: true,
        date: true,
        isPaid: true,
        student: {
          select: {
            declared: true,
          },
        },
      },
    }),
    prisma.student.findMany({
      select: {
        createdAt: true,
      },
    }),
    prisma.lead.findMany({
      select: {
        createdAt: true,
      },
    }),
  ]);

  const snapshots = [
    {
      id: 'month' as const,
      label: 'Ce mois',
      periodLabel: referenceDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
      start: monthStart,
    },
    {
      id: 'quarter' as const,
      label: 'Ce trimestre',
      periodLabel: `T${getQuarterIndex(referenceDate.getMonth())} ${referenceDate.getFullYear()}`,
      start: quarterStart,
    },
    {
      id: 'year' as const,
      label: 'Cette annee',
      periodLabel: String(referenceDate.getFullYear()),
      start: yearStart,
    },
  ];

  return snapshots.map((snapshot) => {
    const periodLessons = lessons.filter((lesson) => lesson.date >= snapshot.start);
    const declaredLessons = periodLessons.filter((lesson) => lesson.student.declared);
    const undeclaredLessons = periodLessons.filter((lesson) => !lesson.student.declared);

    return {
      id: snapshot.id,
      label: snapshot.label,
      periodLabel: snapshot.periodLabel,
      revenue: sumLessonAmounts(periodLessons),
      declaredRevenue: sumLessonAmounts(declaredLessons),
      undeclaredRevenue: sumLessonAmounts(undeclaredLessons),
      lessonCount: periodLessons.length,
      paidLessons: periodLessons.filter((lesson) => lesson.isPaid).length,
      unpaidLessons: periodLessons.filter((lesson) => !lesson.isPaid).length,
      newStudents: students.filter((student) => student.createdAt >= snapshot.start).length,
      newLeads: leads.filter((lead) => lead.createdAt >= snapshot.start).length,
    };
  });
}
