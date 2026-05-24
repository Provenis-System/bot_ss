import { prisma } from "../../database/prisma.js";

export async function upsertTicketConfigPanelSetting(messageId: string): Promise<void> {
  await prisma.botSetting.upsert({
    where: { key: "ticket_config_panel_id" },
    update: { value: { messageId } },
    create: { key: "ticket_config_panel_id", value: { messageId } }
  });
}
