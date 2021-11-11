const levelModel = require('../models/levelSchema');

module.exports = {
    name: "add",
    description: "Add a level to wait for level approval",
    async execute(message, args, client, Discord, cmd, profileData, prefix) {
        if (profileData == null) {
            var embed = new Discord.MessageEmbed()
                .setTitle("Please register with `TTA register <Maker Name>` to add a level to the approval queue.")
                .setColor("#ff0000")
            return message.channel.send(embed);
        }
        if (profileData.makerName === "<UNREGISTERED>") {
            var embed = new Discord.MessageEmbed()
                .setTitle("Please register with `TTA register <Maker Name>` to add a level to the approval queue.")
                .setColor("#ff0000")
            return message.channel.send(embed);
        }

        if (profileData.points <= 12.5) {
            var embed = new Discord.MessageEmbed()
                .setTitle("You need at least 12.5 points to submit your first level.")
                .setColor("#ff0000")
            return message.channel.send(embed);
        }

        if (!args.length) return message.channel.send("Please provide a level id!\n`TTA add <lev-elc-ode>`");
        if (!(args[0].length == 11)) return message.channel.send("Please provide a __valid__ level id!\n`TTA <add lev-elc-ode>`");
        if (!args[1]) return message.channel.send("Please provide a level name!\n`TTA add lev-elc-ode <level name>`");

        var levelExists = await levelModel.findOne({ levelID: args[0] });
        if (levelExists) {
            return message.channel.send(`A level with the ID \`${args[0]}\` was already registered by ${levelExists.creator}!`);
        }

        // level name starts at message content index 19
        var name = message.content.slice(15 + prefix.length, message.content.length);
        while (name.charAt(0) === " ") name = name.substring(1);
        var level = await levelModel.create({
            levelID: args[0].toLowerCase(),
            levelName: name,
            creator: profileData.makerName
        });

        level.save();

        var embed = new Discord.MessageEmbed()
            .setColor("#4BB543")
            .setTitle("Level successfully registered!")
            .setDescription(`Your level ${message.content.slice(15 + prefix.length, message.content.length)} (${args[0]}) will soon be reviewed.`)
            .setFooter("#TTA", client.user.displayAvatarURL({ format: "png" }))

        message.channel.send(embed);

        if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) return;

        message.guild.channels.create(args[0], { type: 'text' })
            .then(channel => {
                let category = message.guild.channels.cache.find(c => c.name == "Pending-Discussion" && c.type == "category");

                if (!category) throw new Error("Category channel does not exist");
                channel.setParent(category.id);

                var embed = new Discord.MessageEmbed()
                    .setTitle(`${message.content.slice(15 + prefix.length, message.content.length)} (${args[0]}) by ${profileData.makerName}`)
                    .setFooter("Do NOT edit the channel name to keep the level process automated.");
                channel.send(embed);
            }).catch(console.error);
    }
}