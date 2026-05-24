import { REST, Routes } from "discord.js";

import { env } from "../config/env.js";
import { buscarUsuarioCommand } from "../commands/buscarUsuario.js";

const commands = [buscarUsuarioCommand.toJSON()];

const rest = new REST().setToken(env.DISCORD_TOKEN);

console.log(`Registrando ${commands.length} comando(s)...`);

await rest.put(
  Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
  { body: commands }
);

console.log("Comandos registrados com sucesso.");
