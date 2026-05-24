import { prisma } from "../../database/prisma.js";

export async function updateVerdictLogMessage(
  verdictId: string,
  logChannelId: string,
  logMessageId: string
): Promise<void> {
  await prisma.verdict.update({
    where: { id: verdictId },
    data: { logChannelId, logMessageId }
  });
}
