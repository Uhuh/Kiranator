import { Message, MessageEmbed } from 'discord.js';
import KiraBot from '../../src/bot';
import { GET_GUILD_CONFIG } from '../../src/database/database';
import { INVITE_URL } from '../../src/vars';
import { missingPerms } from '../../utilities/functions/missingPerm';
import { Category, CategoryStrings } from '../../utilities/types/commands';
import { COLOR } from '../../utilities/types/global';

export const help = {
  desc: 'Sends a list of all available commands.',
  name: 'help',
  args: '',
  alias: ['cmds', 'h', 'commands'],
  type: '',
  run: async function (message: Message, args: string[], client: KiraBot) {
    const embed = new MessageEmbed();

    const key = (args[0]?.toLowerCase() || '') as CategoryStrings;

    if (args.length && !(key in Category)) return;

    const { user } = client;
    if (!user) return;

    const prefix = client.guildPrefix.get(message.guild?.id || '') || 'v.';

    embed
      .setTitle('**Commands**')
      .setColor(COLOR.AQUA)
      .setURL(INVITE_URL)
      .setAuthor(user.username, user.avatarURL() || '')
      .setThumbnail(user.avatarURL() || '')
      .setFooter(`Replying to: ${message.author.tag}`)
      .setTimestamp(new Date());

    const config = await GET_GUILD_CONFIG(message.guild?.id || '');

    /**
     * If no category is specified then list all categories.
     */
    if (!args.length) {
      embed.setTitle('**Command Categories**');
      embed.addField(`**General**`, `Try out \`${prefix}help general\``);
      if (
        message.member?.permissions.has('MANAGE_MESSAGES') ||
        message.member?.roles.cache.has(config?.modRole || '')
      ) {
        embed.addField(
          `**Config**`,
          `Try out \`${prefix}config help\`\nAll config commands require MANAGE_GUILD permissions.`
        );
        embed.addField(`**Mod**`, `Try out \`${prefix}help mod\``);
      }
    } else if (key) {
      // If they specify a list type (general, config, etc) show those respective commands
      embed.setTitle(`**${key.toUpperCase()} commands**`);

      const hasPerm =
        message.member?.permissions.has('MANAGE_MESSAGES') ||
        message.member?.roles.cache.has(config?.modRole || '');

      client.commands
        .filter((c) => c.type === key)
        .filter((func) => !(func.type === Category.mod && !hasPerm))
        .forEach((func) =>
          embed.addField(`**${prefix}${func.name} ${func.args}**`, func.desc)
        );

      embed.setDescription('***<> = required arguments, [] = optional.***\n\n');
    }

    message.channel
      .send({ embeds: [embed] })
      .catch(() => missingPerms(message, 'embed'));
  },
};
