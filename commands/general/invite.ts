import { Message, MessageEmbed } from 'discord.js';
import KiraBot from '../../src/bot';
import { AVATAR_URL } from '../../src/vars';
import { missingPerms } from '../../utilities/functions/missingPerm';
import { COLOR } from '../../utilities/types/global';

export const invite = {
  desc: 'Check my latency.',
  name: 'info',
  args: '',
  alias: ['i'],
  type: 'general',
  run: (message: Message, _args: string[], client: KiraBot) => {
    const embed = new MessageEmbed();

    embed
      .setTitle('General info for KiraBot')
      .setColor(COLOR.AQUA)
      .setDescription(
        `
I'm a custom bot designed to help Omori Kira's server!

Latency is ${
          Date.now() - message.createdTimestamp
        }ms. API Latency is ${Math.round(client.ws.ping)}ms.`
      )
      .setThumbnail(AVATAR_URL);

    message.channel
      .send({ embeds: [embed] })
      .catch(() => missingPerms(message, 'embed'));
  },
};
