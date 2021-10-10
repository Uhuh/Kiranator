import { Message, MessageEmbed } from 'discord.js';
import {
  GENERATE_GUILD_CONFIG,
  GET_GUILD_CONFIG,
} from '../../src/database/database';
import { missingPerms } from '../../utilities/functions/missingPerm';

export const setup = {
  desc: 'If KiraBot failed to setup the server config, run this to fix it.',
  name: 'setup',
  args: '',
  alias: [],
  type: 'setup',
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

    if (!config) {
      return message.reply(`I'm already configured for the server!`);
    }

    const embed = new MessageEmbed();

    embed
      .setTitle(`Configuration setup for **${guild.name}**`)
      .setThumbnail(guild.iconURL() || '')
      .addField('Guild prefix:', `\`${config.prefix}\``, true)
      .addField('Warns expire after:', `${config.warnLifeSpan} days`, true)
      .addField('Max warns before banning:', `${config.maxWarns}`, true)
      .addField(
        'Mod logging channel:',
        config.modLog ? `<#${config.modLog}>` : 'Not set!',
        true
      )
      .addField(
        'Server logging channel:',
        config.serverLog ? `<#${config.serverLog}>` : 'Not set!',
        true
      )
      .addField(
        'Mute role:',
        `${
          config.muteRole ? guild.roles.cache.get(config.muteRole) : 'Not set!'
        }`,
        true
      )
      .addField(
        'Current amount of mod cases:',
        `${config.nextCaseId! - 1}`,
        true
      )
      .addField(
        'Ban message:',
        config.banMessage || `You've been banned from ${guild.name}.`
      );

    return message.channel
      .send({ embeds: [embed] })
      .catch(() => missingPerms(message, 'embed'));
  },
};
