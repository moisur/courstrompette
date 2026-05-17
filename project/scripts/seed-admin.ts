import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

async function main() {
  const adminEmail = requiredEnv("ADMIN_EMAIL").trim().toLowerCase();
  const adminPassword = requiredEnv("ADMIN_PASSWORD");
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
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

  console.log(`Admin ready: ${admin.email} (${admin.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
