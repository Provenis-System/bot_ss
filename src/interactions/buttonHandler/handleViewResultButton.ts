import {
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  type ButtonInteraction
} from "discord.js";

import { checkStaffPermission } from "../../services/permission.service/index.js";
import {
  buildFiveMResultView,
  buildResultContainer
} from "../../services/scanResult.service/index.js";
import { getScanCaseByMessageId, logScanAction } from "../../services/scan.service/index.js";
import type { EchoScanDetailsResponse } from "../../types/scan.js";

export async function handleViewResultButton(interaction: ButtonInteraction, caseId: string) {
  const scanCase = await getScanCaseByMessageId(interaction.message.id);

  if (!scanCase || scanCase.id !== caseId) {
    await interaction.reply({
      content: "Caso não encontrado para esta mensagem.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const isStaff = await checkStaffPermission(interaction);
  const isCreator = interaction.user.id === scanCase.staffDiscordId;

  if (!isStaff && !isCreator) {
    await interaction.reply({
      content: "❌ Você não tem permissão para ver este resultado.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  if (scanCase.status !== "COMPLETED") {
    await interaction.reply({
      content: "O resultado ainda não está disponível para visualização.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await logScanAction({
    scanCaseId: scanCase.id,
    action: "RESULT_VIEWED",
    message: "Resultado consultado via botão privado.",
    metadata: { viewerDiscordId: interaction.user.id }
  });

  if (!scanCase.resultRaw) {
    await interaction.reply({
      content: "Nenhum payload detalhado foi salvo para este scan.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const resultView = buildFiveMResultView(scanCase.resultRaw as unknown as EchoScanDetailsResponse);

  const buttons = [
    new ButtonBuilder()
      .setCustomId(`scan:view-pca:${scanCase.id}`)
      .setLabel("📂 PCA")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`verdict:open:${scanCase.id}`)
      .setLabel("⚖️ Veredito")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`ticket:open:${scanCase.id}`)
      .setLabel("❓ Dúvida com resultado?")
      .setStyle(ButtonStyle.Secondary)
  ];

  await interaction.reply({
    components: [buildResultContainer(resultView, scanCase.id, buttons)],
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
  });
}
