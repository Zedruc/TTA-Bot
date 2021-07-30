const { MessageCollector } = require('discord.js-collector');
const levelModel = require('../models/levelSchema');

module.exports = {
    name: "set-add",
    description: "Allows judges to add a level with provided data",
    async execute(message, args, client, Discord, cmd, profileData) {
        if (!(message.member.roles.cache.some(r => r.name === "Judge" || r.name === "Moderator" || r.name === "Administrator" || r.name === "OwOner"))) {
            var embed = new Discord.MessageEmbed()
                .setDescription("You have to be a staff member to set a user's points!")
                .setColor("#ff0000");
            return message.channel.send(embed);
        }

        var botMessage = await message.channel.send("What's the level ID?");
        var userMessage = await MessageCollector.asyncQuestion({
            botMessage,
            user: message.author.id
        });

        if (!(userMessage.content.length === 11)) {
            return message.channel.send("The level ID must consist of 11 symbols! LEV-ELC-ODE");
        }

        var data = {
            levelID: Number(),
            levelName: String(),
            creator: String()
        }

        data.levelID = userMessage.content;
        userMessage.delete();

        botMessage.edit("What's the level's name?");
        var userMessage = await MessageCollector.asyncQuestion({
            botMessage,
            user: message.author.id
        });
        data.levelName = userMessage.content;
        userMessage.delete();

        botMessage.edit("Who is the level's creator? (Ingame Name)");
        var userMessage = await MessageCollector.asyncQuestion({
            botMessage,
            user: message.author.id
        });
        data.creator = userMessage.content;
        userMessage.delete();

        var levelExists = await levelModel.findOne({ levelID: data.levelID });
        if (levelExists) {
            botMessage.delete();
            return message.channel.send(`A level with the ID \`${levelExists.levelID}\` was already registered by ${levelExists.creator}!`);
        }

        botMessage.edit("Setting everything up...");

        var level = await levelModel.create({
            levelID: data.levelID.toLowerCase(),
            levelName: data.levelName,
            creator: data.creator
        });

        level.save();

        var embed = new Discord.MessageEmbed()
            .setTitle("Succesfully added level")
            .addField("ID", data.levelID)
            .addField("Name", data.levelName)
            .addField("Creator", data.creator)
            .setColor("#4BB543");

        message.channel.send(embed);

        if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) return;

        message.guild.channels.create(data.levelID, { type: 'text' })
            .then(channel => {
                let category = message.guild.channels.cache.find(c => c.name == "Pending-Discussion" && c.type == "category");

                if (!category) throw new Error("Category channel does not exist");
                channel.setParent(category.id);

                var embed = new Discord.MessageEmbed()
                    .setTitle(`${data.levelName} (${data.levelID}) by ${data.creator}`)
                    .setFooter("Do NOT edit the channel name to keep the level process automated.");
                channel.send(embed);
            }).catch(console.error);
    }
}