import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder
} from "discord.js";

type TrackingPanelInput = {
  caseId: string;
  staffDiscordId: string;
  selectedGame?: string | null;
  status: string;
  echoScanId?: string | null;
  createdAt: Date;
  resultSummary?: string | null;
  viewResultEnabled: boolean;
};

const STATUS_CONFIG: Record<string, { emoji: string; color: number }> = {
  PENDING:   { emoji: "⏳", color: 0xf39c12 },
  RUNNING:   { emoji: "🔄", color: 0x3498db },
  COMPLETED: { emoji: "✅", color: 0x2ecc71 },
  FAILED:    { emoji: "❌", color: 0xe74c3c },
  EXPIRED:   { emoji: "⌛", color: 0x7f8c8d },
  CANCELLED: { emoji: "🚫", color: 0x7f8c8d },
};

function divider() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

export function buildTrackingPanel(input: TrackingPanelInput) {
  const cfg = STATUS_CONFIG[input.status] ?? { emoji: "❓", color: 0x5865f2 };

  const viewButton = new ButtonBuilder()
    .setCustomId(`scan:view-result:${input.caseId}`)
    .setLabel("🔍 Ver Resultado")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(!input.viewResultEnabled);

  const createdTs = Math.floor(input.createdAt.getTime() / 1000);
  const scanId = input.echoScanId ? `\`${input.echoScanId}\`` : "aguardando vinculação";

  const infoBlock = [
    `👮 **Staff:** <@${input.staffDiscordId}>`,
    `🎮 **Jogo:** ${input.selectedGame ?? "não informado"}`,
    `🆔 **Scan ID:** ${scanId}`,
    `📅 **Criado em:** <t:${createdTs}:f>`,
  ].join("\n");

  const summaryBlock = input.resultSummary
    ? `**📝 Resumo**\n${input.resultSummary}`
    : "**📝 Resumo**\nAguardando processamento da Echo...";

  return {
    flags: [MessageFlags.IsComponentsV2] as const,
    components: [
      new ContainerBuilder()
        .setAccentColor(cfg.color)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## 📡 Acompanhamento de Telagem\n-# ${cfg.emoji} ${input.status} · Caso: \`${input.caseId}\``
          )
        )
        .addSeparatorComponents(divider())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(infoBlock)
        )
        .addSeparatorComponents(divider())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(summaryBlock)
        )
        .addSeparatorComponents(divider())
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                "-# O resultado detalhado sempre será privado."
              )
            )
            .setButtonAccessory(viewButton)
        )
    ]
  };
}
