import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder
} from "discord.js";

export function buildKeyPanel() {
  const generateButton = new ButtonBuilder()
    .setCustomId("scan:generate-key")
    .setLabel("Gerar chave")
    .setStyle(ButtonStyle.Primary);

  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("# Painel Echo Scanner\nUse o botão abaixo para gerar uma nova chave de telagem privada.")
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("Somente staff autorizado pode iniciar uma varredura.")
        )
        .setButtonAccessory(generateButton)
    )
    .addMediaGalleryComponents(new MediaGalleryBuilder());
}