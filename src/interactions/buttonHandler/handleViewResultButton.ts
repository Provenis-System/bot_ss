import { MessageFlags, type ButtonInteraction } from "discord.js";

import { assertStaffPermission } from "../../services/permission.service/index.js";
import { buildFiveMResultView } from "../../services/scanResult.service/index.js";
import { getScanCaseByMessageId, logScanAction } from "../../services/scan.service/index.js";
import type { EchoScanDetailsResponse } from "../../types/scan.js";

export async function handleViewResultButton(interaction: ButtonInteraction, caseId: string) {
  await assertStaffPermission(interaction);

  const scanCase = await getScanCaseByMessageId(interaction.message.id);

  if (!scanCase || scanCase.id !== caseId) {
    await interaction.reply({
      content: "Caso não encontrado para esta mensagem.",
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

  const resultView = scanCase.resultRaw
    ? buildFiveMResultView(scanCase.resultRaw as unknown as EchoScanDetailsResponse)
    : null;

  await interaction.reply({
    content: resultView
      ? resultView.lines.join("\n")
      : "Nenhum payload detalhado foi salvo para este scan.",
    flags: MessageFlags.Ephemeral
  });
}