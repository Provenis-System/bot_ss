import {
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SlashCommandBuilder,
  TextDisplayBuilder,
  type ChatInputCommandInteraction,
  type Client
} from "discord.js";

import { env } from "../config/env.js";
import { assertStaffPermission } from "../services/permission.service/index.js";
import { getVerdictsByTarget } from "../services/verdict.service/index.js";
import { VERDICT_TYPE_LABELS } from "../interactions/buttonHandler/handleVerdictButton.js";

export const buscarUsuarioCommand = new SlashCommandBuilder()
  .setName("buscarusuario")
  .setDescription("Busca o histórico de vereditos e scans de um usuário")
  .addStringOption((opt) =>
    opt
      .setName("id")
      .setDescription("Discord ID do usuário (ex: 123456789012345678)")
      .setRequired(true)
      .setMinLength(17)
      .setMaxLength(20)
  );

function divider() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

function verdictIcon(type: string): string {
  if (type === "banned") return "🔴";
  if (type === "clean") return "🟢";
  return "🟡";
}

export async function handleBuscarUsuario(
  _client: Client<true>,
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await assertStaffPermission(interaction as never);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const discordId = interaction.options.getString("id", true).trim();

  if (!/^\d{17,20}$/.test(discordId)) {
    await interaction.editReply({ content: "❌ ID inválido. Deve ser um número com 17–20 dígitos." });
    return;
  }

  const verdicts = await getVerdictsByTarget(discordId);

  // Coleta scan cases únicos linkados aos vereditos
  const seenIds = new Set<string>();
  const linkedScans = verdicts
    .filter((v) => v.scanCase && !seenIds.has(v.scanCase.id) && seenIds.add(v.scanCase.id))
    .map((v) => v.scanCase!);

  const hasData = verdicts.length > 0;

  const container = new ContainerBuilder()
    .setAccentColor(hasData ? 0xe74c3c : 0x2ecc71)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🔎 Histórico do Usuário\n-# <@${discordId}> · \`${discordId}\``
      )
    );

  // ── Vereditos ──────────────────────────────────────────────────────────────
  container.addSeparatorComponents(divider());

  if (verdicts.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("**⚖️ Vereditos**\nNenhum veredito registrado.")
    );
  } else {
    const lines = verdicts.slice(0, 8).map((v, i) => {
      const icon = verdictIcon(v.verdictType);
      const label = VERDICT_TYPE_LABELS[v.verdictType] ?? v.verdictType;
      const ts = Math.floor(new Date(v.createdAt).getTime() / 1000);
      const logRef = v.logChannelId && v.logMessageId
        ? ` · [Ver log](https://discord.com/channels/${env.DISCORD_GUILD_ID}/${v.logChannelId}/${v.logMessageId})`
        : "";
      return `${i + 1}. ${icon} **${label}** — ${v.bannedCity} · <t:${ts}:d>${logRef}`;
    });

    const overflow = verdicts.length > 8 ? `\n-# ... e mais ${verdicts.length - 8} veredito(s).` : "";

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**⚖️ Vereditos (${verdicts.length})**\n${lines.join("\n")}${overflow}`
      )
    );
  }

  // ── Scans vinculados ───────────────────────────────────────────────────────
  container.addSeparatorComponents(divider());

  if (linkedScans.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("**🔍 Scans Vinculados**\nNenhum scan registrado nos vereditos.")
    );
  } else {
    const lines = linkedScans.slice(0, 8).map((s, i) => {
      const ts = Math.floor(new Date(s.createdAt).getTime() / 1000);
      const pin = s.echoPin ? `\`${s.echoPin}\`` : "sem PIN";
      const game = s.selectedGame ?? "FiveM";

      let ref = `\`${s.id.slice(0, 8)}\``;
      if (s.trackingMessageId && s.trackingChannelId) {
        const link = `https://discord.com/channels/${env.DISCORD_GUILD_ID}/${s.trackingChannelId}/${s.trackingMessageId}`;
        ref = `[${s.id.slice(0, 8)}](${link})`;
      }

      return `${i + 1}. PIN: ${pin} · ${game} · ${ref} · <t:${ts}:d>`;
    });

    const overflow = linkedScans.length > 8 ? `\n-# ... e mais ${linkedScans.length - 8} scan(s).` : "";

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**🔍 Scans Vinculados (${linkedScans.length})**\n${lines.join("\n")}${overflow}`
      )
    );
  }

  container
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Consultado por <@${interaction.user.id}>`)
    );

  await interaction.editReply({
    components: [container],
    flags: MessageFlags.IsComponentsV2
  });
}
