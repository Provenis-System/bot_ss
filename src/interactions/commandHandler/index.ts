import type { ChatInputCommandInteraction, Client } from "discord.js";

import { handleBuscarUsuario } from "../../commands/buscarUsuario.js";

export async function handleCommandInteraction(
  client: Client<true>,
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (interaction.commandName === "buscarusuario") {
    await handleBuscarUsuario(client, interaction);
  }
}
