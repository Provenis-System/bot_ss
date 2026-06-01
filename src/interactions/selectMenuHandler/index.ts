import type {
  AnySelectMenuInteraction,
  ChannelSelectMenuInteraction,
  Client,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction
} from "discord.js";

import { handleGameSelectMenu } from "./handleGameSelectMenu.js";
import {
  handleTicketConfigCategorySelect,
  handleTicketConfigLeaveSelect,
  handleTicketConfigRolesSelect,
  handleTicketConfigVerdictLogSelect,
  handleTicketConfigWelcomeSelect
} from "./handleTicketConfigSelectMenu.js";

export async function handleSelectMenuInteraction(
  client: Client<true>,
  interaction: AnySelectMenuInteraction
) {
  if (interaction.isStringSelectMenu()) {
    const stringInteraction = interaction as StringSelectMenuInteraction;
    if (stringInteraction.customId.startsWith("scan:select-game:")) {
      await handleGameSelectMenu({ client, interaction: stringInteraction });
    }
    return;
  }

  if (interaction.isChannelSelectMenu()) {
    const channelInteraction = interaction as ChannelSelectMenuInteraction;
    if (channelInteraction.customId === "ticket:config:category") {
      await handleTicketConfigCategorySelect(client, channelInteraction);
    } else if (channelInteraction.customId === "ticket:config:verdict-log") {
      await handleTicketConfigVerdictLogSelect(client, channelInteraction);
    } else if (channelInteraction.customId === "ticket:config:welcome") {
      await handleTicketConfigWelcomeSelect(client, channelInteraction);
    } else if (channelInteraction.customId === "ticket:config:leave") {
      await handleTicketConfigLeaveSelect(client, channelInteraction);
    }
    return;
  }

  if (interaction.isRoleSelectMenu()) {
    const roleInteraction = interaction as RoleSelectMenuInteraction;
    if (roleInteraction.customId === "ticket:config:roles") {
      await handleTicketConfigRolesSelect(client, roleInteraction);
    }
  }
}
