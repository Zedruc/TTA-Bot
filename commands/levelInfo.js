var levelModel = require('../models/levelSchema');

module.exports = {
    name: "info",
    description: "Get details about a level",
    async execute(message, args, client, Discord, cmd, profileData, prefix) {
        if (args.length === 0) {
            var embed = new Discord.MessageEmbed()
                .setDescription("You have to provide a level name or an ID!\n\`TTA info <Level Name | Level ID>\`")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        var query = message.content.slice(5 + prefix.length, message.content.length);
        var level = await levelModel.findOne({ levelID: query.toLowerCase() }); // try to find level by id

        if (!level) {
            level = await levelModel.findOne({ levelName: query }); // try to find level by name

            if (!level) {
                var embed = new Discord.MessageEmbed()
                    .setDescription(`Could not find a level matching your search :(`)
                    .setColor("#ff0000");
                message.channel.send(embed);

                const similiarID = require('../util/findSimiliarID');
                var levels = await levelModel.find({});
                var IDs = [];
                levels.forEach((level) => IDs.push(level.levelID));
                var similiarIDs = similiarID(IDs);

                if (similiarIDs.length > 0) {
                    level = await levelModel.findOne({ levelID: similiarIDs[0][1] });

                    return message.reply(`Did you mean:\`\`\`${level.levelID} - "${level.levelName}" by ${level.creator}\`\`\``);
                } else return;
            }

            var embed = new Discord.MessageEmbed()
                .setTitle(`${level.levelName} by ${level.creator}`)
                .addField("Level Code", `\`${level.levelID}\``)
                .setColor("#4BB543")
                .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }));

            (level.approved == "true")
                ? embed.addField("Status", "Approved").addField("Difficulty", `${level.difficulty}`)
                : embed.addField("Status", "Pending");

            embed.addField("Likes", level.likes);

            embed.addField("Dislikes", level.dislikes);

            if (level.tags.length > 0) {
                embed.addField("Tags", "============");
                for (const tag of level.tags) {
                    embed.addField(tag, "\u200B", true);
                }
            } else {
                embed.addField("Tags", "None");
            }
            return message.channel.send(embed);
        }

        var embed = new Discord.MessageEmbed()
            .setTitle(`${level.levelName} by ${level.creator}`)
            .addField("Level Code", `\`${level.levelID}\``)
            .setColor("#4BB543")
            .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }));

        (level.approved == "true")
            ? embed.addField("Status", "Approved").addField("Difficulty", `${level.difficulty}`)
            : embed.addField("Status", "Pending");

        embed.addField("Likes", level.likes);

        embed.addField("Dislikes", level.dislikes);

        if (level.tags.length > 0) {
            embed.addField("Tags", "============");
            for (const tag of level.tags) {
                embed.addField(tag, "\u200B", true);
            }
        } else {
            embed.addField("Tags", "None");
        }
        return message.channel.send(embed);
    }
}