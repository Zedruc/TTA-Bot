module.exports = async (Discord, client, message) => {
    const prefix = "TTA ";
    const profileModel = require('../../models/profileSchema');

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    var profileData;

    try {
        profileData = await profileModel.findOne({ userID: message.author.id });
        if (!profileData) {
            let profile = await profileModel.create({
                userID: message.author.id,
                serverID: message.guild.id,
                makerName: "<UNREGISTERED>",
                makerID: "<UNREGISTERED>",
                points: 0
            });

            profile.save();
        }
    } catch (error) {
        console.log(error);
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

    if (command) command.execute(message, args, client, Discord, cmd, profileData);
}