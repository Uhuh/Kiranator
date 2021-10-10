import { Message } from 'discord.js';
import KiraBot from '../../src/bot';
import {
  GET_GUILD_CONFIG,
  SET_GUILD_PREFIX,
} from '../../src/database/database';

export const prefix = {
  desc: 'Set the guilds prefix.',
  name: 'prefix',
  args: '<any prefix you want>',
  alias: ['p'],
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

    if (args.length === 0) {
      return message.reply(
        `You need to tell me what prefix you want to change to.`
      );
    }

    return SET_GUILD_PREFIX(guild.id, args[0])
      .then(() => {
        message.reply(`Successfully changed the guilds' prefix.`);
        client.guildPrefix.set(message.guild!.id, args[0]);
      })
      .catch(() => message.reply(`I failed to set the prefix to that!`));
  },
};
