const levelModel = require('../models/levelSchema');

module.exports = {
    name: "force-delete",
    description: "Delete a level",
    async execute(message, args, client, Discord, cmd, profileData, prefix) {
        if (!(message.member.roles.cache.some(r => r.name === "Judge" || r.name === "Moderator" || r.name === "Administrator" || r.name === "OwOner"))) {
            var embed = new Discord.MessageEmbed()
                .setDescription("You have to be a staff member to delete a user's level!")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        const levelID = args[0].toLowerCase();
        if (!levelID) {
            var embed = new Discord.MessageEmbed()
                .setDescription("Please provide the ID of the level you want to delete.")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        var reason = message.content.slice(25 + prefix.length, message.content.length);

        const level = await levelModel.findOne({ levelID: levelID });

        if (!level) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`Could not find the level you tried to submit. Check the spelling of the level code.`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        if (reason == "") {
            reason = "No further information given.";
        }

        var embed = new Discord.MessageEmbed()
            .setTitle(`Deleted "${level.levelName}" (\`${level.levelID}\`) by ${level.creator}`)
            .setDescription(`Reason:\n${reason}`)
            .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }));

        levelModel.deleteOne({ levelID: args[0].toLowerCase() }, (err) => {
            if (err) {
                var embed = new Discord.MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle("Failed to delete level.")
                    .setDescription(`If this keeps happening please contact Nofu#4100`)
                    .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }))

                return message.channel.send(embed);
            }
        });

        try {
            const levelChannel = message.guild.channels.cache.find(
                channel => channel.name === level.levelID
                    || channel.name === `✅${level.levelID}`
                    || channel.name === `✅📗${level.levelID}`
                    || channel.name === `📗${level.levelID}`
            );
            levelChannel.delete();
        } catch (error) {
            console.log(error.message);
        }

        message.channel.send(embed);
    }
}