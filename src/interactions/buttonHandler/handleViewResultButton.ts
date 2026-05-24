import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  type ButtonInteraction
} from "discord.js";

import { assertStaffPermission } from "../../services/permission.service/index.js";
import { buildFiveMResultView } from "../../services/scanResult.service/index.js";
import { getScanCaseByMessageId, logScanAction } from "../../services/scan.service/index.js";
import type { EchoScanDetailsResponse, ScanResultView } from "../../types/scan.js";

function divider() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

function buildResultContainer(view: ScanResultView, caseId: string): ContainerBuilder {
  const accentColor = view.hasGrave ? 0xe74c3c : view.hasSuspicious ? 0xf39c12 : 0x2ecc71;

  const container = new ContainerBuilder()
    .setAccentColor(accentColor)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🔍 Resultado da Varredura\n-# ${view.title}`
      )
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**📋 Informações do Scan**\n${view.info.join("\n")}`
      )
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        [
          "**🆔 Identificadores / Contas**",
          ...view.accounts,
          ...(view.accountOverflow > 0 ? [`... e mais ${view.accountOverflow} conta(s).`] : [])
        ].join("\n")
      )
    );

  for (const section of view.sections) {
    container
      .addSeparatorComponents(divider())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          [
            `**${section.label}**`,
            ...section.items,
            ...(section.overflow > 0 ? [`... e mais ${section.overflow} item(ns).`] : [])
          ].join("\n")
        )
      );
  }

  container
    .addSeparatorComponents(divider())
    .addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`scan:view-pca:${caseId}`)
          .setLabel("📂 PCA")
          .setStyle(ButtonStyle.Secondary)
      )
    );

  return container;
}

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

  if (!scanCase.resultRaw) {
    await interaction.reply({
      content: "Nenhum payload detalhado foi salvo para este scan.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const resultView = buildFiveMResultView(scanCase.resultRaw as unknown as EchoScanDetailsResponse);

  await interaction.reply({
    components: [buildResultContainer(resultView, scanCase.id)],
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
  });
}
