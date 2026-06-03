import {
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  type ButtonInteraction,
  type Client
} from "discord.js";

import { buildGameSelectMenu } from "../../interactions/selectMenuHandler.js";

type HandleGenerateKeyButtonInput = {
  client: Client<true>;
  interaction: ButtonInteraction;
};

export async function handleGenerateKeyButton(input: HandleGenerateKeyButtonInput) {
  const { interaction } = input;

  const container = new ContainerBuilder()
    .setAccentColor(0x5865f2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "## 🎮 Selecionar Jogo\n-# Escolha abaixo para qual jogo você quer gerar a chave da Echo."
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    )
    .addActionRowComponents(buildGameSelectMenu(interaction.user.id));

  await interaction.reply({
    components: [container],
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
  });
}