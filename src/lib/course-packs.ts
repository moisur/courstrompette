import { Prisma } from "@prisma/client";

export async function recomputePackRemaining(
  tx: Prisma.TransactionClient,
  packId: string,
): Promise<number | null> {
  const pack = await tx.coursePack.findUnique({
    where: { id: packId },
    select: {
      id: true,
      totalLessons: true,
    },
  });

  if (!pack) {
    return null;
  }

  const usedLessons = await tx.lesson.count({
    where: {
      packId,
    },
  });

  const remainingLessons = Math.max(pack.totalLessons - usedLessons, 0);
  await tx.coursePack.update({
    where: { id: packId },
    data: { remainingLessons },
  });

  return remainingLessons;
}
