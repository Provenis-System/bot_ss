import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ContainerBuilder,
  RoleSelectMenuBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder
} from "discord.js";

import type { TicketConfig } from "../../services/ticketConfig.service/index.js";

function divider() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

function buildStatusLine(config: TicketConfig): string {
  const category = config.categoryId ? `<#${config.categoryId}>` : "Não configurado";
  const roles =
    config.allowedRoleIds.length > 0
      ? config.allowedRoleIds.map((id) => `<@&${id}>`).join(", ")
      : "Nenhum";
  const verdictLog = config.verdictLogChannelId ? `<#${config.verdictLogChannelId}>` : "Não configurado";
  return `-# Categoria: ${category} | Cargos: ${roles} | Log de Veredito: ${verdictLog}`;
}

export function buildTicketConfigPanel(config: TicketConfig): ContainerBuilder {
  const categorySelect = new ChannelSelectMenuBuilder()
    .setCustomId("ticket:config:category")
    .setPlaceholder("Selecione a categoria dos tickets")
    .setChannelTypes(ChannelType.GuildCategory)
    .setMinValues(1)
    .setMaxValues(1);

  const roleSelect = new RoleSelectMenuBuilder()
    .setCustomId("ticket:config:roles")
    .setPlaceholder("Selecione os cargos com acesso")
    .setMinValues(1)
    .setMaxValues(10);

  const verdictLogSelect = new ChannelSelectMenuBuilder()
    .setCustomId("ticket:config:verdict-log")
    .setPlaceholder("Selecione o canal de log de vereditos")
    .setChannelTypes(ChannelType.GuildText)
    .setMinValues(1)
    .setMaxValues(1);

  return new ContainerBuilder()
    .setAccentColor(0x5865f2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ⚙️ PAINEL DE CONFIGURAÇÃO\n-# Sistema de Tickets — Forensic Screenshare\n${buildStatusLine(config)}`
      )
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "**📁 Categoria dos Tickets**\nSelecione a categoria onde os canais de ticket serão criados."
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(categorySelect)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "**👥 Cargos com Acesso**\nSelecione quais cargos poderão visualizar os canais de ticket."
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelect)
    )
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "**📋 Canal de Log de Vereditos**\nSelecione o canal onde os vereditos registrados serão enviados."
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(verdictLogSelect)
    );
}
