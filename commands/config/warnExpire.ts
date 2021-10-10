import { Message } from 'discord.js';
import { GET_GUILD_CONFIG, SET_WARN_EXPIRE } from '../../src/database/database';

export const warnExpire = {
  desc: 'Set how long it takes for a warn to expire.',
  name: 'warnexpire',
  args: '<number in days>',
  alias: ['we'],
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

    const numDays = Number(args[0]);
    if (Number.isNaN(numDays)) {
      return message.reply(
        `You need to pass a number. The max I support up to is 30 days, and minimum 1,`
      );
    } else if (numDays > 30 || numDays < 1) {
      return message.reply(
        `The days cannot be greater than 30 nor less than 1.`
      );
    }

    return SET_WARN_EXPIRE(guild.id, numDays)
      .then(() =>
        message.reply(`Successfully set warns to expire after ${numDays} days.`)
      )
      .catch(() =>
        message.reply(
          `I had an issue setting the warn expiration days configuration.`
        )
      );
  },
};
