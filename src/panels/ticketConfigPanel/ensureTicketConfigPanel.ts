import { ChannelType, MessageFlags, type Client, type TextChannel } from "discord.js";

import { env } from "../../config/env.js";
import {
  getTicketConfig,
  getTicketConfigPanelSetting,
  upsertTicketConfigPanelSetting
} from "../../services/ticketConfig.service/index.js";
import { logger } from "../../utils/logger.js";
import { buildTicketConfigPanel } from "./buildTicketConfigPanel.js";

export async function ensureTicketConfigPanel(client: Client<true>) {
  const channel = await client.channels.fetch(env.TICKET_CONFIG_CHANNEL_ID);

  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("Canal do painel de configuração de tickets não encontrado ou inválido.");
  }

  const textChannel = channel as TextChannel;
  const config = await getTicketConfig();
  const existingSetting = await getTicketConfigPanelSetting();
  const messageId = (existingSetting?.value as { messageId?: string } | null)?.messageId;

  if (messageId) {
    const existingMessage = await textChannel.messages.fetch(messageId).catch(() => null);

    if (existingMessage) {
      await existingMessage.edit({
        components: [buildTicketConfigPanel(config)],
        flags: MessageFlags.IsComponentsV2
      });
      logger.info({ messageId }, "Painel de configuração de tickets atualizado.");
      return existingMessage;
    }
  }

  const message = await textChannel.send({
    components: [buildTicketConfigPanel(config)],
    flags: MessageFlags.IsComponentsV2
  });

  await upsertTicketConfigPanelSetting(message.id);
  logger.info({ messageId: message.id }, "Painel de configuração de tickets criado.");
  return message;
}
