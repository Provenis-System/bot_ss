import type { GuildMember, MessageComponentInteraction } from "discord.js";

import { env } from "../../config/env.js";

export async function assertStaffPermission(interaction: MessageComponentInteraction): Promise<void> {
  const member = interaction.inCachedGuild()
    ? await interaction.guild.members.fetch(interaction.user.id).catch(() => null)
    : (interaction.member as GuildMember | null);

  if (!member || !member.roles.cache.has(env.STAFF_ROLE_ID)) {
    throw new Error("Você não tem permissão para usar este botão.");
  }
}