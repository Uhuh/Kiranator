import { Message } from 'discord.js';
import {
  GET_BANNED_WORDS,
  GET_GUILD_CONFIG,
} from '../../src/database/database';

export const listWords = {
  desc: 'List of currently banned words.',
  name: 'banwordlist',
  args: '',
  alias: ['bwl'],
  type: 'config',
  run: async (message: Message) => {
    const { guild } = message;
    const config = await GET_GUILD_CONFIG(guild?.id || '');
    if (
      !guild ||
      !config ||
      (!message.member?.permissions.has(['MANAGE_GUILD']) &&
        !message.member?.roles.cache.has(config?.modRole || ''))
    )
      return;

    const words = await GET_BANNED_WORDS(guild.id);

    message.channel.send(
      !words.length
        ? `There are no banned words.`
        : `Banned words: ||${words.join(', ')}||`
    );
  },
};
