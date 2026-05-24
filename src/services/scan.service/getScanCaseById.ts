import { prisma } from "../../database/prisma.js";

export async function getScanCaseById(id: string) {
  return prisma.scanCase.findUnique({ where: { id } });
}
