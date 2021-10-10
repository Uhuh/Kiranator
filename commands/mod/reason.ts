import { Message, MessageEmbed, TextChannel, User } from 'discord.js';
import * as moment from 'moment';
import { CaseType, ICases } from '../../src/database/cases';
import {
  GET_CASE,
  GET_GUILD_CONFIG,
  GET_USER_MUTE,
  UPDATE_USER_MUTE,
  UPDATE_CASE_REASON,
} from '../../src/database/database';

export const reason = {
  desc: 'Change the reason for a mod case in #mod-logs',
  name: 'reason',
  args: '<case #> <reason>',
  alias: ['r'],
  type: 'mod',
  run: async (message: Message, args: string[]) => {
    if (!message.guild) return;
    const { guild } = message;
    const guildId = guild.id;
    const config = await GET_GUILD_CONFIG(guildId);

    if (!config) return;

    if (
      !message.member?.permissions.has('MANAGE_MESSAGES') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }

    if (!config) {
      return message.reply(`I somehow cannot find the guilds config file.`);
    } else if (!config.modLog) {
      return message.reply(
        `I could not find a mod log channel setup for this server. Set up the mod/server log channel with the logs command.`
      );
    }

    message.delete().catch(console.error);

    const caseId = args.shift();

    if (!caseId) {
      return;
    }

    if (Number.isNaN(Number(caseId))) {
      return message.reply(
        `Make sure you entered a case ID. ${caseId} is not a proper number.`
      );
    }

    const reason = args.join(' ');
    const modCase = await GET_CASE(guildId, Number(caseId));
    if (!modCase) {
      return message.channel.send(
        `Could not find a log with that case ID. - ${caseId}`
      );
    }

    const channel = message.guild.channels.cache.get(
      config?.modLog
    ) as TextChannel;

    let caseMessage = channel.messages.cache.get(modCase.messageId);

    if (!caseMessage) {
      await channel.messages
        .fetch(modCase.messageId)
        .catch(() =>
          console.error(
            `Failed to fetch mod log case message: Caase ID: ${modCase.id}`
          )
        );
      caseMessage = channel.messages.cache.get(modCase.messageId);

      if (!caseMessage) return;
    }

    const embed = new MessageEmbed();

    // Just get that stuff, it probably isn't cached.
    await message.guild.members
      .fetch(modCase.userId)
      .catch(() => console.error(`User is not in guild.`));
    await message.guild.members
      .fetch(modCase.modId)
      .catch(() => console.error(`Mod not in guild ????`));

    const user: User | string =
      message.guild.members.cache.get(modCase.userId)?.user || modCase.userId;
    const mod: User | string =
      message.guild.members.cache.get(modCase.modId)?.user || modCase.modId;

    let color = 15158332;

    switch (modCase.type) {
      case CaseType.Ban:
        color = 15158332;
        break;
      case CaseType.Warn:
        UPDATE_CASE_REASON(guildId, modCase.caseId!, args.join(' ').trim());
        if (user instanceof User) {
          user.send(
            `Your warning (ID: ${modCase.caseId}) has a new reason: ${args
              .join(' ')
              .trim()}`
          );
        }
        break;
      case CaseType.Mute:
        color = 15844367;
        muteDurationChange(modCase, args.join(' '), message);
        break;
      case CaseType.UnMute:
      case CaseType.UnWarn:
        color = 3066993;
        break;
    }

    embed
      .setTitle(`${CaseType[modCase.type]} | Case #${modCase.caseId}`)
      .addField(
        `**User**`,
        `${typeof user === 'string' ? user : user?.tag} (<@${
          typeof user === 'string' ? user : user.id
        }>)`,
        true
      )
      .addField(
        `**Moderator**`,
        mod instanceof User ? mod.tag : `<@${mod}>`,
        true
      )
      .addField(
        `**Reason**`,
        reason === '' ? 'Mod please do `bbreason <case #> <reason>`' : reason
      )
      .setColor(color)
      .setTimestamp(new Date());

    caseMessage.edit({ embeds: [embed] });

    return;
  },
};

const muteDurationChange = async (
  modCase: ICases,
  words: string,
  message: Message
) => {
  let [, time] = words.split('|');

  // Default is infinite
  const mutedUser = await GET_USER_MUTE(message.guild?.id!, modCase.userId);

  if (!mutedUser) {
    return message.reply(`That user is no longer muted. Remute them!`);
  }

  let unmuteTime = moment().add(1, 'h');

  if (time && time !== '') {
    const timeFormat = time[time.length - 1];
    const num = time.slice(0, -1);

    if (Number.isNaN(Number(num))) {
      return message.reply(`Oops! That's not a number for time.`);
    }

    switch (timeFormat) {
      case 'm':
      case 'h':
      case 'd':
      case 'w':
      case 'y':
        unmuteTime = moment(mutedUser.creationDate).add(
          Number(num),
          timeFormat
        );
    }
  } else time = '1h';

  UPDATE_USER_MUTE(
    message.guild?.id || '',
    modCase.userId,
    modCase.caseId,
    unmuteTime.toDate()
  );

  await message.guild?.members.fetch(modCase.userId);
  const user = message.guild?.members.cache.get(modCase.userId);
  await user
    ?.send(`Your mute duration has been changed to ${time.trim()}.`)
    .catch(() =>
      console.error(`Issues updating user on their mute duration change.`)
    );

  return;
};
