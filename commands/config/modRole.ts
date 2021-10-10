import { Message, Role } from 'discord.js';
import {
  GET_GUILD_CONFIG,
  REMOVE_MOD_ROLE,
  SET_MOD_ROLE,
} from '../../src/database/database';

export const modRole = {
  desc: 'Set the mod role, anyone with this role will be presumed as a mod and can use the mod commands.',
  name: 'mod',
  args: '<@role | id | remove>',
  alias: [''],
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
        `You need to send either a role mention, id or 'remove'.`
      );
    }

    if (args.length && args[0] === 'remove') {
      const config = await GET_GUILD_CONFIG(guild.id);
      if (!config?.modRole) {
        return message.reply(
          `The server doesn't have a mod role setup already!`
        );
      }

      REMOVE_MOD_ROLE(guild.id);

      return message.reply(`Successfully removed mod role.`);
    }

    const roleId = message.mentions.roles.first() || args.shift();

    if (!roleId) {
      return message.reply(`Did you not pass a role id or not mention a role?`);
    }

    let role: Role | undefined = undefined;

    if (typeof roleId === 'string') {
      role = guild.roles.cache.find(
        (r) => r.id === roleId || r.name.toLowerCase() === roleId
      );
    } else if (roleId instanceof Role) {
      role = roleId;
    }

    if (!role) {
      return message.reply(`Couldn't find a role with that name or ID`);
    }

    SET_MOD_ROLE(guild.id, role.id);

    return message.reply(`Successfully set mod role.`);
  },
};
