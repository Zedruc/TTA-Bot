const levelModel = require('../models/levelSchema');
const profileModel = require('../models/profileSchema');

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
        var _ = await levelModel.findOne({ levelID: args[0].toLowerCase() });
        var creator = await profileModel.findOne({ makerName: _.creator });

        creator.points -= _.difficulty;
        creator.save();

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