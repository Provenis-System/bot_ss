import { MessageFlags, type ButtonInteraction, type Client } from "discord.js";

import { buildGameSelectMenu } from "../../interactions/selectMenuHandler.js";
import { assertStaffPermission } from "../../services/permission.service/index.js";

type HandleGenerateKeyButtonInput = {
  client: Client<true>;
  interaction: ButtonInteraction;
};

export async function handleGenerateKeyButton(input: HandleGenerateKeyButtonInput) {
  const { interaction } = input;

  await assertStaffPermission(interaction);
  await interaction.reply({
    content: "Escolha abaixo para qual jogo você quer gerar a chave da Echo.",
    components: [buildGameSelectMenu(interaction.user.id)],
    flags: MessageFlags.Ephemeral
  });
}