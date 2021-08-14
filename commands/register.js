const profileModel = require('../models/profileSchema');
const levelModel = require('../models/levelSchema');

module.exports = {
    name: "register",
    description: "Register with maker name and maker id",
    async execute(message, args, client, Discord, cmd, profileData, prefix) {
        if (profileData == null) {
            profileData = await profileModel.findOne({ userID: message.author.id });
        }
        const name = message.content.slice(9 + prefix.length, message.content.length);
        if (name === "<UNREGISTERED>") {
            return message.channel.send("You cant name yourself <UNREGISTERED>.");
        }
        if (name === profileData.makerName) return message.channel.send(`You're already registered as ${name}!`);

        var NameIsAlreadyRegistered = await profileModel.findOne({ makerName: name });
        if (NameIsAlreadyRegistered) return message.channel.send(`The name ${name} is already registered by <@${NameIsAlreadyRegistered.userID}>!`);

        levelModel.find({ creator: profileData.makerName }, (err, levels) => {
            if (err) throw err;

            levels.forEach((level) => {
                level.creator = name;
                level.save();
            });
        });

        profileData.makerName = name;
        profileData.save();

        var embed = new Discord.MessageEmbed()
            .setTitle("Successfully registered!")
            .setDescription(`${name}`);
        message.channel.send(embed);
    }
}