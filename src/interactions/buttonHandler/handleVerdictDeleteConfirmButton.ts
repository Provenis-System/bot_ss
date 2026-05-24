import {
  ChannelType,
  type ButtonInteraction,
  type Client,
  type TextChannel
} from "discord.js";

import { assertStaffPermission } from "../../services/permission.service/index.js";
import { deleteVerdict, getVerdictById } from "../../services/verdict.service/index.js";

export async function handleVerdictDeleteConfirmButton(
  client: Client<true>,
  interaction: ButtonInteraction,
  verdictId: string
): Promise<void> {
  await assertStaffPermission(interaction);

  const verdict = await getVerdictById(verdictId);
  if (!verdict) {
    await interaction.update({ content: "❌ Veredito não encontrado.", components: [] });
    return;
  }

  if (verdict.logChannelId && verdict.logMessageId) {
    const logChannel = await client.channels.fetch(verdict.logChannelId).catch(() => null);
    if (logChannel?.type === ChannelType.GuildText) {
      const logMsg = await (logChannel as TextChannel).messages
        .fetch(verdict.logMessageId)
        .catch(() => null);
      await logMsg?.delete().catch(() => null);
    }
  }

  await deleteVerdict(verdictId);

  await interaction.update({
    content: `✅ Veredito \`${verdictId.slice(0, 8)}\` deletado com sucesso.`,
    components: []
  });
}
