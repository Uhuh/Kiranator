import { Message, MessageEmbed } from 'discord.js';
import KiraBot from '../../src/bot';
import * as moment from 'moment';
import { GET_USER_WARNS } from '../../src/database/database';

export const userinfo = {
  desc: 'Information about user.',
  name: 'userinfo',
  args: '[user: mention/id]',
  alias: ['ui'],
  type: 'general',
  run: async function (message: Message, args: string[], client: KiraBot) {
    const { user } = client;

    if (!user || !message.mentions || !message.mentions.members) return;

    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId =
      message.mentions.members?.filter((u) => u.id !== client.user?.id).first()
        ?.id ||
      args.shift() ||
      message.author.id;

    if (message.mentions.members?.first()) args.shift();

    // Ensure the user is in the guild
    const member = message.guild?.members.cache.get(userId || '');

    if (!member) return;

    const embed = new MessageEmbed();
    const WEEK_OLD = moment().subtract(7, 'days').startOf('day');
    const warnings = await GET_USER_WARNS(message.guild!.id, userId);
    const activeWarns =
      warnings.filter((w) => !moment(w.creationDate).isBefore(WEEK_OLD)) || [];

    embed
      .setTitle(`**User Info**`)
      .setColor(7419530)
      .setThumbnail(member.user.avatarURL({ dynamic: true }) || '')
      .setFooter(`Replying to: ${message.author.tag}`)
      .setTimestamp(new Date());

    embed
      .addField('**Created**', member.user.createdAt.toDateString(), true)
      .addField('**Joined**', `${member.joinedAt?.toDateString()}`, true)
      .addField('**Username**', member.user.tag, true)
      .addField('**ID**', member.user.id)
      .addField(
        'Warnings',
        warnings.length
          ? `Total: ${warnings.length} | Active: ${
              activeWarns.length
            }\n\nIDs: ${warnings.map((w) => w.caseId)}`
          : 'No warnings for this user'
      )
      .addField(
        'Active Warnings',
        activeWarns.length
          ? activeWarns
              .map((w) => `ID: ${w.caseId} | Reason: ${w.reason}\n`)
              .join('')
          : 'No active warnings for this user'
      );

    message.channel.send({ embeds: [embed] });
  },
};
