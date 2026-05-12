import { ScanStatus } from "@prisma/client";
import { MessageFlags, type ButtonInteraction, type Client, type TextChannel } from "discord.js";

import { env } from "../../config/env.js";
import { sendTrackingPanel } from "../../panels/trackingPanel.js";
import { generateEchoPin } from "../../services/echo.service/index.js";
import { assertStaffPermission } from "../../services/permission.service/index.js";
import {
  createScanCase,
  logScanAction,
  updateTrackingMessage
} from "../../services/scan.service/index.js";
import { logger } from "../../utils/logger.js";

type HandleGenerateKeyButtonInput = {
  client: Client<true>;
  interaction: ButtonInteraction;
};

export async function handleGenerateKeyButton(input: HandleGenerateKeyButtonInput) {
  const { client, interaction } = input;

  assertStaffPermission(interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const echoPin = await generateEchoPin();
    const expiresAt = new Date(Date.now() + env.SCAN_TIMEOUT_MINUTES * 60 * 1000);
    const scanCase = await createScanCase({
      staffDiscordId: interaction.user.id,
      echoPin: echoPin.pin,
      echoScanUrl: echoPin.links?.fivem ?? null,
      trackingChannelId: env.TRACKING_CHANNEL_ID,
      expiresAt
    });

    await logScanAction({
      scanCaseId: scanCase.id,
      action: "PIN_GENERATED",
      message: "PIN da Echo gerado com sucesso.",
      metadata: { echoPin: echoPin.pin }
    });

    const trackingMessage = await sendTrackingPanel({
      client,
      caseId: scanCase.id,
      staffDiscordId: interaction.user.id,
      status: ScanStatus.PENDING,
      echoScanId: null,
      createdAt: scanCase.createdAt
    });

    await updateTrackingMessage(scanCase.id, trackingMessage.id);
    await logScanAction({
      scanCaseId: scanCase.id,
      action: "TRACKING_MESSAGE_CREATED",
      message: "Mensagem de acompanhamento criada.",
      metadata: {
        channelId: env.TRACKING_CHANNEL_ID,
        messageId: trackingMessage.id
      }
    });

    await interaction.editReply({
      content: [
        "PIN gerado com sucesso.",
        `PIN: ${echoPin.pin}`,
        echoPin.links?.fivem ? `Link FiveM: ${echoPin.links.fivem}` : "Link FiveM: não informado pela Echo",
        `Expira em: <t:${Math.floor(expiresAt.getTime() / 1000)}:f>`
      ].join("\n")
    });

    const logChannel = (await client.channels.fetch(env.LOG_CHANNEL_ID).catch(() => null)) as TextChannel | null;
    await logChannel?.send(`Nova telagem criada por <@${interaction.user.id}>. Caso ${scanCase.id}. PIN ${echoPin.pin}.`);
  } catch (error) {
    logger.error({ err: error, userId: interaction.user.id }, "Falha ao gerar chave na Echo.");
    await interaction.editReply({
      content: `Falha ao gerar chave na Echo Scanner: ${error instanceof Error ? error.message : "erro desconhecido"}`
    });
  }
}