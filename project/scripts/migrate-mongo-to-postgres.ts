import { Prisma, PrismaClient } from "@prisma/client";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function toNumber(value: unknown, defaultValue = 0): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : defaultValue;
}

function toDate(value: unknown, fallback = new Date()): Date {
  if (!value) {
    return fallback;
  }
  const parsed = new Date(value as string);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }
  return parsed;
}

async function upsertAdminIfConfigured() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.log("Admin seed skipped: ADMIN_EMAIL/ADMIN_PASSWORD not set.");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      isActive: true,
      mustChangePassword: false,
    },
    update: {
      passwordHash,
      role: "ADMIN",
      isActive: true,
      mustChangePassword: false,
    },
  });
}

async function main() {
  const mongoUri = requiredEnv("MONGODB_URI");
  const mongoDbName = process.env.MONGODB_DB_NAME || "trumpeeett";

  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();

  const mongoDb = mongoClient.db(mongoDbName);
  const studentsCol = mongoDb.collection("students");
  const packsCol = mongoDb.collection("coursePacks");
  const lessonsCol = mongoDb.collection("lessons");

  const students = await studentsCol.find({}).toArray();
  const packs = await packsCol.find({}).toArray();
  const lessons = await lessonsCol.find({}).toArray();

  console.log(`Mongo students: ${students.length}`);
  console.log(`Mongo packs: ${packs.length}`);
  console.log(`Mongo lessons: ${lessons.length}`);

  const studentIdMap = new Map<string, string>();
  const packIdMap = new Map<string, string>();

  for (const student of students) {
    const legacyMongoId = student._id.toString();
    const upserted = await prisma.student.upsert({
      where: { legacyMongoId },
      create: {
        legacyMongoId,
        name: String(student.name ?? "Eleve"),
        rate: new Prisma.Decimal(toNumber(student.rate)),
        declared: Boolean(student.declared),
        archived: Boolean(student.archived),
        phone: student.phone ? String(student.phone) : null,
        address: student.address ? String(student.address) : null,
        courseDay: student.courseDay ? String(student.courseDay) : null,
        courseHour: student.courseHour ? String(student.courseHour) : null,
        createdAt: toDate(student.createdAt),
      },
      update: {
        name: String(student.name ?? "Eleve"),
        rate: new Prisma.Decimal(toNumber(student.rate)),
        declared: Boolean(student.declared),
        archived: Boolean(student.archived),
        phone: student.phone ? String(student.phone) : null,
        address: student.address ? String(student.address) : null,
        courseDay: student.courseDay ? String(student.courseDay) : null,
        courseHour: student.courseHour ? String(student.courseHour) : null,
      },
    });
    studentIdMap.set(legacyMongoId, upserted.id);
  }

  for (const pack of packs) {
    const legacyMongoId = pack._id.toString();
    const legacyStudentId = pack.studentId?.toString();
    const studentId = legacyStudentId ? studentIdMap.get(legacyStudentId) : undefined;
    if (!studentId) {
      console.warn(`Skip pack ${legacyMongoId}: unknown student ${legacyStudentId}`);
      continue;
    }

    const upsertedPack = await prisma.coursePack.upsert({
      where: { legacyMongoId },
      create: {
        legacyMongoId,
        studentId,
        totalLessons: toNumber(pack.totalLessons, 0),
        remainingLessons: toNumber(pack.remainingLessons, 0),
        purchaseDate: toDate(pack.purchaseDate),
        expiryDate: pack.expiryDate ? toDate(pack.expiryDate) : null,
        price: new Prisma.Decimal(toNumber(pack.price, 0)),
        createdAt: toDate(pack.createdAt),
      },
      update: {
        studentId,
        totalLessons: toNumber(pack.totalLessons, 0),
        purchaseDate: toDate(pack.purchaseDate),
        expiryDate: pack.expiryDate ? toDate(pack.expiryDate) : null,
        price: new Prisma.Decimal(toNumber(pack.price, 0)),
      },
    });

    packIdMap.set(legacyMongoId, upsertedPack.id);
  }

  for (const lesson of lessons) {
    const legacyMongoId = lesson._id.toString();
    const legacyStudentId = lesson.studentId?.toString();
    const studentId = legacyStudentId ? studentIdMap.get(legacyStudentId) : undefined;
    if (!studentId) {
      console.warn(`Skip lesson ${legacyMongoId}: unknown student ${legacyStudentId}`);
      continue;
    }

    const legacyPackId = lesson.packId?.toString();
    const packId = legacyPackId ? packIdMap.get(legacyPackId) ?? null : null;

    await prisma.lesson.upsert({
      where: { legacyMongoId },
      create: {
        legacyMongoId,
        studentId,
        date: toDate(lesson.date),
        amount: new Prisma.Decimal(toNumber(lesson.amount, 0)),
        comment: lesson.comment ? String(lesson.comment) : null,
        isPaid: Boolean(lesson.isPaid),
        packId,
        createdAt: toDate(lesson.createdAt),
      },
      update: {
        studentId,
        date: toDate(lesson.date),
        amount: new Prisma.Decimal(toNumber(lesson.amount, 0)),
        comment: lesson.comment ? String(lesson.comment) : null,
        isPaid: Boolean(lesson.isPaid),
        packId,
      },
    });
  }

  const refreshedPacks = await prisma.coursePack.findMany({
    select: {
      id: true,
      totalLessons: true,
    },
  });

  for (const pack of refreshedPacks) {
    const usedLessonsCount = await prisma.lesson.count({
      where: {
        packId: pack.id,
      },
    });
    const remainingLessons = Math.max(pack.totalLessons - usedLessonsCount, 0);
    await prisma.coursePack.update({
      where: {
        id: pack.id,
      },
      data: {
        remainingLessons,
      },
    });
  }

  await upsertAdminIfConfigured();

  const [pgStudents, pgPacks, pgLessons] = await Promise.all([
    prisma.student.count(),
    prisma.coursePack.count(),
    prisma.lesson.count(),
  ]);

  console.log(`PostgreSQL students: ${pgStudents}`);
  console.log(`PostgreSQL packs: ${pgPacks}`);
  console.log(`PostgreSQL lessons: ${pgLessons}`);

  await mongoClient.close();
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
