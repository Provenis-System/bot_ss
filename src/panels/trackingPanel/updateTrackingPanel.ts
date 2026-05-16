import { ChannelType, type Client, type TextChannel } from "discord.js";

import { buildTrackingPanel } from "./buildTrackingPanel.js";

type UpdateTrackingPanelInput = {
  client: Client<true>;
  trackingChannelId: string;
  trackingMessageId: string;
  caseId: string;
  staffDiscordId: string;
  selectedGame?: string | null;
  status: string;
  echoScanId?: string | null;
  createdAt: Date;
  resultSummary?: string | null;
  viewResultEnabled: boolean;
};

export async function updateTrackingPanel(input: UpdateTrackingPanelInput) {
  const channel = await input.client.channels.fetch(input.trackingChannelId);

  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("Canal de acompanhamento não encontrado ou inválido.");
  }

  const message = await (channel as TextChannel).messages.fetch(input.trackingMessageId);
  await message.edit(
    buildTrackingPanel({
      caseId: input.caseId,
      staffDiscordId: input.staffDiscordId,
      selectedGame: input.selectedGame,
      status: input.status,
      echoScanId: input.echoScanId,
      createdAt: input.createdAt,
      resultSummary: input.resultSummary,
      viewResultEnabled: input.viewResultEnabled
    })
  );

  return message;
}