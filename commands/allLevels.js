const levelModel = require('../models/levelSchema');
const FILTERS = ['tag', 'creator', 'difficulty', 'approved'];

module.exports = {
    name: "list",
    description: "Show a list of all specified levels",
    async execute(message, args, client, Discord, cmd, profileData, prefix) {
        if (args.length == 0) {
            createList({});
        }
        if (args[0]) {
            if (!(FILTERS.includes(args[0]))) {
                var embed = new Discord.MessageEmbed()
                    .setDescription(`${args[0]} isn't a valid filter.\nFilters: \`${FILTERS.join(', ')}\``)
                    .setColor("#ff0000");
                return message.channel.send(embed);
            }

            const filterArg = message.content.slice(prefix.length + 6 + args[0].length, message.content.length);

            switch (args[0]) {
                case 'tag':
                    createList({ 'tags': filterArg });
                    break;
                case 'creator':
                    createList({ 'creator': filterArg });
                    break;
                case 'difficulty':
                    createList({ 'difficulty': Number(filterArg) });
                    break;
                case 'approved':
                    createList({ 'approved': filterArg });
                default:
                    break;
            }
        }

        function createList(filter) {
            levelModel.find(filter, (err, docs) => {
                if (err) {
                    console.error(err);
                    var embed = new Discord.MessageEmbed()
                        .setDescription("You have to be a staff member to delete a user's level!")
                        .setColor("#ff0000");
                    return message.channel.send(embed);
                }

                if (docs.length < 1) {
                    var embed = new Discord.MessageEmbed()
                        .setDescription("No levels matching your filter found.")
                        .setColor("#ff0000");
                    return message.channel.send(embed);
                }

                var selfText = "";
                var thisLevelsVideos = "";
                var embed = new Discord.MessageEmbed()
                    .setColor("#4BB543");
                docs.forEach((level) => {
                    if (selfText.length > 3300) {
                        embed.setDescription(selfText);
                        message.channel.send(embed);
                        selfText = "";
                    }
                    if (level.clearVideos.length) {
                        level.clearVideos.forEach(videoLink = thisLevelsVideos += `${videoLink}\n`);
                    }
                    selfText += `**"${level.levelName}"** by **${level.creator}**\nApproved: ${level.approved} (${level.difficulty})\nID: ${level.levelID}\nLikes/Dislikes: ${level.likes}/${level.dislikes}\nClear videos: ${(thisLevelsVideos.length > 0) ? thisLevelsVideos : "None"}\n======================\n\n`;
                });
                embed.setDescription(selfText);
                message.channel.send(embed);
            });
        }
    }
}