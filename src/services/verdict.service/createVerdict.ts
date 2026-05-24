import { prisma } from "../../database/prisma.js";

type CreateVerdictInput = {
  scanCaseId?: string | null;
  staffDiscordId: string;
  targetDiscordId: string;
  bannedCity: string;
  verdictType: string;
  notes?: string | null;
  proofLink?: string | null;
  proofFileUrls?: string[];
};

export async function createVerdict(input: CreateVerdictInput) {
  return prisma.verdict.create({
    data: {
      scanCaseId: input.scanCaseId ?? null,
      staffDiscordId: input.staffDiscordId,
      targetDiscordId: input.targetDiscordId,
      bannedCity: input.bannedCity,
      verdictType: input.verdictType,
      notes: input.notes ?? null,
      proofLink: input.proofLink ?? null,
      proofFileUrls: input.proofFileUrls ?? []
    }
  });
}
