import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder
} from "discord.js";

export function buildKeyPanel() {
  const generateButton = new ButtonBuilder()
    .setCustomId("scan:generate-key")
    .setLabel("🔑 Gerar Chave")
    .setStyle(ButtonStyle.Primary);

  return new ContainerBuilder()
    .setAccentColor(0x5865f2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "## 🔍 Echo Scanner\n-# Painel de Telagem Privada"
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "Gere uma **chave exclusiva** para iniciar uma sessão de screenshare privado e monitorado.\n\n> ⚠️ Somente membros da **Forensic Screenshare** podem iniciar uma varredura."
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "-# Pressione o botão para receber sua chave de acesso."
          )
        )
        .setButtonAccessory(generateButton)
    );
}