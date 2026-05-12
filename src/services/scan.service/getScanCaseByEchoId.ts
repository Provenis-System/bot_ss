import { prisma } from "../../database/prisma.js";

export async function getScanCaseByEchoId(echoScanId: string) {
  return prisma.scanCase.findUnique({
    where: { echoScanId }
  });
}