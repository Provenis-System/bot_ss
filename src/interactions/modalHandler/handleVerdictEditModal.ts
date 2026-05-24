import {
  ChannelType,
  MessageFlags,
  type Client,
  type ModalSubmitInteraction,
  type TextChannel
} from "discord.js";

import { assertStaffPermission } from "../../services/permission.service/index.js";
import { VERDICT_TYPE_LABELS } from "../buttonHandler/handleVerdictButton.js";
import {
  buildVerdictLogContainer,
  getVerdictById,
  updateVerdict
} from "../../services/verdict.service/index.js";

export async function handleVerdictEditModal(
  client: Client<true>,
  interaction: ModalSubmitInteraction,
  verdictId: string
): Promise<void> {
  await assertStaffPermission(interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const existing = await getVerdictById(verdictId);
  if (!existing) {
    await interaction.editReply({ content: "❌ Veredito não encontrado." });
    return;
  }

  const verdictType = interaction.fields.getRadioGroup("verdict_type", true) ?? existing.verdictType;
  const bannedCity = interaction.fields.getTextInputValue("edit_city").trim();
  const notes = interaction.fields.getTextInputValue("edit_notes").trim() || null;
  const proofLink = interaction.fields.getTextInputValue("edit_proof_link").trim() || null;

  const updated = await updateVerdict(verdictId, { verdictType, bannedCity, notes, proofLink });

  if (updated.logChannelId && updated.logMessageId) {
    const logChannel = await client.channels.fetch(updated.logChannelId).catch(() => null);
    if (logChannel?.type === ChannelType.GuildText) {
      const logMsg = await (logChannel as TextChannel).messages
        .fetch(updated.logMessageId)
        .catch(() => null);
      if (logMsg) {
        const container = await buildVerdictLogContainer(updated);
        await logMsg
          .edit({ components: [container], flags: MessageFlags.IsComponentsV2 })
          .catch(() => null);
      }
    }
  }

  const typeLabel = VERDICT_TYPE_LABELS[verdictType] ?? verdictType;
  await interaction.editReply({
    content: `✅ Veredito \`${verdictId.slice(0, 8)}\` atualizado — **${typeLabel}** em ${bannedCity}.`
  });
}
