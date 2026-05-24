import type { Client, ModalSubmitInteraction } from "discord.js";

import { handleVerdictEditModal } from "./handleVerdictEditModal.js";
import { handleVerdictModal } from "./handleVerdictModal.js";

export async function handleModalSubmitInteraction(
  client: Client<true>,
  interaction: ModalSubmitInteraction
) {
  if (interaction.customId.startsWith("verdict:edit:submit:")) {
    const verdictId = interaction.customId.slice("verdict:edit:submit:".length);
    await handleVerdictEditModal(client, interaction, verdictId);
    return;
  }

  if (interaction.customId.startsWith("verdict:submit:")) {
    const [, , caseId] = interaction.customId.split(":");
    await handleVerdictModal(client, interaction, caseId ?? "");
  }
}
