import { Message } from 'discord.js';
import KiraBot from '../../src/bot';
import { CaseType } from '../../src/database/cases';
import { GET_GUILD_CONFIG } from '../../src/database/database';

export const ban = {
  desc: 'Ban a user',
  name: 'ban',
  args: '<user id> <reason>',
  alias: ['b'],
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
      user?.roles.cache.has(config.modRole || '')
    ) {
      return message.reply(`You can't ban them lol.`);
    }

    const reason =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

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
            message.guild?.id!,
            CaseType.Ban,
            reason,
            message.author,
            user?.user || userId || 'User'
          );

          message.channel.send(
            `**Banned** ${user?.user.tag || 'User'} (<@${userId}>)`
          );
        })
        .catch(() => message.reply(`I had issues trying to ban that user!`));
    } else {
      message.guild?.members
        .ban(userId || '')
        .then(() => {
          client.logIssue(
            guildId,
            CaseType.Ban,
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
