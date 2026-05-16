import type { Client, StringSelectMenuInteraction } from "discord.js";

import { handleGameSelectMenu } from "./handleGameSelectMenu.js";

export async function handleSelectMenuInteraction(client: Client<true>, interaction: StringSelectMenuInteraction) {
  if (interaction.customId.startsWith("scan:select-game:")) {
    await handleGameSelectMenu({ client, interaction });
  }
}