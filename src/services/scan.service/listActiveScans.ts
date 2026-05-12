import { ScanStatus } from "@prisma/client";

import { prisma } from "../../database/prisma.js";

export async function listActiveScans() {
  return prisma.scanCase.findMany({
    where: {
      status: {
        in: [ScanStatus.PENDING, ScanStatus.RUNNING]
      }
    }
  });
}