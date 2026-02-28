const { 
  SlashCommandBuilder,
  EmbedBuilder 
} = require('discord.js');

const { 
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource
} = require('@discordjs/voice');

const play = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('YouTube URL')
        .setRequired(true)
    ),

  async execute(ctx, args) {

    // 🎯 اگر Slash بوو
    const url = ctx.options
      ? ctx.options.getString('url')
      : args[0];

    if (!url)
      return ctx.reply
        ? ctx.reply('🎶 لینک بنێرە')
        : ctx.channel.send('🎶 لینک بنێرە');

    const voiceChannel = ctx.member.voice.channel;

    if (!voiceChannel) {
      return ctx.reply
        ? ctx.reply({ content: '🎤 پێویستە بچیتە ژووری دەنگی', ephemeral: true })
        : ctx.channel.send('🎤 پێویستە بچیتە ژووری دەنگی');
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: ctx.guild.id,
      adapterCreator: ctx.guild.voiceAdapterCreator
    });

    const stream = await play.stream(url);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    const player = createAudioPlayer();

    connection.subscribe(player);
    player.play(resource);

    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle('🎶 Playing Music')
      .setDescription(url);

    if (ctx.reply) {
      await ctx.reply({ embeds: [embed] });
    } else {
      await ctx.channel.send({ embeds: [embed] });
    }
  }
};
