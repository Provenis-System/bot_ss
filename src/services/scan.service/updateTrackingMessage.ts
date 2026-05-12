import { prisma } from "../../database/prisma.js";

export async function updateTrackingMessage(scanCaseId: string, trackingMessageId: string) {
  return prisma.scanCase.update({
    where: { id: scanCaseId },
    data: { trackingMessageId }
  });
}