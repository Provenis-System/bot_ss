import { prisma } from "../../database/prisma.js";

export async function getPanelMessageSetting() {
  return prisma.botSetting.findUnique({
    where: { key: "key_panel_message_id" }
  });
}