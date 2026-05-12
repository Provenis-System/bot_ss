import { prisma } from "../../database/prisma.js";

type LogScanActionInput = {
  scanCaseId: string;
  action: string;
  message: string;
  metadata?: unknown;
};

export async function logScanAction(input: LogScanActionInput) {
  return prisma.scanLog.create({
    data: {
      scanCaseId: input.scanCaseId,
      action: input.action,
      message: input.message,
      metadata: input.metadata as never
    }
  });
}