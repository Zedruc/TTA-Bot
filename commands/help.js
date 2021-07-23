module.exports = {
    name: "help",
    description: "Shows a list of commands",
    async execute(message, args, client, Discord, cmd, profileData) {
        var embed = new Discord.MessageEmbed()
            .setTitle("TTA Bot Commands")
            .setColor("#8DD158");
        client.commands.forEach((command) => {
            embed.addField(command.name, command.description);
            if (command.name == "tag") embed.addField("remove-tag", "Remove a tag from a level");
        });
        message.channel.send(embed);
    }
}