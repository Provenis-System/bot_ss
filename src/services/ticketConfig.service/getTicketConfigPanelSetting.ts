import { prisma } from "../../database/prisma.js";

export async function getTicketConfigPanelSetting() {
  return prisma.botSetting.findUnique({ where: { key: "ticket_config_panel_id" } });
}
