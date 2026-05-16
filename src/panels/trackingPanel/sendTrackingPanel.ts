import { ChannelType, type Client, type Message, type TextChannel } from "discord.js";

import { env } from "../../config/env.js";
import { buildTrackingPanel } from "./buildTrackingPanel.js";

type SendTrackingPanelInput = {
  client: Client<true>;
  caseId: string;
  staffDiscordId: string;
  selectedGame?: string | null;
  status: string;
  echoScanId?: string | null;
  createdAt: Date;
};

export async function sendTrackingPanel(input: SendTrackingPanelInput): Promise<Message> {
  const channel = await input.client.channels.fetch(env.TRACKING_CHANNEL_ID);

  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("Canal de acompanhamento não encontrado ou inválido.");
  }

  return (channel as TextChannel).send(
    buildTrackingPanel({
      caseId: input.caseId,
      staffDiscordId: input.staffDiscordId,
      selectedGame: input.selectedGame,
      status: input.status,
      echoScanId: input.echoScanId,
      createdAt: input.createdAt,
      viewResultEnabled: false
    })
  );
}