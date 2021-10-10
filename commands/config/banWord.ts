import { Message } from 'discord.js';
import KiraBot from '../../src/bot';
import {
  GET_BANNED_WORDS,
  GET_GUILD_CONFIG,
  NEW_BANNED_WORD,
  REMOVE_BANNED_WORD,
} from '../../src/database/database';

export const word = {
  desc: 'Add or remove a word or list of words for the banned list. Everything added will be case sensitive.\n',
  name: 'banword',
  args: '<add | remove> <list of words seperated by comma>',
  alias: ['bw'],
  type: 'config',
  run: async (message: Message, args: string[], client: KiraBot) => {
    const { guild } = message;
    const config = await GET_GUILD_CONFIG(guild?.id || '');
    if (
      !guild ||
      !config ||
      (!message.member?.permissions.has(['MANAGE_GUILD']) &&
        !message.member?.roles.cache.has(config?.modRole || ''))
    )
      return;

    if (!args.length) {
      return message.reply(
        `Please try again, here's an example. \`${config.prefix}banword add owo, uwu, xd\``
      );
    }

    const wordType = args.shift()?.toLowerCase();
    const plural = args.length > 1 ? 's' : '';

    switch (wordType) {
      case 'add':
        NEW_BANNED_WORD(guild.id, args.join('').split(',')).then(async () => {
          client.bannedWords.set(
            message.guild!.id,
            await GET_BANNED_WORDS(guild.id)
          );
        });
        message.reply(
          `Successfully added the word${plural} to the banned list.`
        );
        break;
      case 'remove':
        REMOVE_BANNED_WORD(guild.id, args.join('').split(',')).then(
          async () => {
            message.channel.send(`Successfully removed the word${plural}.`);
            client.bannedWords.set(guild.id, await GET_BANNED_WORDS(guild.id));
          }
        );
        break;
    }
    return;
  },
};
