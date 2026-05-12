import { ChannelType, MessageFlags, type Client, type TextChannel } from "discord.js";

import { env } from "../../config/env.js";
import { getPanelMessageSetting, upsertPanelMessageSetting } from "../../services/scan.service/index.js";
import { logger } from "../../utils/logger.js";
import { buildKeyPanel } from "./buildKeyPanel.js";

export async function ensureKeyPanel(client: Client<true>) {
  const channel = await client.channels.fetch(env.KEY_PANEL_CHANNEL_ID);

  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("Canal do painel de chave não encontrado ou inválido.");
  }

  const textChannel = channel as TextChannel;
  const existingSetting = await getPanelMessageSetting();
  const messageId = (existingSetting?.value as { messageId?: string } | null)?.messageId;

  if (messageId) {
    const existingMessage = await textChannel.messages.fetch(messageId).catch(() => null);

    if (existingMessage) {
      await existingMessage.edit({
        components: [buildKeyPanel()],
        flags: MessageFlags.IsComponentsV2
      });

      logger.info({ messageId }, "Painel principal atualizado.");
      return existingMessage;
    }
  }

  const message = await textChannel.send({
    components: [buildKeyPanel()],
    flags: MessageFlags.IsComponentsV2
  });

  await upsertPanelMessageSetting(message.id);
  logger.info({ messageId: message.id }, "Painel principal criado.");
  return message;
}