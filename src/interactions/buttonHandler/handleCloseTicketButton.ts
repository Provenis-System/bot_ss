import {
  ChannelType,
  MessageFlags,
  type ButtonInteraction,
  type TextChannel
} from "discord.js";

import { assertStaffPermission } from "../../services/permission.service/index.js";

export async function handleCloseTicketButton(interaction: ButtonInteraction): Promise<void> {
  await assertStaffPermission(interaction);

  const channel = interaction.channel;
  if (!channel || channel.type !== ChannelType.GuildText) {
    await interaction.reply({
      content: "Este comando só pode ser usado em um canal de texto.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await interaction.reply({
    content: "🔒 Fechando ticket...",
    flags: MessageFlags.Ephemeral
  });

  await (channel as TextChannel).delete(`Ticket fechado por ${interaction.user.tag}`).catch(() => null);
}
