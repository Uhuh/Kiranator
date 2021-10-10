import { Message } from 'discord.js';
import KiraBot from '../../src/bot';
import * as moment from 'moment';
import { GET_GUILD_CONFIG, GET_USER_MUTE } from '../../src/database/database';
import { CaseType } from '../../src/database/cases';

export const mute = {
  desc: 'Mute a user',
  name: 'mute',
  args: '<user id or mention> <reason> | [number {m,h,d,w,y}]',
  alias: ['m'],
  type: 'mod',
  run: async (message: Message, args: string[], client: KiraBot) => {
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
    if (!args.length) {
      const prefix = client.guildPrefix.get(message.guild?.id || '') || 'v.';
      return message.reply(
        `You forgot some arguements. Example usage: \`${prefix}mute <user id> Annoying! | 5m\``
      );
    }

    if (!config.muteRole) {
      return message.reply(
        `There is no mute role configured for this server. Try \`${config.prefix}config mute <@role/ID>\``
      );
    }

    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId =
      message.mentions.members?.filter((u) => u.id !== client.user?.id).first()
        ?.id || args.shift();

    if (!userId) {
      return message.reply(`Missing the user id argument!`);
    }

    const existingMute = await GET_USER_MUTE(guildId, userId);

    if (existingMute) {
      return message.reply(`They're already muted. Check <#${config.modLog}>`);
    }

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    let user = message.guild?.members.cache.get(userId || '');
    // Try a fetch incase the user isn't cached.
    if (!user) {
      await message.guild?.members
        .fetch(userId || '')
        .catch(() =>
          console.error(
            `Failed to get user to mute. Potentially not a user ID. [${userId}]`
          )
        );
      user = message.guild?.members.cache.get(userId || '');
    }

    if (!user) {
      return message.reply(
        `Couldn't find that user, check that the ID is correct.`
      );
    }

    const words = args.join(' ').trim();

    let [reason, time] = words.split('|').map((t) => t.trim());
    if (reason === '') reason = 'No reason provided.';

    //@ts-ignore
    let unmuteTime = moment().add(1, 'h').toDate();

    if (time && time !== '') {
      const timeFormat = time[time.length - 1];
      const num = time.slice(0, -1);

      if (Number.isNaN(Number(num))) {
        return message.reply(`Oops! That's not a number for time.`);
      }

      const timeToAdd = Number(num);

      switch (timeFormat) {
        case 'm':
        case 'h':
        case 'd':
        case 'w':
        case 'y':
          unmuteTime = moment().add(Number(num), timeFormat).toDate();
      }
    } else time = '1h';

    message.delete().catch(() => console.error(`Issues deleting mute message`));

    /**
     * Mute user and set up timer to unmute them when the time is right.
     */
    user.roles
      .add(config.muteRole)
      .then(async () => {
        client.logIssue(
          message.guild!.id,
          CaseType.Mute,
          `${reason}\n\nMuted for ${time}`,
          message.author,
          user?.user || userId
        );

        message.channel.send(
          `<@${user?.id}> You've been muted for \`${reason}\`. Duration is ${time}.`
        );

        await user!
          .send(`You've been muted for \`${reason}\`. Duration is ${time}.`)
          .catch((e) =>
            console.error(
              `Guild[${guildId}] - Issue sending mute reason to user. Oh well? ${e}\n`
            )
          );
      })
      .catch(() =>
        message.reply(`I was unable to give that user the mute role!`)
      );

    return;
  },
};
