import { prisma } from "../../database/prisma.js";
import type { TicketConfig } from "./getTicketConfig.js";

export async function saveTicketConfig(config: Partial<TicketConfig>): Promise<void> {
  const current = await prisma.botSetting.findUnique({ where: { key: "ticket_config" } });
  const existing = (current?.value as Partial<TicketConfig> | null) ?? {};
  const merged = { ...existing, ...config };

  await prisma.botSetting.upsert({
    where: { key: "ticket_config" },
    update: { value: merged },
    create: { key: "ticket_config", value: merged }
  });
}
