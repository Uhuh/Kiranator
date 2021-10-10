import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import commandHandler from '../commands/commandHandler';
import msg from '../events/message';
import {
  MemberUpdated,
  MessageDelete,
  MessageEdit,
  UserJoinRoles,
} from '../events/serverLogs';
import {
  ALL_GUILD_PREFIXES,
  GENERATE_GUILD_CONFIG,
  GET_BANNED_WORDS,
  GET_CASES_PASSED_PUNISHMENTDATE,
  GET_GUILD_CONFIG,
  GET_USER_WARNS,
  NEW_CASE,
  REMOVE_JOIN_ROLE,
  REMOVE_TEMPBAN,
  UNMUTE_USER,
} from './database/database';
dotenv.config();
import * as config from './vars';
import { CaseType } from './database/cases';

interface Command {
  desc: string;
  name: string;
  args: string;
  alias: string[];
  type: 'general' | 'mod' | 'config';
  run: Function;
}

// Discord embed sidebar colors.
enum COLOR {
  DEFAULT = 15158332,
  RED = 16711684,
  YELLOW = 15844367,
  GREEN = 3066993,
}

export default class KiraBot extends Discord.Client {
  config: any;
  commands: Discord.Collection<string, Command>;
  bannedWords: Discord.Collection<string, string[]>;
  guildPrefix: Discord.Collection<string, string>;
  constructor() {
    super({
      intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
      ],
    });
    this.config = config;
    this.commands = new Discord.Collection();
    this.bannedWords = new Discord.Collection();
    this.guildPrefix = new Discord.Collection();
    commandHandler(this);
    this.once('ready', () => {
      console.info(`[Started]: ${new Date()}\n`);
      console.info('KiraBot reporting for duty!');

      setInterval(() => this.randomPres(), 10000);
      setInterval(() => this.checkTimedPunishments(), 60000); // 1 minute // 600000 = 10minutes
    });

