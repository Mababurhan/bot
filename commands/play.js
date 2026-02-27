
const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');

const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus 
} = require('@discordjs/voice');

const play = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music from YouTube')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('YouTube URL')
        .setRequired(true)
    ),

  async execute(interaction) {
    const url = interaction.options.getString('url');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel)
      return interaction.reply({ content: '🎤 پێویستە بچیتە ژووری دەنگی', ephemeral: true });

    const info = await play.video_info(url);
    const title = info.video_details.title;
    const thumbnail = info.video_details.thumbnails[0].url;

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    const stream = await play.stream(url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    const player = createAudioPlayer();
    connection.subscribe(player);
    player.play(resource);

    // 🎨 Embed
    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle('🎶 Now Playing')
      .setDescription(`**${title}**`)
      .setThumbnail(thumbnail)
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    // 🎛️ Buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('pause')
        .setLabel('Pause')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('resume')
        .setLabel('Resume')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('stop')
        .setLabel('Stop')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [row] });

    const collector = interaction.channel.createMessageComponentCollector({
      time: 600000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id)
        return i.reply({ content: '❌ تۆ نیت', ephemeral: true });

      if (i.customId === 'pause') {
        player.pause();
        await i.reply({ content: '⏸️ Paused', ephemeral: true });
      }

      if (i.customId === 'resume') {
        player.unpause();
        await i.reply({ content: '▶️ Resumed', ephemeral: true });
      }

      if (i.customId === 'stop') {
        player.stop();
        connection.destroy();
        await i.reply({ content: '⏹️ Stopped & Left', ephemeral: true });
      }
    });

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });
  }
};
