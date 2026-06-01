import { prisma } from "../../database/prisma.js";

export type TicketConfig = {
  categoryId: string | null;
  allowedRoleIds: string[];
  verdictLogChannelId: string | null;
  welcomeChannelId: string | null;
  leaveChannelId: string | null;
};

export async function getTicketConfig(): Promise<TicketConfig> {
  const setting = await prisma.botSetting.findUnique({ where: { key: "ticket_config" } });
  const value = setting?.value as Partial<TicketConfig> | null;
  return {
    categoryId: value?.categoryId ?? null,
    allowedRoleIds: value?.allowedRoleIds ?? [],
    verdictLogChannelId: value?.verdictLogChannelId ?? null,
    welcomeChannelId: value?.welcomeChannelId ?? null,
    leaveChannelId: value?.leaveChannelId ?? null
  };
}
