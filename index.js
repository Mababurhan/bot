require('dotenv').config();
const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent 
  ]
});
const PREFIX = "!";
client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args); // بۆ prefix
  } catch (error) {
    console.error(error);
    message.reply('❌ هەڵەیەک ڕوویدا');
  }
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.async execute(ctx, args);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ هەڵەیەک ڕوویدا', ephemeral: true });
  }
});

client.login(process.env.TOKEN);
