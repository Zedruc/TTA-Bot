var levelModel = require('../models/levelSchema');
var profileModel = require('../models/profileSchema');

module.exports = {
    name: "tag",
    aliases: ['remove-tag'],
    description: "Add a tag to a level",
    async execute(message, args, client, Discord, cmd, profileData) {
        // Argumente: level id, tag name


        if (cmd === "tag") {
            if (profileData == null) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("You have to register to add tags to a level.\n`TTA register <Maker Name>")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (!args[0]) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("You must provide two arguments.\n`TTA tag <Level ID> <Tag>")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (!args[0].length === 11) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("The length of the level ID has to be exactly 11 symbols (lev-elc-ode)")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (!args[1]) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("You must provide two arguments.\n`TTA tag <Level ID> <Tag>")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }

            if (args[1].length > 5) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("A tag cant exceed the length of 5 symbols.")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }

            var level = await levelModel.findOne({ levelID: args[0] });
            if (!level) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("A level with the given ID does not exist in the database.")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }

            if (!(level.creator == profileData.makerName)) {
                var embed = new Discord.MessageEmbed()
                    .setDescription(`The level ${level.levelName} does not belong to you!`)
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }

            if (level.tags.length > 2) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("A level can maximally have 3 tags!")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }

            if (level.tags.includes(args[1])) {
                var embed = new Discord.MessageEmbed()
                    .setDescription(`"${level.levelName}" already has the tag "\`${args[1]}\`"!`)
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }

            level.tags.push(args[1]);
            level.save();

            var embed = new Discord.MessageEmbed()
                .setDescription(`Successfully added the tag \`${args[1]}\` to your level "${level.levelName}"`)
                .setColor("#4BB543");
            return message.channel.send(embed);

        } else if (cmd === "remove-tag") {

            if (profileData == null) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("You have to register to add tags to a level.\n`TTA register <Maker Name>")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (!args[0]) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("You must provide two arguments.\n`TTA tag <Level ID> <Tag>`")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (!args[0].length === 11) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("The length of the level ID has to be exactly 11 symbols (lev-elc-ode)")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (!args[1]) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("You must provide two arguments.\n`TTA tag <Level ID> <Tag>`")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }

            if (args[1].length > 5) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("A tag cant exceed the length of 5 symbols.")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }

            var level = await levelModel.findOne({ levelID: args[0] });
            if (!level) {
                var embed = new Discord.MessageEmbed()
                    .setDescription("A level with the given ID does not exist in the database.")
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (!(level.creator == profileData.makerName)) {
                var embed = new Discord.MessageEmbed()
                    .setDescription(`The level ${level.levelName} does not belong to you!`)
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (level.tags.length === 0) {
                var embed = new Discord.MessageEmbed()
                    .setDescription(`"${level.levelName}" doesnt have any tags!`)
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }
            if (!level.tags.includes(args[1])) {
                var embed = new Discord.MessageEmbed()
                    .setDescription(`"${level.levelName}" doesnt have the tag "${args[1]}"`)
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }

            var index = level.tags.indexOf(args[1]);
            level.tags.splice(index, 1);
            level.save();

            var embed = new Discord.MessageEmbed()
                .setDescription(`Successfully removed the tag "\`${args[1]}\`" from your level "${level.levelName}"`)
                .setColor("#4BB543");
            return message.channel.send(embed);
        }
    }
}