import { Message } from 'discord.js';
import { GET_GUILD_CONFIG, SET_WARN_LIMIT } from '../../src/database/database';

export const warnsMax = {
  desc: 'Set the max warns a user can get before getting banned.',
  name: 'maxwarns',
  args: '<a number in the range [1, 10]>',
  alias: ['mw'],
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

    const maxWarns = Number(args[0]);
    if (Number.isNaN(maxWarns)) {
      return message.reply(`You need to pass a number. The range is [1, 10].`);
    } else if (maxWarns > 30 || maxWarns < 1) {
      return message.reply(`That's not within the range [1, 10]`);
    }

    return SET_WARN_LIMIT(guild.id, maxWarns)
      .then(() => message.reply(`Successfully set the max warns.`))
      .catch(() =>
        message.reply(`I failed to set the max warns for this guild.`)
      );
  },
};
