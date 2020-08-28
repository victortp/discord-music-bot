const { google } = require('googleapis');
const ytdl = require('ytdl-core');
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLEAPI_TOKEN,
});

const servers = {};

const searchYoutubeVideo = async (query) => {
  // Searches for an youtube video and returns first match
  try {
    const { data } = await youtube.search.list({
      part: 'snippet',
      maxResults: 1,
      q: query,
      type: 'video',
    });

    if (!data) {
      return {};
    }

    console.log(data.items[0]);

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

const joinChannel = async (client, message, server) => {
  try {
    const voiceChannel = message.member.voice.channel;
    if (voiceChannel.members.get(client.user.id)) {
      return;
    }

    if (!voiceChannel.joinable) {
      msg.channel.send(
        `I was not able to connect to the voice chanel! [<@${message.author.id}>]`
      );
    }

    const connection = await voiceChannel.join();
    connection.setSpeaking('SOUNDSHARE');
    server.connection = connection;
    console.log(`Joined channel ${voiceChannel.name}`);
  } catch (err) {
    console.log(`Error while joining channel: ${err}`);
    message.channel.send(
      `I was not able to connect to the voice chanel! [<@${message.author.id}>]`
    );
  }
};

const play = async (server, message) => {
  try {
    const { connection, queue } = server;
    const song = await connection.play(
      ytdl(queue[0].url, { filter: 'audioonly' })
    );

    song.on('start', () => {
      message.channel.send(
        `Playing ${queue[0].title}! [<@${message.author.id}>]`
      );

      server.connection = connection;
    });

    song.on('finish', () => {
      queue.shift();
      if (queue[0]) {
        return play(server, message);
      }
      message.member.voice.channel.leave();
    });
  } catch (err) {
    console.log(`Error while executing "play" function: ${err}`);
  }
};

const playSongCmd = async (client, message, args) => {
  try {
    // Creates the queue
    if (!servers[message.guild.id]) {
      servers[message.guild.id] = {
        queue: [],
      };
    }

    let server = servers[message.guild.id];

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

    if (!video) {
      message.channel.send(`Song not found! [<@${message.author.id}>]`);
      return;
    }

    // Adds song to server queue
    server.queue.push(video);

    // Joins user channel
    await joinChannel(client, message, server);

    console.log(server.queue);
    if (server.queue.length === 1) {
      await play(server, message);
    } else {
      message.channel.send(
        `Song ${video.title} added to the queue! [<@${message.author.id}>]`
      );
    }
  } catch (err) {
    console.log(`Error while executing play command: ${err}`);
  }
};

module.exports = { playSongCmd };
