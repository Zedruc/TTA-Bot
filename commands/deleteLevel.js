const levelModel = require('../models/levelSchema');
const profileModel = require('../models/profileSchema');

module.exports = {
    name: "delete",
    description: "Delete one of your levels from the Team Time-Attack database",
    async execute(message, args, client, Discord, cmd, profileData) {
        if (profileData == null) {
            var embed = new Discord.MessageEmbed()
                .setTitle("Please register with `TTA register <Maker Name>` to delete a level from approval queue.")
                .setColor("#ff0000")
            return message.channel.send(embed);
        }
        if (profileData.makerName === "<UNREGISTERED>") {
            var embed = new Discord.MessageEmbed()
                .setTitle("Please register with `TTA register <Maker Name>` to delete a level from approval queue.")
                .setColor("#ff0000")
            return message.channel.send(embed);
        }

        if (!args.length) return message.channel.send("Please provide a level id!\n`TTA delete lev-elc-ode`");
        if (!args[0].length == 11) return message.channel.send("Please provide a __valid__ level id!\n`TTA delete lev-elc-ode`");

        const level = await levelModel.findOne({ levelID: args[0].toLowerCase() });
        if (!level) {
            var embed = new Discord.MessageEmbed()
                .setTitle("Level not found.")
                .setColor("#ff0000")

            return message.channel.send(embed);
        }

        // TODO: Dont allow someone to delete another's level
        if (!(level.creator == profileData.makerName)) {
            var embed = new Discord.MessageEmbed()
                .setTitle(`${level.levelName} by ${level.creator} is not your level!`)
                .setColor("#ff0000")

            return message.channel.send(embed);
        }

        var embed = new Discord.MessageEmbed()
            .setColor("#4BB543")
            .setTitle("Level successfully deleted!")
            .setDescription(`Your level ${level.levelName} (${level.levelID}) was deleted.`)
            .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }))

        profileModel.find({}, (err, users) => {
            if (err) throw err;

            // =============================================================================
            // Remove the level from every users cleared level list and decrement the points
            // =============================================================================

            users.forEach(user => {
                if (user.clearedLevels.includes(level.levelID)) {
                    user.points -= level.difficulty;
                    var index = user.clearedLevels.indexOf(level.levelID);
                    if (index > -1) {
                        user.clearedLevels.splice(index, 1);
                    }
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
            const levelChannel = message.guild.channels.cache.find(channel => channel.name === level.levelID);
            levelChannel.delete();
        } catch (error) {
            console.log('');
        }

        message.channel.send(embed);

    }
}