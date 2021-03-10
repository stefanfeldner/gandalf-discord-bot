module.exports = {
	name: 'king',
	description: 'Declare your new King of Gondor!',
	execute(message, args) {
        message.channel.send(`Praise our king ${message.author.username}!`);
	},
};