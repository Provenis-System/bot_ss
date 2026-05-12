import { ScanStatus } from "@prisma/client";

import { prisma } from "../../database/prisma.js";

type UpdateScanStatusInput = {
  scanCaseId: string;
  status: ScanStatus;
  echoScanId?: string | null;
  echoScanUrl?: string | null;
  resultSummary?: string | null;
  resultRaw?: unknown;
  completedAt?: Date | null;
  expiresAt?: Date | null;
};

export async function updateScanStatus(input: UpdateScanStatusInput) {
  return prisma.scanCase.update({
    where: { id: input.scanCaseId },
    data: {
      status: input.status,
      echoScanId: input.echoScanId,
      echoScanUrl: input.echoScanUrl,
      resultSummary: input.resultSummary,
      resultRaw: input.resultRaw as never,
      completedAt: input.completedAt,
      expiresAt: input.expiresAt
    }
  });
}