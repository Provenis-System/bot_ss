import {
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  type Client,
  type ModalSubmitInteraction
} from "discord.js";

import { assertStaffPermission } from "../../services/permission.service/index.js";
import { VERDICT_TYPE_LABELS } from "../buttonHandler/handleVerdictButton.js";
import {
  createVerdict,
  sendVerdictLog
} from "../../services/verdict.service/index.js";

function divider() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

function verdictAccentColor(type: string): number {
  if (type === "banned") return 0xe74c3c;
  if (type === "clean") return 0x2ecc71;
  return 0xf39c12; // format_pc
}

export async function handleVerdictModal(
  client: Client<true>,
  interaction: ModalSubmitInteraction,
  caseId: string
): Promise<void> {
  await assertStaffPermission(interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const verdictType = interaction.fields.getRadioGroup("verdict_type", true) ?? "banned";
  const targetDiscordId = interaction.fields.getTextInputValue("verdict_discord_id").trim();
  const bannedCity = interaction.fields.getTextInputValue("verdict_city").trim();
  const notes = interaction.fields.getTextInputValue("verdict_notes").trim() || null;

  const uploadedFilesCollection = interaction.fields.getUploadedFiles("verdict_file");
  const proofFileUrls: string[] = uploadedFilesCollection
    ? [...uploadedFilesCollection.values()].map((f) => f.url)
    : [];

  if (!/^\d{17,20}$/.test(targetDiscordId)) {
    await interaction.editReply({
      content: "❌ Discord ID inválido. Deve ser um número com 17–20 dígitos."
    });
    return;
  }

  const verdict = await createVerdict({
    scanCaseId: caseId || null,
    staffDiscordId: interaction.user.id,
    targetDiscordId,
    bannedCity,
    verdictType,
    notes,
    proofFileUrls
  });

  void sendVerdictLog(client, verdict);

  const typeLabel = VERDICT_TYPE_LABELS[verdictType] ?? verdictType;
  const proofLines: string[] = [];
  proofFileUrls.forEach((url, i) => proofLines.push(`📎 [Arquivo ${i + 1}](${url})`));

  const container = new ContainerBuilder()
    .setAccentColor(verdictAccentColor(verdictType))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ⚖️ Veredito Registrado\n-# ID \`${verdict.id.slice(0, 8)}\` · <t:${Math.floor(verdict.createdAt.getTime() / 1000)}:f>`
      )
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        [
          `**📌 Tipo:** ${typeLabel}`,
          `**👤 Usuário:** <@${targetDiscordId}> (\`${targetDiscordId}\`)`,
          `**🏙️ Cidade banida:** ${bannedCity}`,
          notes ? `**📝 Observação:** ${notes}` : null,
          proofLines.length > 0 ? `**📎 Provas:**\n${proofLines.join("\n")}` : "**📎 Provas:** Nenhuma anexada"
        ]
          .filter(Boolean)
          .join("\n")
      )
    );

  await interaction.editReply({
    components: [container],
    flags: MessageFlags.IsComponentsV2
  });
}
