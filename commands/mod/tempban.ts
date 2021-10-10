import { Message } from 'discord.js';
import moment = require('moment');
import KiraBot from '../../src/bot';
import { CaseType } from '../../src/database/cases';
import { GET_GUILD_CONFIG } from '../../src/database/database';

export const tempban = {
  desc: 'Temp ban a user',
  name: 'tempban',
  args: '<@user/userid> <reason> | <number of days>',
  alias: ['tb'],
  type: 'mod',
  run: async (message: Message, args: string[], client: KiraBot) => {
    if (!message.guild) return;
    const { guild } = message;

    const guildId = guild.id;

    const config = await GET_GUILD_CONFIG(guildId);

    if (!config) return;

    if (
      !message.member?.permissions.has('BAN_MEMBERS') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }
    if (!args.length) {
      return message.reply(`You forgot some arguements.`);
    }

    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId =
      message.mentions.members?.filter((u) => u.id !== client.user?.id).first()
        ?.id || args.shift();

    if (!userId) {
      return message.reply(
        `Did you forget to mention the user? If you did I was unable to process the request. Please try once more.`
      );
    }

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    const user = message.guild?.members.cache.get(userId || '');

    if (
      user?.permissions.has('BAN_MEMBERS') ||
      user?.roles.cache.get(config.modRole || '')
    ) {
      return message.reply(`You can't ban them lol.`);
    }

    const words = args.join(' ').trim();

    let [reason, time] = words.split('|').map((t) => t.trim());
    if (reason === '') reason = 'No reason provided.';

    let unbanDate = moment().add(1, 'day').toDate();

    if (time && time !== '') {
      if (Number.isNaN(Number(time))) {
        return message.reply(
          `Oops! That's not a number. Please _only_ send a number for how many days to tempban.`
        );
      }

      const days = Number(time);
      unbanDate = moment()
        .add(days, days > 1 ? 'days' : 'day')
        .toDate();
    }

    if (user) {
      const banMessage =
        config.banMessage || `You've been banned from ${guild.name}.`;
      await user
        .send(banMessage)
        .catch(() =>
          console.error('Issue sending ban appeal message to user. Oh well?')
        );

      user
        .ban({ reason })
        .then(() => {
          client.logIssue(
            guildId,
            CaseType.TempBan,
            reason,
            message.author,
            user?.user || userId || 'User'
          );

          message.channel.send(
            `**Banned** ${user?.user.tag || 'User'} (<@${userId}>)`
          );
        })
        .catch(() =>
          message.reply(`I had issues trying to tempban that user!`)
        );
    } else {
      message.guild?.members
        .ban(userId || '')
        .then(() => {
          client.logIssue(
            guildId,
            CaseType.TempBan,
            reason,
            message.author,
            userId || 'User'
          );

          message.channel.send(`**Banned** User (<@${userId}>)`);
        })
        .catch(() => message.reply(`I had issues trying to ban that user!`));
    }

    return;
  },
};
