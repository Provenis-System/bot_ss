import {
  ChannelType,
  MessageFlags,
  type ChannelSelectMenuInteraction,
  type Client,
  type RoleSelectMenuInteraction,
  type TextChannel
} from "discord.js";

import { env } from "../../config/env.js";
import { buildTicketConfigPanel } from "../../panels/ticketConfigPanel.js";
import { assertStaffPermission } from "../../services/permission.service/index.js";
import {
  getTicketConfig,
  getTicketConfigPanelSetting,
  saveTicketConfig
} from "../../services/ticketConfig.service/index.js";


async function refreshPanel(client: Client<true>): Promise<void> {
  const setting = await getTicketConfigPanelSetting();
  const messageId = (setting?.value as { messageId?: string } | null)?.messageId;
  if (!messageId) return;

  const channel = await client.channels.fetch(env.TICKET_CONFIG_CHANNEL_ID).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildText) return;

  const textChannel = channel as TextChannel;
  const message = await textChannel.messages.fetch(messageId).catch(() => null);
  if (!message) return;

  const config = await getTicketConfig();
  await message.edit({
    components: [buildTicketConfigPanel(config)],
    flags: MessageFlags.IsComponentsV2
  });
}

export async function handleTicketConfigCategorySelect(
  client: Client<true>,
  interaction: ChannelSelectMenuInteraction
): Promise<void> {
  await assertStaffPermission(interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const categoryId = interaction.values[0] ?? null;
  await saveTicketConfig({ categoryId });
  await refreshPanel(client);

  await interaction.editReply({
    content: categoryId ? `✅ Categoria de tickets definida: <#${categoryId}>` : "✅ Categoria removida."
  });
}

export async function handleTicketConfigRolesSelect(
  client: Client<true>,
  interaction: RoleSelectMenuInteraction
): Promise<void> {
  await assertStaffPermission(interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const allowedRoleIds = interaction.values;
  await saveTicketConfig({ allowedRoleIds });
  await refreshPanel(client);

  const roleList = allowedRoleIds.map((id) => `<@&${id}>`).join(", ");
  await interaction.editReply({
    content: `✅ Cargos com acesso atualizados: ${roleList}`
  });
}

export async function handleTicketConfigVerdictLogSelect(
  client: Client<true>,
  interaction: ChannelSelectMenuInteraction
): Promise<void> {
  await assertStaffPermission(interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const verdictLogChannelId = interaction.values[0] ?? null;
  await saveTicketConfig({ verdictLogChannelId });
  await refreshPanel(client);

  await interaction.editReply({
    content: verdictLogChannelId
      ? `✅ Canal de log de vereditos definido: <#${verdictLogChannelId}>`
      : "✅ Canal de log de vereditos removido."
  });
}

export async function handleTicketConfigWelcomeSelect(
  client: Client<true>,
  interaction: ChannelSelectMenuInteraction
): Promise<void> {
  await assertStaffPermission(interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const welcomeChannelId = interaction.values[0] ?? null;
  await saveTicketConfig({ welcomeChannelId });
  await refreshPanel(client);

  await interaction.editReply({
    content: welcomeChannelId
      ? `✅ Canal de boas-vindas definido: <#${welcomeChannelId}>`
      : "✅ Canal de boas-vindas removido."
  });
}

export async function handleTicketConfigLeaveSelect(
  client: Client<true>,
  interaction: ChannelSelectMenuInteraction
): Promise<void> {
  await assertStaffPermission(interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const leaveChannelId = interaction.values[0] ?? null;
  await saveTicketConfig({ leaveChannelId });
  await refreshPanel(client);

  await interaction.editReply({
    content: leaveChannelId
      ? `✅ Canal de saída definido: <#${leaveChannelId}>`
      : "✅ Canal de saída removido."
  });
}
