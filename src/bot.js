require('dotenv').config();

const { Client, Attachment } = require('discord.js');
const { google } = require('googleapis');
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLEAPI_TOKEN,
});

const client = new Client();
const PREFIX = '!';

client.on('ready', () => {
  console.log(`${client.user.tag} has logged in.`);
});

const searchYoutubeVideo = async (query) => {
  // Searches for an youtube video and returns first match
  try {
    const { data } = await youtube.search.list({
      part: 'snippet',
      maxResults: 1,
      q: query,
      type: 'video',
    });

    const video = {
      title: data.items[0].snippet.title,
      url: `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`,
      thumbnail: data.items[0].snippet.thumbnails.default.url,
    };

    return video;
  } catch (err) {
    console.log(`Error finding YouTube video: ${err}`);
  }
};

const playSongCmd = async (message, args) => {
  // Checks if user is connected to a voice channel
  if (!message.member.voice.channel) {
    message.channel.send(
      `You must be connected to a voice channel before you can use this command! [<@${message.author.id}>]`
    );
    return;
  }

  // Checks if the song name or youtube video was provided
  if (!args[0]) {
    message.channel.send(
      `You must provide either a song name or a YouTube link!  [<@${message.author.id}>]`
    );
    return;
  }

  const video = await searchYoutubeVideo(args);
  if (video) {
    message.channel.send(`Playing ${video.title}! [<@${message.author.id}>]`);
  }
};

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
        playSongCmd(message, commandArgs);
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
