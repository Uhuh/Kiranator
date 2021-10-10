import { Message } from 'discord.js';
import { GET_GUILD_CONFIG, SET_BANNED_MSG } from '../../src/database/database';

export const banMsg = {
  desc: `Set ban message. This will get DMd to a user right before they're banned.`,
  name: 'banmsg',
  args: '<words n stuff>',
  alias: ['bm'],
  type: 'config',
  run: async (message: Message, args: string[]) => {
    const { guild } = message;
    const config = await GET_GUILD_CONFIG(guild?.id || '');
    if (
      !guild ||
      !config ||
      (!message.member?.permissions.has(['MANAGE_GUILD']) &&
        !message.member?.roles.cache.has(config?.modRole || ''))
    )
      return;

    if (args.join(' ').length > 1020) {
      return message.reply(
        `The ban message can only be a max of 1020 characters.`
      );
    }

    return SET_BANNED_MSG(guild.id, args.join(' '))
      .then(() =>
        message.channel.send('I changed the ban message successfully.')
      )
      .catch(() => message.reply(`I failed to set that as the ban message.`));
  },
};
