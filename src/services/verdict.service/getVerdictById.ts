import { prisma } from "../../database/prisma.js";

export async function getVerdictById(verdictId: string) {
  return prisma.verdict.findUnique({ where: { id: verdictId } });
}
