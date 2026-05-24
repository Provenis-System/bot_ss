import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder
} from "discord.js";
import type { Verdict } from "@prisma/client";

import { env } from "../../config/env.js";
import { VERDICT_TYPE_LABELS } from "../../interactions/buttonHandler/handleVerdictButton.js";
import { getScanCaseById } from "../scan.service/index.js";

function divider() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

export async function buildVerdictLogContainer(verdict: Verdict): Promise<ContainerBuilder> {
  const ts = Math.floor(verdict.createdAt.getTime() / 1000);
  const typeLabel = VERDICT_TYPE_LABELS[verdict.verdictType] ?? verdict.verdictType;

  const accentColor =
    verdict.verdictType === "banned" ? 0xe74c3c :
    verdict.verdictType === "clean"  ? 0x2ecc71 :
    0xf39c12;

  const proofLines: string[] = [];
  if (verdict.proofLink) proofLines.push(`🔗 [Link de prova](${verdict.proofLink})`);
  verdict.proofFileUrls.forEach((url, i) => proofLines.push(`📎 [Arquivo ${i + 1}](${url})`));

  let scanLink: string | null = null;
  if (verdict.scanCaseId) {
    const scanCase = await getScanCaseById(verdict.scanCaseId);
    if (scanCase?.trackingMessageId && scanCase.trackingChannelId) {
      scanLink = `https://discord.com/channels/${env.DISCORD_GUILD_ID}/${scanCase.trackingChannelId}/${scanCase.trackingMessageId}`;
    }
  }

  const container = new ContainerBuilder()
    .setAccentColor(accentColor)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ⚖️ Veredito Registrado\n-# ID \`${verdict.id.slice(0, 8)}\` · <t:${ts}:f>`
      )
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        [
          `**📌 Tipo:** ${typeLabel}`,
          `**👤 Usuário:** <@${verdict.targetDiscordId}> (\`${verdict.targetDiscordId}\`)`,
          `**🏙️ Cidade banida:** ${verdict.bannedCity}`,
          verdict.notes ? `**📝 Observação:** ${verdict.notes}` : null,
          scanLink
            ? `**🔍 Caso vinculado:** [${verdict.scanCaseId!.slice(0, 8)}](${scanLink})`
            : verdict.scanCaseId
              ? `**🔍 Caso vinculado:** \`${verdict.scanCaseId.slice(0, 8)}\``
              : null
        ]
          .filter(Boolean)
          .join("\n")
      )
    );

  if (proofLines.length > 0) {
    container
      .addSeparatorComponents(divider())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**🖼️ Provas**\n${proofLines.join("\n")}`)
      );
  }

  container
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Emitido por <@${verdict.staffDiscordId}>`)
    )
    .addSeparatorComponents(divider())
    .addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`verdict:edit:${verdict.id}`)
          .setLabel("Editar")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("✏️"),
        new ButtonBuilder()
          .setCustomId(`verdict:delete:${verdict.id}`)
          .setLabel("Deletar")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("🗑️")
      )
    );

  return container;
}
