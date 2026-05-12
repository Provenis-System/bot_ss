import { ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, TextDisplayBuilder } from "discord.js";

type TrackingPanelInput = {
  caseId: string;
  staffDiscordId: string;
  status: string;
  echoScanId?: string | null;
  createdAt: Date;
  resultSummary?: string | null;
  viewResultEnabled: boolean;
};

export function buildTrackingPanel(input: TrackingPanelInput) {
  const viewButton = new ButtonBuilder()
    .setCustomId(`scan:view-result:${input.caseId}`)
    .setLabel("Ver resultado")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(!input.viewResultEnabled);

  return {
    flags: [MessageFlags.IsComponentsV2] as const,
    components: [
      new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# Acompanhamento de Telagem\nStatus atual: **${input.status}**`)
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            [
              `Caso: ${input.caseId}`,
              `Staff: <@${input.staffDiscordId}>`,
              `Scan ID: ${input.echoScanId ?? "aguardando vinculação"}`,
              `Criado em: <t:${Math.floor(input.createdAt.getTime() / 1000)}:f>`,
              input.resultSummary ? `Resumo: ${input.resultSummary}` : "Resumo: aguardando processamento"
            ].join("\n")
          )
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("O resultado detalhado sempre será privado.")
            )
            .setButtonAccessory(viewButton)
        )
    ]
  };
}