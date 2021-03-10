module.exports = {
	name: 'outcast',
	description: 'Turn someone in an outcast.',
	async execute(message, args) {

        try {
            // get mentioned user id
            const member = await message.mentions.members.first();

            const exileChannelExists = message.guild.channels.cache.find(channel => channel.name === 'Exile');

            if (!exileChannelExists) {
                // create exile channel and move
                const exileChannel = await message.guild.channels.create('Exile', {
                    reason: 'For the forsaken ones',
                    type: 'voice',
                });
                exileChannel.setParent('813702340950884382');
                member.voice.setChannel(exileChannel.id, 'You are the outcast.');
            } else {
                member.voice.setChannel(exileChannelExists.id, 'You are the outcast.');
            }
        }
        catch(err) {
            console.error(err);
        }
	},
};