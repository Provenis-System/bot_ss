import type { ButtonInteraction, GuildMember } from "discord.js";

import { env } from "../../config/env.js";

export function assertStaffPermission(interaction: ButtonInteraction): void {
  const member = interaction.member as GuildMember | null;

  if (!member || !member.roles.cache.has(env.STAFF_ROLE_ID)) {
    throw new Error("Você não tem permissão para usar este botão.");
  }
}