import { Message } from 'discord.js';
import KiraBot from '../src/bot';
import { CLIENT_ID } from '../src/vars';

const msg = (client: KiraBot, message: Message) => {
  // Ignore bots
  if (message.author.bot) return;

  // If the guild doesn't exist it's a DM from a user. Default to v. as the prefix.
  const prefix = client.guildPrefix.get(message.guild?.id || '') || 'v.';
  const prefixUsed = message.content.startsWith(prefix);
  const clientMention = message.mentions.members?.first()?.id;

  if (CLIENT_ID === clientMention || prefixUsed) {
    // If prefix is used get its length, otherwise they mentioned and there SHOULD be a space after the mention.
    const length = prefixUsed
      ? prefix.length
      : message.content.split(' ')[0].length;

    const [command, ...args] =
      message.content.substring(length).match(/\S+/g) || [];

    if (!command) return;
    //If the command isn't in the big ol' list.
    let clientCommand = client.commands.get(command.toLowerCase());
    // Possible alias was used instead
    if (!clientCommand) {
      clientCommand = client.commands.find((f) =>
        f.alias.includes(command.toLowerCase())
      );
    }
    if (!clientCommand) return;

    try {
      // Find the command and run it.
      clientCommand.run(message, args, client);
    } catch (e) {
      message.reply(
        'something went wrong! Please contact <@289151449412141076> with the command you tried running.'
      );
      console.error(e);
    }
  }
};

export default msg;
