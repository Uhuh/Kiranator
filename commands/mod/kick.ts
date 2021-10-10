import { Message } from 'discord.js';
import KiraBot from '../../src/bot';
import { CaseType } from '../../src/database/cases';
import { GET_GUILD_CONFIG } from '../../src/database/database';

export const kick = {
  desc: 'Kick a user',
  name: 'kick',
  args: '<user id> <reason>',
  alias: ['k'],
  type: 'mod',
  run: async (message: Message, args: string[], client: KiraBot) => {
    if (!message.guild) return;
    const { guild } = message;

    const guildId = guild.id;

    const config = await GET_GUILD_CONFIG(guildId);

    if (!config) return;

    if (
      !message.member?.permissions.has('KICK_MEMBERS') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }
    if (!args.length) {
      const prefix = client.guildPrefix.get(message.guild?.id || '') || 'v.';
      return message.reply(
        `You forgot some arguements. \`${prefix}kick <user id> <reason>\``
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
      return message.reply(
        `Did you forget to mention the user? If you did I was unable to process the request. Please try once more.`
      );
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
            `Failed to get user to kick. ID is probably a message ID. [${userId}]`
          )
        );
      user = message.guild?.members.cache.get(userId || '');
    }

    if (!user) {
      return console.error(`Issue getting user on guild. User ID: ${userId}`);
    }

    if (
      user?.permissions.has('KICK_MEMBERS') ||
      user?.roles.cache.has(config.modRole || '')
    ) {
      return message.reply(`You can't kick them lol.`);
    }

    const reason =
      args.join(' ').trim() === ''
        ? 'No reason provided.'
        : args.join(' ').trim();

    user
      .kick()
      .then(() => {
        client.logIssue(
          message.guild!.id,
          CaseType.Kick,
          reason,
          message.author,
          user!.user
        );

        message.channel.send(`**Kicked** ${user?.user.tag} (<@${user?.id}>)`);
      })
      .catch(() => message.reply(`I had issue trying to kick that user!`));
  },
};
