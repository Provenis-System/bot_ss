import type { ButtonInteraction, Client } from "discord.js";

import { handleGenerateKeyButton } from "./handleGenerateKeyButton.js";
import { handleViewResultButton } from "./handleViewResultButton.js";

export async function handleButtonInteraction(client: Client<true>, interaction: ButtonInteraction) {
  if (interaction.customId === "scan:generate-key") {
    await handleGenerateKeyButton({ client, interaction });
    return;
  }

  if (interaction.customId.startsWith("scan:view-result:")) {
    const [, , caseId] = interaction.customId.split(":");
    await handleViewResultButton(interaction, caseId);
  }
}