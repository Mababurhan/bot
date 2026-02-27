const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the music'),

  async execute(interaction) {
    interaction.reply('⏹️ بۆت وەستایە (بۆ ڕاستەوخۆ leave بەکاربهێنە)');
  }
};
