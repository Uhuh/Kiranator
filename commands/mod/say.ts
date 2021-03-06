import { Message, TextChannel } from 'discord.js';
import { GET_GUILD_CONFIG } from '../../src/database/database';

export const say = {
  desc: 'Say something in chat. If you mention a channel the bot will speak there instead.',
  name: 'say',
  args: '',
  alias: [],
  type: 'mod',
  run: async (message: Message, args: string[]) => {
    if (!message.guild) return;
    const { guild } = message;
    const config = await GET_GUILD_CONFIG(guild.id);

    if (!config) return;

    if (
      !message.member?.permissions.has('MANAGE_MESSAGES') &&
      !(config.modRole && message.member?.roles.cache.has(config.modRole))
    ) {
      return message.react('👎');
    }
    const channel = message.mentions.channels.first() as TextChannel;
    if (channel) args.shift();

    let image = message.attachments.first();

    if (channel) {
      if (image) {
        return channel.send(image.proxyURL).catch(console.error);
      }

      return channel.send(args.join(' ')).catch(console.error);
    }

    let content = '';

    if (args[0] === config.prefix) {
      content = message.content.slice(config.prefix?.length).trim().slice(3);
    } else {
      const preparse = message.content
        .substr(message.content.indexOf(' ') + 1)
        .trim();
      content = preparse.startsWith('say') ? preparse.slice(3) : preparse;
    }

    message
      .delete()
      .catch(() =>
        console.error(
          `Failed to delete say message for guild[${
            message.guild?.id || 'could not load guild'
          }]`
        )
      );
    return message.channel.send(content || 'Nothing to say!');
  },
};
