require('dotenv').config();

const { Client, Attachment } = require('discord.js');
const { playSongCmd } = require('./utils');

const client = new Client();
const PREFIX = '!';
client.on('ready', () => {
  console.log(`${client.user.tag} has logged in.`);
});

// Watch for sent messages
client.on('message', (message) => {
  const { author, content } = message;
  console.log(`${author.tag} has sent: ${content}.`);

  // Ignores bot messages
  if (author.bot) return;

  if (content.startsWith(PREFIX)) {
    const [
      commandName,
      ...commandArgs
    ] = content.trim().toLowerCase().substring(PREFIX.length).split(/\s+/);

    switch (commandName) {
      case 'play':
        playSongCmd(client, message, commandArgs);
        break;

      default:
        message.channel.send(
          `Command "${commandName}" not found!  [<@${author.id}>]`
        );
        break;
    }
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);
