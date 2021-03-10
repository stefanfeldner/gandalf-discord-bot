const txtomp3 = require('text-to-mp3');
const fs = require('fs');
const path = require('path');

var options = {
	tl: 'de',
};

module.exports = {
	name: 'tell',
	description: 'Convert text to MP3!',
	cooldown: 2,
	async execute(message, args) {
		let textToConvert = args.join(' ');
		const audioFileName = args.join('').substring(0, 10);
		const rootPath = path.dirname(require.main.filename);

		try { 
			txtomp3.getMp3(textToConvert, options).then(binaryStream => {

				if (!fs.existsSync(`${rootPath}/audio`)) {
					fs.mkdir(`${rootPath}/audio`, { recursive: true }, (err) => {
						if (err) throw err;
					});
				}
				if (!fs.existsSync(`${rootPath}/audio/${audioFileName}.mp3`)) {
					const file = fs.createWriteStream(`${rootPath}/audio/${audioFileName}.mp3`);
					file.write(binaryStream);
					file.end();
					// message.channel.send(`${message.author}, MP3 was created.`);
				} else {
					message.channel.send(`${message.author}, this MP3 already exists, try creating another file or using the existing.`);
				}
			});
		}
		catch(err) {
			console.log('Error: ', err);
		}

		if (message.member.voice.channel) {
			try {
				const connection = await message.member.voice.channel.join();
				const dispatcher = connection.play(`${rootPath}/audio/${audioFileName}.mp3`);
				dispatcher.on('error', console.error);

				dispatcher.on('finish', () => {
					dispatcher.destroy();
					connection.disconnect();
					fs.unlink(`${rootPath}/audio/${audioFileName}.mp3`, err => {
						if (err) throw err;
					});
				});
			} catch (err) {
				console.log(err);
			}
		}
	},
};