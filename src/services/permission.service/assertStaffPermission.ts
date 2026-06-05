import type { GuildMember, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

import { env } from "../../config/env.js";

async function resolveMember(
  interaction: MessageComponentInteraction | ModalSubmitInteraction
): Promise<GuildMember | null> {
  return interaction.inCachedGuild()
    ? interaction.guild.members.fetch(interaction.user.id).catch(() => null)
    : (interaction.member as GuildMember | null);
}

export async function checkStaffPermission(
  interaction: MessageComponentInteraction | ModalSubmitInteraction
): Promise<boolean> {
  const member = await resolveMember(interaction);
  if (!member) return false;
  if (member.permissions.has("Administrator")) return true;
  return member.roles.cache.has(env.STAFF_ROLE_ID);
}

export async function assertStaffPermission(
  interaction: MessageComponentInteraction | ModalSubmitInteraction
): Promise<void> {
  const isStaff = await checkStaffPermission(interaction);
  if (!isStaff) {
    throw new Error("Você não tem permissão para usar este recurso.");
  }
}
