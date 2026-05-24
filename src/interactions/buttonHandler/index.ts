import type { ButtonInteraction, Client } from "discord.js";

import { handleCloseTicketButton } from "./handleCloseTicketButton.js";
import { handleGenerateKeyButton } from "./handleGenerateKeyButton.js";
import { handleOpenTicketButton } from "./handleOpenTicketButton.js";
import { handlePcaButton } from "./handlePcaButton.js";
import { handleViewResultButton } from "./handleViewResultButton.js";

export async function handleButtonInteraction(client: Client<true>, interaction: ButtonInteraction) {
  if (interaction.customId === "scan:generate-key") {
    await handleGenerateKeyButton({ client, interaction });
    return;
  }

  if (interaction.customId.startsWith("scan:view-result:")) {
    const [, , caseId] = interaction.customId.split(":");
    await handleViewResultButton(interaction, caseId);
    return;
  }

  if (interaction.customId.startsWith("scan:view-pca:")) {
    const [, , caseId] = interaction.customId.split(":");
    await handlePcaButton(interaction, caseId);
    return;
  }

  if (interaction.customId.startsWith("ticket:open:")) {
    const [, , caseId] = interaction.customId.split(":");
    await handleOpenTicketButton(interaction, caseId);
    return;
  }

  if (interaction.customId === "ticket:close") {
    await handleCloseTicketButton(interaction);
  }
}