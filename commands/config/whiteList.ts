import { Message, TextChannel } from 'discord.js';
import {
  ADD_CHANNEL_WHITELIST,
  GET_GUILD_CONFIG,
  REMOVE_CHANNEL_WHITELIST,
} from '../../src/database/database';

export const whitelist = {
  desc: 'Whitelist a channel to ignore server logs for.',
  name: 'whitelist',
  args: '<add | remove> <#channel | ID>',
  alias: ['wl'],
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

    if (!args.length) {
      return message.reply(
        `Please mention a channel or send its ID to whitelist it.`
      );
    }

    let [type, id] = args;

    if (message.mentions.channels.size) {
      id = message.mentions.channels.first()?.id || id;
    }

    const channel = guild.channels.cache.get(id) as TextChannel;

    if (!channel) {
      return message.channel.send(
        'I failed to find any channel with that id. Check the id, or mention the channel. Make sure I have access to see it and send messages to it too.'
      );
    }

    switch (type.toLowerCase()) {
      case 'add':
        ADD_CHANNEL_WHITELIST(guild.id, channel.id)
          .then(() => message.reply(`Successfully whitelisted channel.`))
          .catch(() =>
            message.reply(`I had issues whitelisting that channel.`)
          );
        break;
      case 'remove':
        REMOVE_CHANNEL_WHITELIST(guild.id, channel.id)
          .then(() =>
            message.reply(`Successfully removed the channel from whitelist.`)
          )
          .catch(() =>
            message.reply(`I had issues removing that channel from whitelist.`)
          );
        break;
      default:
        message.reply('You need to tell me if you want to `add` or `remove`.');
    }
    return;
  },
};
