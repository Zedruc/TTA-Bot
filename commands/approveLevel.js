const levelModel = require('../models/levelSchema');
const profileModel = require('../models/profileSchema');

module.exports = {
    name: "approve",
    description: "Approve a level",
    async execute(message, args, client, Discord, cmd, profileData) {
        if (!(message.member.roles.cache.some(r => r.name === "Judge"))) {
            var embed = new Discord.MessageEmbed()
                .setDescription("You need the \"Judge\" role to approve levels!")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        if (!args[0]) {
            var embed = new Discord.MessageEmbed()
                .setDescription("Please provide a difficulty rating to approve the level with.\nE.g. `TTA approve 3`")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        if (isNaN(args[0])) {
            var embed = new Discord.MessageEmbed()
                .setDescription("Please provide a valid difficulty rating to approve the level with.\nE.g. `TTA approve 3`")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        if (Number(args[0]) > 12) {
            var embed = new Discord.MessageEmbed()
                .setDescription("Please provide a valid difficulty rating. The maximum difficulty is 12.")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }


        message.channel.fetch().then(async LevelChannel => {
            if (LevelChannel.name.startsWith('✅')) return message.channel.send(`This level is already approved.`);
            if (!(LevelChannel.name.length == 11)) {
                if (!(LevelChannel.name.startsWith('📗'))) {
                    return message.channel.send("This command can only be used in Level channels with a 11 symbol name (`lev-elc-ode`)");
                }
            }
            var LevelInDatabase = await levelModel.findOne({ levelID: LevelChannel.name });

            if (LevelChannel.name.startsWith('📗')) {
                LevelInDatabase = await levelModel.findOne({ levelID: LevelChannel.name.replace(/^📗+/i, '') });
            }

            if (!LevelInDatabase) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("This level doesnt exist in the Team Time-Attack database anymore.")
                    .setColor("#ff0000");
                message.channel.send(embed);

                return;
            }

            if (LevelInDatabase.approved === "true") return message.channel.send(`This level is already approved with a difficulty rating of ${LevelInDatabase.difficulty}`);

            if (Number(args[0]) < 6) {
                // average: (x+y) / 2
                if (LevelInDatabase.approved === "half") {
                    var oldDiff = LevelInDatabase.difficulty;
                    var newDiff = Math.round((oldDiff + Number(args[0])) / 2);
                    const remainder = newDiff % 1;
                    const int = Math.floor(newDiff);

                    if (remainder > .25) {
                        newDiff = int + .5;
                    } else if (remainder > .5) {
                        newDiff = int + 1;
                    } else if (remainder < .25) {
                        newDiff = int;
                    }

                    LevelInDatabase.difficulty = newDiff;
                    LevelInDatabase.approved = "true";
                    LevelInDatabase.save();

                    message.channel.setName(`✅${LevelChannel.name}`);

                    var embed = new Discord.MessageEmbed()
                        .setDescription(`Level Successfully approved with difficulty rating __${newDiff}__!`)
                        .setColor("#4BB543")
                        .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }));
                    notifyUser(message, args, client, Discord, cmd, profileData, LevelInDatabase);
                    return message.channel.send(embed);
                }

                LevelInDatabase.approved = "half";
                LevelInDatabase.difficulty = Number(args[0]);
                LevelInDatabase.save();

                var embed = new Discord.MessageEmbed()
                    .setDescription(`Waiting for a second vote!`)
                    .setColor("#ffa500")
                    .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }));
                message.channel.send(embed);
                return message.channel.setName(`📗${LevelChannel.name}`);
            }

            LevelInDatabase.approved = "true";
            LevelInDatabase.difficulty = Number(args[0]);
            LevelInDatabase.save();

            profileModel.find({}, (err, users) => {
                if (err) throw err;

                users.forEach(user => {
                    if (user.clearedLevels.includes(LevelChannel.name)) {
                        user.points += LevelInDatabase.difficulty;
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
                .setDescription(`Level Successfully approved with difficulty rating __${args[0]}__!`)
                .setColor("#4BB543")
                .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }));
            message.channel.send(embed);
            notifyUser(message, args, client, Discord, cmd, profileData, LevelInDatabase);

            message.channel.setName(`✅${LevelChannel.name} `);
        });
    }
}

async function notifyUser(message, args, client, Discord, cmd, profileData, LevelInDatabase) {
    var feedbackChannel = message.guild.channels.cache.find(c => c.name == "level-feedback" && c.type == "text");
    if (!feedbackChannel) {
        return message.reply("Could not find the \"#feedback-channel\", could not notify the level creator.");
    }

    var user = await profileModel.findOne({ makerName: LevelInDatabase.creator });
    if (!user) {
        return message.reply("Could not find the creator of the level, unable to notify the level creator.");
    }

    feedbackChannel.send(`<@${user.userID}>`);
    var embed = new Discord.MessageEmbed()
        .setTitle(`Your level "${LevelInDatabase.levelName}" was approved and rated with a difficulty of ${LevelInDatabase.difficulty}`)
        .setColor("#4BB543")
        .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }));

    feedbackChannel.send(embed);
}