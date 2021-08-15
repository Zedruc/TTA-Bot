var profileModel = require('../models/profileSchema');
var levelModel = require('../models/levelSchema');

module.exports = {
    name: "dislike",
    aliases: ["boo"],
    description: "Dislike a level",
    async execute(message, args, client, Discord, cmd, profileData, prefix) {
        const levelID = args[0];
        const userID = message.author.id;

        var user = await profileModel.findOne({ userID: userID });
        if (!user) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`Could not find your profile in the Team Time-Attack database.\nMake sure you are registered!`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        var level = levelModel.findOne({ levelID: levelID });
        if (!level) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`Could not find the level you tried to dislike. Check the spelling of the level code.`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }
        if (level.creator == user.makerName) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`You cant dislike your own level!`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        level.dislikes = level.dislikes + 1;
    }
}