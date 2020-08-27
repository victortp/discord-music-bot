const { Client, Attachment } = require('discord.js');

require('dotenv').config();
const client = new Client();

client.on('ready', () => {
  console.log(`${client.user.tag} has logged in.`);
});

client.on('message', (message) => {
  console.log(message.content);
});

client.login(process.env.DISCORDJS_BOT_TOKEN);
