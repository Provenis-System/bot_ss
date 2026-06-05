import {
  FileUploadBuilder,
  LabelBuilder,
  ModalBuilder,
  RadioGroupBuilder,
  RadioGroupOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction
} from "discord.js";

export const VERDICT_TYPE_LABELS: Record<string, string> = {
  banned: "🔴 Banido",
  clean: "🟢 Limpo",
  format_pc: "🟡 Formatar PC em 24 horas"
};

export async function handleVerdictButton(
  interaction: ButtonInteraction,
  caseId: string
): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId(`verdict:submit:${caseId}`)
    .setTitle("⚖️ Emitir Veredito")
    .addLabelComponents(
      new LabelBuilder()
        .setLabel("Tipo de Veredito")
        .setDescription("Selecione o resultado da análise")
        .setRadioGroupComponent(
          new RadioGroupBuilder()
            .setCustomId("verdict_type")
            .setRequired(true)
            .addOptions(
              new RadioGroupOptionBuilder().setValue("banned").setLabel("🔴 Banido"),
              new RadioGroupOptionBuilder().setValue("clean").setLabel("🟢 Limpo"),
              new RadioGroupOptionBuilder().setValue("format_pc").setLabel("🟡 Formatar PC em 24 horas")
            )
        ),
      new LabelBuilder()
        .setLabel("Discord ID do Usuário")
        .setDescription("ID numérico do Discord do jogador (ex: 123456789012345678)")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("verdict_discord_id")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder("123456789012345678")
            .setMaxLength(25)
        ),
      new LabelBuilder()
        .setLabel("Cidade Banida")
        .setDescription("Nome da cidade/servidor onde o ban será aplicado")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("verdict_city")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder("Los Santos")
            .setMaxLength(100)
        ),
      new LabelBuilder()
        .setLabel("Observação")
        .setDescription("Detalhes adicionais sobre o veredito (opcional)")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("verdict_notes")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setPlaceholder("Descreva os motivos do ban...")
            .setMaxLength(1000)
        ),
      new LabelBuilder()
        .setLabel("Upload de Prova")
        .setDescription("Anexe uma imagem ou arquivo como prova (opcional)")
        .setFileUploadComponent(
          new FileUploadBuilder()
            .setCustomId("verdict_file")
            .setRequired(false)
        )
    );

  await interaction.showModal(modal);
}
