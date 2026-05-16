import { ScanStatus } from "@prisma/client";
import { MessageFlags, type Client, type StringSelectMenuInteraction, type TextChannel } from "discord.js";

import { env } from "../../config/env.js";
import { sendTrackingPanel } from "../../panels/trackingPanel.js";
import { generateEchoPin } from "../../services/echo.service/index.js";
import { assertSupportedGame, getGameOption } from "../../services/gameSelection.service/index.js";
import { assertStaffPermission } from "../../services/permission.service/index.js";
import {
  createScanCase,
  logScanAction,
  updateTrackingMessage
} from "../../services/scan.service/index.js";
import type { SupportedGameKey } from "../../types/game.js";
import { logger } from "../../utils/logger.js";

type HandleGameSelectMenuInput = {
  client: Client<true>;
  interaction: StringSelectMenuInteraction;
};

function resolveGameLink(game: SupportedGameKey, links?: Partial<Record<SupportedGameKey, string>> | null) {
  return links?.[game] ?? null;
}

export async function handleGameSelectMenu(input: HandleGameSelectMenuInput) {
  const { client, interaction } = input;

  await assertStaffPermission(interaction);

  const [, , requesterId] = interaction.customId.split(":");
  if (requesterId !== interaction.user.id) {
    await interaction.reply({
      content: "Somente quem abriu o seletor pode concluir esta ação.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await interaction.deferUpdate();

  try {
    const selectedGame = assertSupportedGame(interaction.values[0]);
    const gameOption = getGameOption(selectedGame);
    const echoPin = await generateEchoPin();
    const expiresAt = new Date(Date.now() + env.SCAN_TIMEOUT_MINUTES * 60 * 1000);
    const gameLink = resolveGameLink(selectedGame, echoPin.links);

    const scanCase = await createScanCase({
      staffDiscordId: interaction.user.id,
      selectedGame,
      echoPin: echoPin.pin,
      echoScanUrl: gameLink,
      trackingChannelId: env.TRACKING_CHANNEL_ID,
      expiresAt
    });

    await logScanAction({
      scanCaseId: scanCase.id,
      action: "PIN_GENERATED",
      message: "PIN da Echo gerado com sucesso.",
      metadata: { echoPin: echoPin.pin, selectedGame }
    });

    const trackingMessage = await sendTrackingPanel({
      client,
      caseId: scanCase.id,
      staffDiscordId: interaction.user.id,
      selectedGame,
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
        messageId: trackingMessage.id,
        selectedGame
      }
    });

    await interaction.editReply({
      content: [
        `PIN gerado com sucesso para ${gameOption?.label ?? selectedGame}.`,
        `PIN: ${echoPin.pin}`,
        gameLink ? `Link ${gameOption?.label ?? selectedGame}: ${gameLink}` : `Link ${gameOption?.label ?? selectedGame}: não informado pela Echo`,
        `Expira em: <t:${Math.floor(expiresAt.getTime() / 1000)}:f>`
      ].join("\n"),
      components: []
    });

    const logChannel = (await client.channels.fetch(env.LOG_CHANNEL_ID).catch(() => null)) as TextChannel | null;
    await logChannel?.send(
      `Nova telagem criada por <@${interaction.user.id}>. Caso ${scanCase.id}. Jogo ${gameOption?.label ?? selectedGame}. PIN ${echoPin.pin}.`
    );
  } catch (error) {
    logger.error({ err: error, userId: interaction.user.id }, "Falha ao gerar chave da Echo após seleção de jogo.");
    await interaction.editReply({
      content: `Falha ao gerar chave na Echo Scanner: ${error instanceof Error ? error.message : "erro desconhecido"}`,
      components: []
    });
  }
}