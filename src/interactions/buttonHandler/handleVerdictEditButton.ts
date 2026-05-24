import {
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  RadioGroupBuilder,
  RadioGroupOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction
} from "discord.js";

import { assertStaffPermission } from "../../services/permission.service/index.js";
import { getVerdictById } from "../../services/verdict.service/index.js";
import { VERDICT_TYPE_LABELS } from "./handleVerdictButton.js";

export async function handleVerdictEditButton(
  interaction: ButtonInteraction,
  verdictId: string
): Promise<void> {
  await assertStaffPermission(interaction);

  const verdict = await getVerdictById(verdictId);
  if (!verdict) {
    await interaction.reply({ content: "❌ Veredito não encontrado.", flags: MessageFlags.Ephemeral });
    return;
  }

  const currentTypeLabel = VERDICT_TYPE_LABELS[verdict.verdictType] ?? verdict.verdictType;

  const modal = new ModalBuilder()
    .setCustomId(`verdict:edit:submit:${verdictId}`)
    .setTitle("✏️ Editar Veredito")
    .addLabelComponents(
      new LabelBuilder()
        .setLabel("Tipo de Veredito")
        .setDescription(`Tipo atual: ${currentTypeLabel} — selecione o novo tipo`)
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
        .setLabel("Cidade Banida")
        .setDescription("Nome da cidade/servidor onde o ban foi aplicado")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("edit_city")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(verdict.bannedCity)
            .setMaxLength(100)
        ),
      new LabelBuilder()
        .setLabel("Observação")
        .setDescription("Detalhes adicionais (opcional)")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("edit_notes")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setValue(verdict.notes ?? "")
            .setMaxLength(1000)
        ),
      new LabelBuilder()
        .setLabel("Link de Prova")
        .setDescription("Link externo como prova (opcional — deixe vazio para remover)")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("edit_proof_link")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setValue(verdict.proofLink ?? "")
            .setMaxLength(500)
        )
    );

  await interaction.showModal(modal);
}
