import {
  ChannelType,
  Colors,
  EmbedBuilder,
  type Client,
  type GuildMember,
  type PartialGuildMember,
  type TextChannel
} from "discord.js";

import { getTicketConfig } from "../services/ticketConfig.service/index.js";

const JOIN_MESSAGES = [
  "{user} acabou de entrar. Iniciando scan automático... aguardando PIN.",
  "🚨 Novo suspeito detectado: {user}. PIN gerado automaticamente.",
  "{user} apareceu. Histórico de vereditos: nenhum... *por enquanto.*",
  "📡 {user} foi flagado ao entrar. Motivo: existência suspeita.",
  "⚠️ {user} chegou. O Echo Scanner já está esquentando os motores.",
  "{user} entrou no servidor. Inocente até que o screenshare prove o contrário.",
  "🖥️ {user} conectou. Abrindo ticket de verificação... *só brincadeira. Ou não.*",
  "📋 {user} chegou. Seus processos já estão sendo monitorados desde agora.",
  "{user} entrou. O PCA ainda não mentiu, mas a noite é jovem.",
  "🔍 Alvo localizado: {user}. Preparando as ferramentas de análise.",
];

const LEAVE_MESSAGES = [
  "🏃 {user} saiu correndo antes do screenshare. Clássico dos culpados.",
  "{user} foi embora. Provavelmente foi formatar o PC em 24 horas.",
  "⚖️ {user} abandonou o servidor. Veredito automático: suspeito.",
  "{user} deletou as evidências e sumiu. O PCA não mente.",
  "📁 Caso encerrado. {user} foi embora. Destino: desconhecido.",
  "{user} saiu. Fugiu antes mesmo de gerar o PIN — recorde histórico.",
  "💨 {user} saiu. Não deixou PIN, não deixou screenshare, deixou só suspeita.",
  "{user} foi embora antes do resultado. Coincidência? Improvável.",
  "🗂️ Arquivo de {user} fechado. Causa: fuga preventiva.",
  "O Echo Scanner de {user} voltou incompleto. Algo nos diz que não foi limpo.",
];

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

async function fetchTextChannel(client: Client<true>, channelId: string): Promise<TextChannel | null> {
  const ch = await client.channels.fetch(channelId).catch(() => null);
  return ch?.type === ChannelType.GuildText ? (ch as TextChannel) : null;
}

export async function handleMemberAdd(client: Client<true>, member: GuildMember): Promise<void> {
  const config = await getTicketConfig();
  if (!config.welcomeChannelId) return;

  const channel = await fetchTextChannel(client, config.welcomeChannelId);
  if (!channel) return;

  const msg = pick(JOIN_MESSAGES).replace("{user}", `<@${member.id}>`);
  const totalMembers = member.guild.memberCount;

  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle("👋 Novo membro entrou!")
    .setDescription(msg)
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: "Usuário", value: `${member.user.tag}`, inline: true },
      { name: "ID", value: `\`${member.id}\``, inline: true },
      { name: "Conta criada em", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
    )
    .setFooter({ text: `Agora somos ${totalMembers} membros` })
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}

export async function handleMemberRemove(
  client: Client<true>,
  member: GuildMember | PartialGuildMember
): Promise<void> {
  const config = await getTicketConfig();
  if (!config.leaveChannelId) return;

  const channel = await fetchTextChannel(client, config.leaveChannelId);
  if (!channel) return;

  const msg = pick(LEAVE_MESSAGES).replace("{user}", `**${member.user?.tag ?? member.id}**`);

  const embed = new EmbedBuilder()
    .setColor(Colors.Red)
    .setTitle("🚪 Membro saiu")
    .setDescription(msg)
    .setThumbnail(member.user?.displayAvatarURL({ size: 256 }) ?? null)
    .addFields(
      { name: "Usuário", value: member.user?.tag ?? `\`${member.id}\``, inline: true },
      { name: "ID", value: `\`${member.id}\``, inline: true },
      {
        name: "Entrou em",
        value: member.joinedTimestamp
          ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
          : "Desconhecido",
        inline: true
      }
    )
    .setFooter({ text: `${member.guild.memberCount} membros restantes` })
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}
