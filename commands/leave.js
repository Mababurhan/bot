const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave voice channel'),

  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection)
      return interaction.reply('❌ لە هیچ ژوورێک نییە');

    connection.destroy();
    interaction.reply('👋 دەرچوو');
  }
};