    //CMD Handling
    this.on('messageCreate', (message) => {
      if (message.author?.bot) return;
      msg(this, message as Discord.Message);
      // Verify user message into the server.
      if (
        message.channel?.type !== 'DM' &&
        !message.member?.permissions.has('MANAGE_MESSAGES')
      ) {
        this.filterWords(message as Discord.Message);
      }

      return;
    });
    this.on('messageDelete', (message) => {
      try {
        if (message.author?.bot || message.channel?.type === 'DM') return;
        MessageDelete(message);
      } catch {
        console.error(`Error on message delete!`);
      }
    });
    this.on('messageUpdate', (oldMsg, newMsg) => {
      try {
        if (oldMsg.author?.bot || oldMsg.channel?.type === 'DM') return;
        MessageEdit(oldMsg, newMsg);
        if (
          newMsg.channel?.type !== 'DM' &&
          !newMsg.author?.bot &&
          !newMsg.member?.permissions.has('MANAGE_MESSAGES')
        ) {
          this.filterWords(newMsg as Discord.Message);
        }
      } catch {
        console.error(`Error on message update!`);
      }
    });
    this.on('guildMemberAdd', (member) => {
      UserJoinRoles(member);
      MemberUpdated(member, 'join');
    });
    this.on('guildMemberRemove', (member) => MemberUpdated(member, 'left'));
    this.on('guildCreate', (guild) => {
      GENERATE_GUILD_CONFIG(guild.id);
    });
    this.on('roleDelete', (role) => {
      REMOVE_JOIN_ROLE(role.guild.id, role.id);
    });
  }

  randomPres = () => {
    const user = this.user;
    if (!user) return console.log('Client dead?');

    user.setPresence({
      activities: [
        {
          name: '@KiraBot help',
          type: 'WATCHING',
        },
      ],
      status: 'online',
    });
  };

  filterWords = async (message: Discord.Message) => {
    const { guild } = message;

    if (!guild) return;
    /**
     * Loop through all the users words, check if they're in the banned list
     */
    const content = message.content;
    const words = this.bannedWords.get(guild.id);

    if (!words) return;
    for (const word of words) {
      const reg = new RegExp('\\b' + word + '\\b', 'g');
      const match = reg.exec(content);
      /**
       * Only get users warnings IF they match a banned word so that the bot doesn't query for each users warns
       * for every single message.
       */
      if (match) {
        let userWarnings = await GET_USER_WARNS(guild.id, message.author.id);
        const config = await GET_GUILD_CONFIG(guild.id);
        if (!config) return;

        if (!userWarnings) userWarnings = [];

        const WEEK_OLD = moment()
          .subtract(config.warnLifeSpan, 'days')
          .startOf('day');
        let activeWarns = 0;

        for (const warn of userWarnings) {
          if (moment(warn.creationDate).isBefore(WEEK_OLD)) continue;
          activeWarns++;
        }

        const id = match[0];

        activeWarns++;
        if (activeWarns > config.maxWarns!) {
          message.channel.send(
            `Banned ${message.author.username} for getting more than ${config.maxWarns} strikes.`
          );
          message
            .delete()
            .catch(() => console.error(`Issues deleting the message!`));

          await message.member
            ?.send(
              config.banMessage || `You've been banned from ${guild.name}.`
            )
            .catch(() =>
              console.error(
                'Issue sending ban appeal message to user. Oh well?'
              )
            );
          message.member
            ?.ban()
            .catch(() => message.channel.send(`Issues banning user.`));
          this.logIssue(
            guild.id,
            CaseType.Ban,
            `Strike! You're out! (Banned word: ||${id}||)`,
            this.user!,
            message.author
          );
          return;
        } else {
          message.reply(
            `warning. You gained a warn. You have ${activeWarns}/${config.maxWarns} warns.`
          );

          this.logIssue(
            guild.id,
            CaseType.Warn,
            `Warned for saying a banned word. ||${id}||`,
            this.user!,
            message.author
          );
          message.author
            .send(
              `You have been warned!\n**Reason:** Warned for saying a banned word. ${id}`
            )
            .catch(() =>
              console.error(`Can't DM user, probably has friends on.`)
            );
          message
            .delete()
            .catch(() => console.error(`Issues deleting the message!`));
        }
      }
    }
  };

  logIssue = async (
    guildId: string,
    type: CaseType,
    reason: string,
    mod: Discord.User,
    user: Discord.User | string
  ) => {
    const config = await GET_GUILD_CONFIG(guildId);

    if (!config) {
      return console.error(
        `Failed to find guild[${guildId}] config while logging issue.`
      );
    } else if (!config.modLog) {
      return console.info(`No mod`);
    }

    const embed = new Discord.MessageEmbed();
    const channel = this.guilds.cache
      .get(guildId)
      ?.channels.cache.get(config.modLog);

    let color = COLOR.DEFAULT;
    switch (type) {
      case CaseType.Ban:
        color = COLOR.RED;
        break;
      case CaseType.Mute:
        color = COLOR.YELLOW;
        break;
      case CaseType.Kick:
        break;
      default:
        // The rest are undo's.
        color = COLOR.GREEN;
        break;
    }

    embed
      .setTitle(`${CaseType[type]} | Case #${config.nextCaseId}`)
      .addField(
        `**User**`,
        `${typeof user === 'string' ? user : user?.tag} (<@${
          typeof user === 'string' ? user : user.id
        }>)`,
        true
      )
      .addField(`**Moderator**`, mod?.tag === '' ? 'Unknown' : mod.tag, true)
      .addField(
        `**Reason**`,
        reason === ''
          ? `Mod please do \`${config.prefix}reason ${config.nextCaseId} <reason>\``
          : reason
      )
      .setColor(color)
      .setTimestamp(new Date());

    try {
      if (channel && channel instanceof Discord.TextChannel) {
        channel.send({ embeds: [embed] }).then((m) => {
          NEW_CASE(
            guildId,
            mod.id,
            typeof user === 'string' ? user : user.id,
            m.id,
            type,
            reason
          );
        });
      }
    } catch {
      console.error(`Issue when trying to write log case`);
    }
  };

  loadBannedWords = async () => {
    for (const [id] of this.guilds.cache) {
      this.bannedWords.set(id, await GET_BANNED_WORDS(id));
    }
  };

  loadGuildPrefixes = async () => {
    const guilds = await ALL_GUILD_PREFIXES();
    for (const g of guilds) {
      this.guildPrefix.set(g.guildId, g.prefix || 'v.');
    }
  };

  checkTimedPunishments = async () => {
    Promise.all([this.checkMutes(), this.checkTempBans()]);
  };

  checkTempBans = async () => {
    for (const [id] of this.guilds.cache) {
      const bans = await GET_CASES_PASSED_PUNISHMENTDATE(id, CaseType.TempBan);
      for (const b of bans) {
        this.logIssue(
          id,
          CaseType.TempBan,
          'Unbanning as their punishment date has been met.',
          this.user!,
          b.userId
        );
        REMOVE_TEMPBAN(id, b.userId);
      }
    }
  };

  /**
   * Check every guild muted members and remove mute roles from them.
   * Probably only check this every 10 minutes.
   */
  checkMutes = async () => {
    for (const [id, guild] of this.guilds.cache) {
      const config = await GET_GUILD_CONFIG(id);
      // If the server mute role is not configured, ignore.
      // Not sure how they muted without it.
      if (!config?.muteRole) continue;
      const mutes = await GET_CASES_PASSED_PUNISHMENTDATE(id, CaseType.Mute);
      for (const m of mutes) {
        try {
          await guild.members.fetch(m.userId);
          const member = guild.members.cache.get(m.userId);
          if (member) {
            member.roles.remove(config.muteRole).catch();
            this.logIssue(
              id,
              CaseType.UnMute,
              'Times up.',
              this.user!,
              member.user
            );
          }
          UNMUTE_USER(id, m.userId);
        } catch {
          /**
           * If the member left the server execute this instead.
           */
          this.logIssue(id, CaseType.UnMute, 'Times up.', this.user!, m.userId);
          UNMUTE_USER(id, m.userId);
        }
      }
    }
  };

  start = async () => {
    await mongoose.connect(`mongodb://localhost/${config.DATABASE_TYPE}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    mongoose.set('useFindAndModify', false);
    await this.login(this.config.TOKEN);
    await this.loadGuildPrefixes();
    await this.loadBannedWords();
  };
}
