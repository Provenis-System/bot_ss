import { prisma } from "../../database/prisma.js";

export async function getScanCaseByMessageId(trackingMessageId: string) {
  return prisma.scanCase.findUnique({
    where: { trackingMessageId }
  });
}