const profileModel = require('../../models/profileSchema');

module.exports = async (client, discord, member) => {
    var profile = await profileModel.create({
        userID: member.id,
        serverID: member.guild.id,
        makerName: "<UNREGISTERED>",
        points: 0
    });

    profile.save();
}