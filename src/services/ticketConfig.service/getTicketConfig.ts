import { prisma } from "../../database/prisma.js";

export type TicketConfig = {
  categoryId: string | null;
  allowedRoleIds: string[];
};

export async function getTicketConfig(): Promise<TicketConfig> {
  const setting = await prisma.botSetting.findUnique({ where: { key: "ticket_config" } });
  const value = setting?.value as Partial<TicketConfig> | null;
  return {
    categoryId: value?.categoryId ?? null,
    allowedRoleIds: value?.allowedRoleIds ?? []
  };
}
