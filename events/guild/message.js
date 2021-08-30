module.exports = async (Discord, client, message) => {
    const prefix = "TTA ";
    const alt_prefix = "!";
    const profileModel = require('../../models/profileSchema');

    if (message.author.bot) return;
    // if (!(message.author.id === '568729687291985930')) {
    // return message.reply('Sorry! Currently only Nofu can use the bot since theres a bug causing clears not being saved.');
    // }

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
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).split(/ +/);
        const cmd = args.shift().toLowerCase();

        const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

        if (command) command.execute(message, args, client, Discord, cmd, profileData, prefix);
    } else if (message.content.startsWith(alt_prefix)) {
        const args = message.content.slice(alt_prefix.length).split(/ +/);
        const cmd = args.shift().toLowerCase();

        const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

        if (command) command.execute(message, args, client, Discord, cmd, profileData, alt_prefix);
    } else return;
}