import { prisma } from "../../database/prisma.js";

export async function updateVerdict(
  verdictId: string,
  data: { verdictType: string; bannedCity: string; notes: string | null; proofLink: string | null }
) {
  return prisma.verdict.update({
    where: { id: verdictId },
    data: {
      verdictType: data.verdictType,
      bannedCity: data.bannedCity,
      notes: data.notes,
      proofLink: data.proofLink
    }
  });
}
