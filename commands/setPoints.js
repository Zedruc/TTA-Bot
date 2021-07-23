var profileSchema = require('../models/profileSchema');

module.exports = {
    name: "set",
    description: "Set a user's points",
    async execute(message, args, client, Discord, cmd, profileData) {
        if (!(message.member.roles.cache.some(r => r.name === "Judge" || r.name === "Moderator" || r.name === "Administrator" || r.name === "OwOner"))) {
            var embed = new Discord.MessageEmbed()
                .setDescription("You have to be a staff member to set a user's points!")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        if (!args.length > 1 || !args.length) {
            var embed = new Discord.MessageEmbed()
                .setDescription("You must provide two arguments!\n`TTA set <@User> <Amount of points>`")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        var User = message.mentions.users.first();
        var userID = User.id; // ID String
        var pointsToSet = args[1]; // Number

        if (User.bot) {
            var embed = new Discord.MessageEmbed()
                .setDescription("You can't set points for a bot.")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }
        if (isNaN(pointsToSet)) {
            var embed = new Discord.MessageEmbed()
                .setDescription("Please provide a valid amount of points to set.\nE.g. `TTA set <@User> 3`")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        // Check if user is in database
        var userInDatabase = await profileSchema.findOne({ userID: userID });
        if (!userInDatabase) {
            var embed = new Discord.MessageEmbed()
                .setDescription(`Unable to find ${User.username}#${User.discriminator} in the Team Time-Attack database.\nMake sure theyre registered!`)
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        userInDatabase.points = Number(pointsToSet);
        userInDatabase.save();

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
        var member = message.guild.members.cache.get(userInDatabase.userID);

        for (const role in Roles) {
            if (userInDatabase.points >= Roles[role].points) member.roles.add(Roles[role].role);
            if (member.roles.cache.find(r => r.name === Roles[role].name)) {
                if (userInDatabase.points < Roles[role].points) member.roles.remove(Roles[role].role);
            }
        }


        var embed = new Discord.MessageEmbed()
            .setDescription(`Successfully set ${userInDatabase.makerName}'s points to ${args[0]}`)
            .setColor("#4BB543")
            .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }));
        return message.channel.send(embed);
    }
}