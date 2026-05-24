import {
  ActionRowBuilder,
  ButtonBuilder,
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder
} from "discord.js";

import type { ScanResultView } from "../../types/scan.js";

function divider() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

export function buildResultContainer(
  view: ScanResultView,
  caseId: string,
  actionButtons: ButtonBuilder[]
): ContainerBuilder {
  const accentColor = view.hasGrave ? 0xe74c3c : view.hasSuspicious ? 0xf39c12 : 0x2ecc71;

  const container = new ContainerBuilder()
    .setAccentColor(accentColor)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## 🔍 Resultado da Varredura\n-# ${view.title}`)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**📋 Informações do Scan**\n${view.info.join("\n")}`)
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

  if (actionButtons.length > 0) {
    container
      .addSeparatorComponents(divider())
      .addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(...actionButtons)
      );
  }

  return container;
}
