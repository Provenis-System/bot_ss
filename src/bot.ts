import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  type TextChannel
} from "discord.js";

import { env } from "./config/env.js";
import { ensureKeyPanel } from "./panels/keyPanel.js";
import { handleButtonInteraction } from "./interactions/buttonHandler.js";
import { startScanPoller } from "./jobs/scanPoller.job.js";
import { prisma } from "./database/prisma.js";
import { logger } from "./utils/logger.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once(Events.ClientReady, async (readyClient) => {
  logger.info({ botUserId: readyClient.user.id }, "Bot conectado.");
  await ensureKeyPanel(readyClient);
  startScanPoller(readyClient);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  try {
    await handleButtonInteraction(client as Client<true>, interaction);
  } catch (error) {
    logger.error({ err: error, customId: interaction.customId }, "Falha ao processar interação de botão.");

    const replyPayload = {
      content: error instanceof Error ? error.message : "Falha inesperada ao processar ação.",
      ephemeral: true
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(replyPayload).catch(() => null);
    } else {
      await interaction.reply(replyPayload).catch(() => null);
    }
  }
});

client.on(Events.Error, (error) => {
  logger.error({ err: error }, "Erro do cliente Discord.");
});

async function bootstrap() {
  await prisma.$connect();
  await client.login(env.DISCORD_TOKEN);

  const logChannel = await client.channels.fetch(env.LOG_CHANNEL_ID).catch(() => null);
  if (logChannel && logChannel.type === ChannelType.GuildText) {
    await (logChannel as TextChannel).send("Bot iniciado e pronto para uso.").catch(() => null);
  }
}

void bootstrap().catch(async (error) => {
  logger.fatal({ err: error }, "Falha fatal ao iniciar bot.");
  await prisma.$disconnect().catch(() => null);
  process.exitCode = 1;
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    logger.info({ signal }, "Encerrando aplicação.");
    await prisma.$disconnect().catch(() => null);
    client.destroy();
    process.exit(0);
  });
}