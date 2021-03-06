import { Message, MessageEmbed } from 'discord.js';
import KiraBot from '../../src/bot';
import { GET_GUILD_CONFIG } from '../../src/database/database';
import { missingPerms } from '../../utilities/functions/missingPerm';
import { Category } from '../../utilities/types/commands';
import { COLOR } from '../../utilities/types/global';

export const config = {
  desc: 'Show the servers current config',
  name: 'config',
  args: '[help]',
  alias: [],
  type: 'config',
  run: async (message: Message, args: string[], client: KiraBot) => {
    const { guild } = message;

    const guildConfig = await GET_GUILD_CONFIG(guild?.id || '');

    if (
      !guild ||
      !guildConfig ||
      (!message.member?.permissions.has(['MANAGE_GUILD']) &&
        !message.member?.roles.cache.has(guildConfig?.modRole || ''))
    )
      return;

    if (args.length && args[0].toLowerCase() === 'setup') {
      return client.commands.get('setup')?.run(message, args, client);
    }

    if (!guildConfig) {
      return message.reply(
        `I couldn't find a config for this guild. I might be broken, try running v.setup`
      );
    }

    if (args.length === 0) {
      const embed = new MessageEmbed();
      embed
        .setTitle(`Configuration for **${guild.name}**`)
        .setThumbnail(guild.iconURL() || '')
        .addField('Guild prefix:', `\`${guildConfig.prefix}\``, true)
        .addField(
          'Warns expire after:',
          `${guildConfig.warnLifeSpan} days`,
          true
        )
        .addField('Max warns before banning:', `${guildConfig.maxWarns}`, true)
        .addField(
          'Mod logging channel:',
          guildConfig.modLog ? `<#${guildConfig.modLog}>` : 'Not set!',
          true
        )
        .addField(
          'Server logging channel:',
          guildConfig.serverLog ? `<#${guildConfig.serverLog}>` : 'Not set!',
          true
        )
        .addField(
          'Mute role:',
          `${
            guildConfig.muteRole
              ? guild.roles.cache.get(guildConfig.muteRole) || 'Not set!'
              : 'Not set!'
          }`,
          true
        )
        .addField(
          'Mod role:',
          `${
            guildConfig.modRole
              ? guild.roles.cache.get(guildConfig.modRole) || 'Not set!'
              : 'Not set!'
          }`,
          true
        )
        .addField(
          'Current amount of mod cases:',
          `${guildConfig.nextCaseId! - 1}`,
          true
        )
        .addField(
          'Whitelisted channels:',
          `${
            guildConfig.serverLogWhitelist?.length
              ? guildConfig.serverLogWhitelist?.map((c) => `<#${c}>`)
              : 'None!'
          }`
        )
        .addField(
          'Ban message:',
          guildConfig.banMessage || `You've been banned from ${guild.name}.`
        )
        .setColor('#ee8269');

      return message.channel
        .send({ embeds: [embed] })
        .catch(() => missingPerms(message, 'embed'));
    }

    const configType = args.shift()?.toLowerCase() || '';

    if (configType === 'help') {
      const embed = new MessageEmbed();
      embed
        .setTitle('**Config commands**')
        .setDescription(`All config commands require MANAGE_GUILD permissions.`)
        .setColor(COLOR.AQUA)
        .setAuthor(`${client.user?.username}`, client.user?.avatarURL() || '')
        .setThumbnail(client.user?.avatarURL() || '')
        .setFooter(`Replying to: ${message.author.tag}`)
        .setTimestamp(new Date());

      client.commands
        .filter((c) => c.type === Category.config)
        .forEach((func) =>
          embed.addField(
            `**${guildConfig.prefix}config ${func.name} ${func.args}**`,
            func.desc
          )
        );

      return message.channel
        .send({ embeds: [embed] })
        .catch(() => missingPerms(message, 'embed'));
    }

    const command = client.commands.get(configType);

    if (!command || command.type !== 'config') {
      return message.reply(
        `Invalid config type! Run \`${guildConfig.prefix}config help\` to see the help menu.`
      );
    }

    command.run(message, args, client);

    return;
  },
};
