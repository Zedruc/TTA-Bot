var profileModel = require('../models/profileSchema');
var levelModel = require('../models/levelSchema');

module.exports = {
    name: "addvideo",
    description: "Add your clear video to a level",
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

        var level = await levelModel.findOne({ levelID: levelID });
        if (!level) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`Could not find the level you tried to add a clear-video to. Check the spelling of the level code.`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        const ex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
        var regex = new RegExp(ex);

        if (!args[1].match(regex)) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`Please provide a valid URL. \`https://*\``)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        if (level.clearVideos.includes(args[1])) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`This video has already been submitted.`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        level.clearVideos.push(args[1]);
        level.save();

        var embed = new Discord.MessageEmbed()
            .setTitle(`Succesfully submitted clear-video for "${level.levelName}" by ${level.creator}`)
            .addField('Videos', ` \`\`\`${level.clearVideos.join("\n")}\`\`\` `)
            .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }))
            .setColor("#8DD158")

        message.channel.send(embed);
    }
}