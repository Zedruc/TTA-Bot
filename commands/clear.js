var profileModel = require('../models/profileSchema');
var levelModel = require('../models/levelSchema');

module.exports = {
    name: "clear",
    description: "Clear a level",
    async execute(message, args, client, Discord, cmd, profileData) {
        // TTA clear level-id
        // Zeig vllt ähnliche level codes wenn der angegebene nd gefunden wird

        var IdOfClearedLevel = args[0].toLowerCase();
        var user = await profileModel.findOne({ userID: message.author.id });
        if (!user) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`Could not find your profile in the Team Time-Attack database.\nMake sure you are registered!`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }
        if (user.clearedLevels.includes(IdOfClearedLevel)) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`You already submitted this clear!`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        var level = await levelModel.findOne({ levelID: IdOfClearedLevel });
        if (!level) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`Could not find the level you tried to submit. Check the spelling of the level code.`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }
        if (level.creator == user.makerName) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`You cant clear your own level!`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        user.clearedLevels.push(IdOfClearedLevel);
        user.save();

        if (args[args.length - 1].toLowerCase() === "like" || "heart") {
            level.likes = level.likes + 1;
            level.save();
        } else if (args[args.length - 1].toLowerCase() === "dislike" || "boo") {
            level.dislikes = level.dislikes + 1;
            level.save();
        }

        if (level.approved == "true") {
            user = await profileModel.findOne({ userID: message.author.id });
            user.points += level.difficulty;
            user.save();

            var Roles = {
                OfficialMember_Role: {
                    role: message.guild.roles.cache.find(r => r.name === "Official Member"),
                    points: 12.5,
                    name: "Official Member"
                },
                AdvancedMember_Role: {
                    role: message.guild.roles.cache.find(r => r.name === "Advanced Member"),
                    points: 25,
                    name: "Advanced Member"
                },
                ExpertMember_Role: {
                    role: message.guild.roles.cache.find(r => r.name === "Expert Member"),
                    points: 50,
                    name: "Expert Member"
                },
                TTA_Master_Role: {
                    role: message.guild.roles.cache.find(r => r.name === "TTA-Master"),
                    points: 100,
                    name: "TTA-Master"
                },
                TTA_Grandmaster_Role: {
                    role: message.guild.roles.cache.find(r => r.name === "TTA-Grandmaster"),
                    points: 200,
                    name: "TTA-Grandmaster"
                },
                TTA_Legend_Role: {
                    role: message.guild.roles.cache.find(r => r.name === "TTA-Legend"),
                    points: 500,
                    name: "TTA-Legend"
                },
            }
            var member = message.guild.members.cache.get(user.userID);

            for (const role in Roles) {
                if (user.points >= Roles[role].points) member.roles.add(Roles[role].role);
                if (member.roles.cache.find(r => r.name === Roles[role].name)) {
                    if (user.points < Roles[role].points) member.roles.remove(Roles[role].role);
                }
            }
        }

        var embed = new Discord.MessageEmbed()
            .setDescription(`Successfully submitted the clear of "${level.levelName}" by ${level.creator}`)
            .setColor("#4BB543");
        return message.channel.send(embed);
    }
}