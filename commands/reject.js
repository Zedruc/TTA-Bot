var levelModel = require('../models/levelSchema');
var profileModel = require('../models/profileSchema');

module.exports = {
    name: "reject",
    description: "Reject a level",
    async execute(message, args, client, Discord, cmd, profileData) {
        if (!(message.member.roles.cache.some(r => r.name === "Judge"))) {
            var embed = new Discord.MessageEmbed()
                .setDescription("You need the \"Judge\" role to approve levels!")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        message.channel.fetch().then(async LevelChannel => {
            if (LevelChannel.name.startsWith('✅')) return message.channel.send(`This level is already approved.`);
            if (!(LevelChannel.name.length == 11)) {
                if (!(LevelChannel.name.startsWith('📗'))) {
                    return message.channel.send("This command can only be used in Level channel.");
                }
            }

            var levelID = LevelChannel.name;
            var LevelInDatabase = await levelModel.findOne({ levelID: LevelChannel.name });

            if (LevelChannel.name.startsWith('📗')) {
                levelID = LevelChannel.name.replace(/^📗+/i, '');
                LevelInDatabase = await levelModel.findOne({ levelID: levelID });
            }

            if (!LevelInDatabase) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("This level doesnt exist in the Team Time-Attack database anymore.")
                    .setColor("#ff0000");
                message.channel.send(embed);

                return;
            }

            var desc = message.content.slice("TTA reject ".length, message.content.length);

            levelModel.deleteOne({ levelID: levelID }, (err) => {
                if (err) {
                    var embed = new Discord.MessageEmbed()
                        .setColor("#ff0000")
                        .setTitle("Failed to delete level.")
                        .setDescription(`If this keeps happening please contact Nofu#4100`)
                        .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }))

                    return message.channel.send(embed);
                }

                profileModel.find({}, (err, users) => {
                    if (err) throw err;
                    users.forEach(user => {
                        if (user.clearedLevels.includes(LevelInDatabase.levelID)) {
                            user.points -= LevelInDatabase.difficulty;
                            var index = user.clearedLevels.indexOf(LevelInDatabase.levelID);
                            if (index > -1) {
                                user.clearedLevels.splice(index, 1);
                            }
                            user.save();
                        }
                    });
                });
            });

            notifyUser(message, args, client, Discord, cmd, profileData, LevelInDatabase, desc);
            LevelChannel.setName(`❌${LevelChannel.name}`);

            var embed = new Discord.MessageEmbed()
                .setTitle("Level was rejected")
                .setDescription(desc)
                .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }));
        });
    }
}

async function notifyUser(message, args, client, Discord, cmd, profileData, LevelInDatabase, desc) {
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
        .setTitle(`Your level "${LevelInDatabase.levelName}" was rejected. For further information please read following:`)
        .setDescription(desc)
        .setColor("#4BB543")
        .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }));

    feedbackChannel.send(embed);
}