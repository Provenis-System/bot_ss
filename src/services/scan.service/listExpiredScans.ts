import { ScanStatus } from "@prisma/client";

import { prisma } from "../../database/prisma.js";

export async function listExpiredScans(now: Date) {
  return prisma.scanCase.findMany({
    where: {
      status: {
        in: [ScanStatus.PENDING, ScanStatus.RUNNING]
      },
      expiresAt: {
        lte: now
      }
    }
  });
}