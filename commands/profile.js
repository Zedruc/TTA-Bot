const levelModel = require('../models/levelSchema');
const profileModel = require('../models/profileSchema');

module.exports = {
    name: "profile",
    description: "Shows profile of user",
    async execute(message, args, client, Discord, cmd, profileData, prefix) {
        if (profileData == null) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`You have to be registered to use this command!\n\`TTA register <Maker Name>\``)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }
        var User = client.users.cache.find(user => user.id === profileData.userID);


        var ping = message.mentions.users.first();
        if (ping) {
            User = client.users.cache.find(user => user.id === ping.id);
        }

        if (!ping) {
            if (args[0]) {
                var name = message.content.slice(8 + prefix.length, message.content.length);

                var userInDB = await profileModel.findOne({ makerName: name });
                if (!userInDB) {
                    var embed = new Discord.MessageEmbed()
                        .setDescription(`Unable to find ${name} in the Team Time-Attack database.\nMake sure theyre registered!`)
                        .setColor("#ff0000");
                    return message.channel.send(embed);
                }

                var LevelsMadeByThisUser = await levelModel.find({ creator: name });

                var embed = new Discord.MessageEmbed()
                    .setTitle(`${name}`)
                    .addField('Points', userInDB.points)
                    .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }))
                    .setColor("#8DD158")
                if (userInDB.makerName) embed.addField("Maker Name", userInDB.makerName);
                if (LevelsMadeByThisUser.length) {
                    embed.addField("Levels made by this user", "============");
                    for (const level of LevelsMadeByThisUser) {
                        embed.addField(
                            `${level.levelName}`, (level.approved == "true") ? `Code: ${level.levelID}\nApproved with a difficulty of ${level.difficulty}` : `Code: ${level.levelID}`, true);
                    }
                }
                return message.channel.send(embed);

            }
        }

        profileData = await profileModel.findOne({ userID: User.id });

        if (!profileData) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`Unable to find ${User.username}#${User.discriminator} in the Team Time-Attack database.\nMake sure theyre registered!`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        var LevelsMadeByThisUser = await levelModel.find({ creator: profileData.makerName });

        var embed = new Discord.MessageEmbed()
            .setTitle(`${User.username}`)
            .addField('Points', profileData.points)
            .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }))
            .setColor("#8DD158")
        if (profileData.makerName) embed.addField("Maker Name", profileData.makerName);
        var totalLikes = 0;
        var totalDislikes = 0;

        for (const level of LevelsMadeByThisUser) {
            totalLikes += level.likes;
            totalDislikes += level.dislikes;
        }

        embed.addField("Total likes", totalLikes);
        embed.addField("Total dislikes", totalDislikes);

        if (LevelsMadeByThisUser.length) {
            embed.addField("Levels made by this user", "============");
            for (const level of LevelsMadeByThisUser) {
                embed.addField(
                    `${level.levelName}`, (level.approved == "true") ? `Code: ${level.levelID}\nApproved with a difficulty of ${level.difficulty}` : `Code: ${level.levelID}`, true);
            }
        }
        message.channel.send(embed);
    }
}