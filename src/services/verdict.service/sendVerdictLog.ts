import {
  ChannelType,
  MessageFlags,
  type Client,
  type TextChannel
} from "discord.js";

import type { Verdict } from "@prisma/client";
import { getTicketConfig } from "../ticketConfig.service/index.js";
import { buildVerdictLogContainer } from "./buildVerdictLogContainer.js";
import { updateVerdictLogMessage } from "./updateVerdictLogMessage.js";

export async function sendVerdictLog(client: Client<true>, verdict: Verdict): Promise<void> {
  const config = await getTicketConfig();
  if (!config.verdictLogChannelId) return;

  const channel = await client.channels.fetch(config.verdictLogChannelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildText) return;

  const container = await buildVerdictLogContainer(verdict);

  const sent = await (channel as TextChannel).send({
    components: [container],
    flags: MessageFlags.IsComponentsV2
  });

  await updateVerdictLogMessage(verdict.id, config.verdictLogChannelId, sent.id);
}
