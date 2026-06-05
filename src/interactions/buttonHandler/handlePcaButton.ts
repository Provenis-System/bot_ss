import {
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  type ButtonInteraction
} from "discord.js";

import { getScanCaseById } from "../../services/scan.service/index.js";
import type { EchoScanDetailsResponse } from "../../types/scan.js";

function parsePcaLines(raw: EchoScanDetailsResponse): string[] {
  const results = raw.results as Record<string, unknown> | null;
  const pcaRaw = typeof results?.pca === "string" ? results.pca : "";
  if (!pcaRaw) return [];

  const seen = new Set<string>();
  const lines: string[] = [];

  for (const row of pcaRaw.split(/\r?\n/)) {
    const parts = row.trim().split(",");
    if (parts.length < 6) continue;

    const path = parts[5].trim();
    if (!path || seen.has(path)) continue;
    seen.add(path);

    const status = parts.slice(6).join(",").trim();
    lines.push(status ? `${path},${status}` : path);
  }

  return lines.slice(0, 50);
}

export async function handlePcaButton(interaction: ButtonInteraction, caseId: string) {
  const scanCase = await getScanCaseById(caseId);

  if (!scanCase?.resultRaw) {
    await interaction.reply({
      content: "Dados do PCA nao disponiveis para este caso.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const lines = parsePcaLines(scanCase.resultRaw as unknown as EchoScanDetailsResponse);

  if (lines.length === 0) {
    await interaction.reply({
      content: "Nenhum dado de PCA encontrado neste scan.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const chunks: string[] = [];
  let current = "";
  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line;
    if (next.length > 1800) {
      chunks.push(current);
      current = line;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);

  const divider = () =>
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);

  const container = new ContainerBuilder()
    .setAccentColor(0x5865f2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## Detalhes do PCA\n-# ${lines.length} processo(s) unicos registrados`
      )
    );

  for (const chunk of chunks) {
    container
      .addSeparatorComponents(divider())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`\`\`\`\n${chunk}\n\`\`\``)
      );
  }

  await interaction.reply({
    components: [container],
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
  });
}
