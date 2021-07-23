const levelModel = require('../models/levelSchema');
const profileModel = require('../models/profileSchema');

module.exports = {
    name: "rerate",
    description: "Rerate a level",
    async execute(message, args, client, Discord, cmd, profileData) {
        message.channel.fetch().then(async channel => {
            const levelIdIndex = channel.name.search(/\d/);
            const levelID = channel.name.slice(levelIdIndex, channel.name.length);

            if (!(message.member.roles.cache.some(r => r.name === "Judge"))) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("You need the \"Judge\" role to approve levels!")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }

            var level = await levelModel.findOne({ levelID: levelID });
            if (!(levelID.length == 11)) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("This command can only be used in a Level channel.")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (!args[0]) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("Please provide a difficulty rating to rerate the level with.\nE.g. `TTA rerate 3`")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (!level) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("This level doesnt exist in the Team Time-Attack database anymore.")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (!(level.approved === "true")) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("This level wasnt approved yet.")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (isNaN(args[0])) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("Please provide a valid difficulty rating to rerate the level with.\nE.g. `TTA rerate 3`")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if ((Number(args[0]) == level.difficulty)) {
                var embed = new Discord.MessageEmbed()
                    .setDescription(`Level is already rated ${args[0]}`)
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }

            var oldDiff = level.difficulty;
            level.difficulty = Number(args[0]);
            level.save();

            profileModel.find({}, (err, users) => {
                if (err) throw err;

                users.forEach(user => {
                    if (user.clearedLevels.includes(level.levelID)) {
                        user.points -= oldDiff;
                        user.points += Number(args[0]) + 1;
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
                });
            });

            var embed = new Discord.MessageEmbed()
                .setDescription(`Successfully rerated "${level.levelName}" from __${oldDiff}__ to __${args[0]}__!`)
                .setColor("#4BB543");
            message.channel.send(embed);

            return notifyUser(message, args, client, Discord, cmd, profileData, level, oldDiff, args[0]);
        });
    }
}

async function notifyUser(message, args, client, Discord, cmd, profileData, level, oldDiff, newDiff) {
    var feedbackChannel = message.guild.channels.cache.find(c => c.name == "level-feedback" && c.type == "text");
    if (!feedbackChannel) {
        return message.reply("Could not find the \"#feedback-channel\", could not notify the level creator.");
    }

    var user = await profileModel.findOne({ makerName: level.creator });
    if (!user) {
        return message.reply("Could not find the creator of the level, unable to notify the level creator.");
    }

    feedbackChannel.send(`<@${user.userID}>`);
    var embed = new Discord.MessageEmbed()
        .setTitle(`Your level "${level.levelName}" was rerated from ${oldDiff} to ${newDiff}`)
        .setColor("#4BB543")
        .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }));

    feedbackChannel.send(embed);
}