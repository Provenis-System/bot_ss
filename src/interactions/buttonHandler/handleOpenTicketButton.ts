import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ContainerBuilder,
  MessageFlags,
  OverwriteType,
  PermissionFlagsBits,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  type ButtonInteraction,
  type Guild,
  type TextChannel
} from "discord.js";

import { assertStaffPermission } from "../../services/permission.service/index.js";
import {
  buildFiveMResultView,
  buildResultContainer
} from "../../services/scanResult.service/index.js";
import { getScanCaseById, logScanAction } from "../../services/scan.service/index.js";
import { getTicketConfig } from "../../services/ticketConfig.service/index.js";
import type { EchoScanDetailsResponse } from "../../types/scan.js";

function divider() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

export async function handleOpenTicketButton(
  interaction: ButtonInteraction,
  caseId: string
): Promise<void> {
  await assertStaffPermission(interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const config = await getTicketConfig();

  if (!config.categoryId) {
    await interaction.editReply({
      content: "⚠️ O sistema de tickets ainda não foi configurado. Configure a categoria no painel de configuração."
    });
    return;
  }

  const scanCase = await getScanCaseById(caseId);
  if (!scanCase) {
    await interaction.editReply({ content: "Caso não encontrado." });
    return;
  }

  const guild = interaction.guild as Guild;
  const username = interaction.user.username.replace(/[^a-z0-9]/gi, "").toLowerCase() || "user";
  const channelName = `ticket-${username}-${caseId.slice(0, 8)}`;

  const existing = guild.channels.cache.find((c) => c.name === channelName);
  if (existing) {
    await interaction.editReply({
      content: `Já existe um ticket aberto para este caso: <#${existing.id}>`
    });
    return;
  }

  const permissionOverwrites = [
    {
      id: guild.roles.everyone.id,
      type: OverwriteType.Role,
      deny: [PermissionFlagsBits.ViewChannel]
    },
    {
      id: interaction.user.id,
      type: OverwriteType.Member,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory
      ]
    },
    ...config.allowedRoleIds.map((roleId) => ({
      id: roleId,
      type: OverwriteType.Role,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory
      ]
    }))
  ];

  const ticketChannel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: config.categoryId,
    permissionOverwrites
  });

  const roleList =
    config.allowedRoleIds.length > 0
      ? config.allowedRoleIds.map((id) => `<@&${id}>`).join(", ")
      : "Nenhum";

  const headerContainer = new ContainerBuilder()
    .setAccentColor(0x5865f2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🎟️ Ticket Aberto\n-# Caso \`${caseId.slice(0, 8)}\``
      )
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `<@${interaction.user.id}> abriu este ticket com dúvida sobre o resultado da varredura.\n**Staff com acesso:** ${roleList}`
      )
    )
    .addSeparatorComponents(divider())
    .addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket:close")
          .setLabel("🔒 Fechar Ticket")
          .setStyle(ButtonStyle.Danger)
      )
    );

  const components: ContainerBuilder[] = [headerContainer];

  if (scanCase.resultRaw) {
    const resultView = buildFiveMResultView(
      scanCase.resultRaw as unknown as EchoScanDetailsResponse
    );
    const pcaButton = new ButtonBuilder()
      .setCustomId(`scan:view-pca:${scanCase.id}`)
      .setLabel("📂 PCA")
      .setStyle(ButtonStyle.Secondary);

    components.push(buildResultContainer(resultView, scanCase.id, [pcaButton]));
  }

  await (ticketChannel as TextChannel).send({
    components,
    flags: MessageFlags.IsComponentsV2
  });

  await logScanAction({
    scanCaseId: scanCase.id,
    action: "TICKET_OPENED",
    message: "Ticket de dúvida aberto pelo membro.",
    metadata: { ticketChannelId: ticketChannel.id, openedBy: interaction.user.id }
  });

  await interaction.editReply({
    content: `✅ Ticket aberto: <#${ticketChannel.id}>`
  });
}
