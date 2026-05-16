import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

import { SUPPORTED_GAMES } from "../../services/gameSelection.service/index.js";

export function buildGameSelectMenu(userId: string) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`scan:select-game:${userId}`)
    .setPlaceholder("Escolha o jogo para gerar a chave")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      SUPPORTED_GAMES.map((game) => ({
        label: game.label,
        value: game.key,
        description: game.description
      }))
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}