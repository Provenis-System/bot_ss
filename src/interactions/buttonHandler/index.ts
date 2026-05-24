import type { ButtonInteraction, Client } from "discord.js";

import { handleCloseTicketButton } from "./handleCloseTicketButton.js";
import { handleGenerateKeyButton } from "./handleGenerateKeyButton.js";
import { handleOpenTicketButton } from "./handleOpenTicketButton.js";
import { handlePcaButton } from "./handlePcaButton.js";
import { handleVerdictButton } from "./handleVerdictButton.js";
import { handleVerdictDeleteButton } from "./handleVerdictDeleteButton.js";
import { handleVerdictDeleteConfirmButton } from "./handleVerdictDeleteConfirmButton.js";
import { handleVerdictEditButton } from "./handleVerdictEditButton.js";
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
    return;
  }

  if (interaction.customId.startsWith("verdict:open:")) {
    const [, , caseId] = interaction.customId.split(":");
    await handleVerdictButton(interaction, caseId);
    return;
  }

  if (interaction.customId.startsWith("verdict:delete:confirm:")) {
    const verdictId = interaction.customId.slice("verdict:delete:confirm:".length);
    await handleVerdictDeleteConfirmButton(client, interaction, verdictId);
    return;
  }

  if (interaction.customId === "verdict:delete:cancel") {
    await interaction.update({ content: "❌ Ação cancelada.", components: [] });
    return;
  }

  if (interaction.customId.startsWith("verdict:delete:")) {
    const verdictId = interaction.customId.slice("verdict:delete:".length);
    await handleVerdictDeleteButton(client, interaction, verdictId);
    return;
  }

  if (interaction.customId.startsWith("verdict:edit:")) {
    const verdictId = interaction.customId.slice("verdict:edit:".length);
    await handleVerdictEditButton(interaction, verdictId);
  }
}
