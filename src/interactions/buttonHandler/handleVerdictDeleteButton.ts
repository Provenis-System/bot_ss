import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  type ButtonInteraction,
  type Client
} from "discord.js";

import { assertStaffPermission } from "../../services/permission.service/index.js";

export async function handleVerdictDeleteButton(
  _client: Client<true>,
  interaction: ButtonInteraction,
  verdictId: string
): Promise<void> {
  await assertStaffPermission(interaction);

  await interaction.reply({
    content: `⚠️ Tem certeza que deseja deletar o veredito \`${verdictId.slice(0, 8)}\`? Esta ação não pode ser desfeita.`,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`verdict:delete:confirm:${verdictId}`)
          .setLabel("Confirmar")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("verdict:delete:cancel")
          .setLabel("Cancelar")
          .setStyle(ButtonStyle.Secondary)
      )
    ],
    flags: MessageFlags.Ephemeral
  });
}
