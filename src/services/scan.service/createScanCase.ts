import { ScanStatus } from "@prisma/client";

import { prisma } from "../../database/prisma.js";

type CreateScanCaseInput = {
  staffDiscordId: string;
  echoScanId?: string | null;
  echoPin?: string | null;
  echoScanUrl?: string | null;
  trackingChannelId: string;
  expiresAt?: Date | null;
};

export async function createScanCase(input: CreateScanCaseInput) {
  return prisma.scanCase.create({
    data: {
      staffDiscordId: input.staffDiscordId,
      echoScanId: input.echoScanId,
      echoPin: input.echoPin,
      echoScanUrl: input.echoScanUrl,
      status: ScanStatus.PENDING,
      trackingChannelId: input.trackingChannelId,
      expiresAt: input.expiresAt
    }
  });
}