// including environment variables
const dotenv = require('dotenv');
dotenv.config();

const botToken = process.env.BOT_TOKEN;

// include config file
const { prefix } = require('./config.json');

// node file system module
const fs = require('fs');

// setup discord
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

// setting up cooldowns
const cooldowns = new Discord.Collection();

// include all commands in this file
client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

client.once('ready', async () => {
	console.log('Wanna see some magic?');
});

// react to messages
client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

	// check if command exists, else return
	if (!client.commands.has(commandName)) return;

	const command = client.commands.get(commandName);

	if (command.args && !args.length) {
		return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}
	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.on('voiceStateUpdate', async (oldState) => {
	const leftChannel = oldState.channel;

	if (leftChannel.name === 'Exile' && leftChannel) {
		leftChannel.delete()
		.then(console.log('Exile deleted'));
	}
});

client.login(botToken);