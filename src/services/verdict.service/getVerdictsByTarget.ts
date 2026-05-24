import { prisma } from "../../database/prisma.js";

export async function getVerdictsByTarget(targetDiscordId: string) {
  return prisma.verdict.findMany({
    where: { targetDiscordId },
    orderBy: { createdAt: "desc" },
    include: {
      scanCase: {
        select: {
          id: true,
          echoPin: true,
          selectedGame: true,
          trackingChannelId: true,
          trackingMessageId: true,
          createdAt: true
        }
      }
    }
  });
}
