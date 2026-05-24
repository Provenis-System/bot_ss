import type { GuildMember, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

import { env } from "../../config/env.js";
import { getTicketConfig } from "../ticketConfig.service/index.js";

async function resolveMember(
  interaction: MessageComponentInteraction | ModalSubmitInteraction
): Promise<GuildMember | null> {
  return interaction.inCachedGuild()
    ? interaction.guild.members.fetch(interaction.user.id).catch(() => null)
    : (interaction.member as GuildMember | null);
}

async function resolveStaffRoleIds(): Promise<string[]> {
  const config = await getTicketConfig();
  return config.allowedRoleIds.length > 0 ? config.allowedRoleIds : [env.STAFF_ROLE_ID];
}

export async function checkStaffPermission(
  interaction: MessageComponentInteraction | ModalSubmitInteraction
): Promise<boolean> {
  const member = await resolveMember(interaction);
  if (!member) return false;
  if (member.permissions.has("Administrator")) return true;
  const roleIds = await resolveStaffRoleIds();
  return roleIds.some((id) => member.roles.cache.has(id));
}

export async function assertStaffPermission(
  interaction: MessageComponentInteraction | ModalSubmitInteraction
): Promise<void> {
  const isStaff = await checkStaffPermission(interaction);
  if (!isStaff) {
    throw new Error("Você não tem permissão para usar este recurso.");
  }
}
