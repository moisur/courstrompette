import { CoursePack, Lesson, Prisma, Student, User } from "@prisma/client";

type StudentWithUser = Student & {
  user?: Pick<User, "email" | "isActive" | "mustChangePassword"> | null;
};

type LessonWithStudent = Lesson & {
  student?: StudentWithUser | null;
};

function decimalToNumber(value: Prisma.Decimal): number {
  return Number(value.toString());
}

export function serializeStudent(student: StudentWithUser) {
  return {
    _id: student.id,
    name: student.name,
    rate: decimalToNumber(student.rate),
    declared: student.declared,
    archived: student.archived,
    createdAt: student.createdAt.toISOString(),
    phone: student.phone ?? undefined,
    address: student.address ?? undefined,
    courseDay: student.courseDay ?? undefined,
    courseHour: student.courseHour ?? undefined,
    email: student.user?.email ?? undefined,
    isActive: student.user?.isActive ?? false,
    mustChangePassword: student.user?.mustChangePassword ?? false,
    hasLogin: Boolean(student.user),
  };
}

export function serializeCoursePack(pack: CoursePack) {
  return {
    _id: pack.id,
    studentId: pack.studentId,
    totalLessons: pack.totalLessons,
    remainingLessons: pack.remainingLessons,
    purchaseDate: pack.purchaseDate.toISOString(),
    expiryDate: pack.expiryDate?.toISOString(),
    price: decimalToNumber(pack.price),
    createdAt: pack.createdAt.toISOString(),
  };
}

export function serializeLesson(lesson: LessonWithStudent) {
  const payload = {
    _id: lesson.id,
    studentId: lesson.studentId,
    date: lesson.date.toISOString(),
    amount: decimalToNumber(lesson.amount),
    comment: lesson.comment ?? undefined,
    isPaid: lesson.isPaid,
    packId: lesson.packId ?? undefined,
    createdAt: lesson.createdAt.toISOString(),
  };

  if (lesson.student) {
    return {
      ...payload,
      student: serializeStudent(lesson.student),
    };
  }

  return payload;
}
