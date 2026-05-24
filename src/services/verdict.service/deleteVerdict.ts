import { prisma } from "../../database/prisma.js";

export async function deleteVerdict(verdictId: string): Promise<void> {
  await prisma.verdict.delete({ where: { id: verdictId } });
}
