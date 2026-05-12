import { prisma } from "../../database/prisma.js";

export async function upsertPanelMessageSetting(messageId: string) {
  return prisma.botSetting.upsert({
    where: { key: "key_panel_message_id" },
    update: { value: { messageId } },
    create: { key: "key_panel_message_id", value: { messageId } }
  });
}