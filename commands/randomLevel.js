var levelModel = require('../models/levelSchema');

module.exports = {
    name: "random",
    description: "Recommends a random level",
    async execute(message, args, client, Discord, cmd, profileData) {
        if (!args[0]) {
            var embed = new Discord.MessageEmbed()
                .setDescription("Please provide a valid difficulty to choose from.\n`TTA random <1-12>`\nNOTE: `TTA random 0` will recommend you a random __pending__ level")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }
        if (isNaN(args[0])) {
            var embed = new Discord.MessageEmbed()
                .setDescription("Please provide a valid difficulty to choose from.\n`TTA random <1-12>`\nNOTE: `TTA random 0` will recommend you a random __pending__ level")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        var levels = await levelModel.find({ difficulty: Number(args[0]) });
        if (!levels.length) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`No levels with difficulty ${args[0]} found :(`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        var randomLevel = levels[Math.floor(Math.random() * levels.length)];

        var embed = new Discord.MessageEmbed()
            .setDescription(`"${randomLevel.levelName}" (${randomLevel.levelID.toUpperCase()}) by ${randomLevel.creator}`)
            .addField("Difficulty", (randomLevel.difficulty > 0) ? randomLevel.difficulty : `${randomLevel.difficulty} (Pending)`)
            .setColor("#4BB543");
        return message.channel.send(embed);
    }
}