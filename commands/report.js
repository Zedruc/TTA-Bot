module.exports = {
    name: "report",
    description: "Report a bug",
    async execute(message, args, client, Discord, cmd, profileData, prefix) {
        const report = message.content.slice(6 + prefix.length, message.content.length);

        if (report == "") {
            return message.reply("please provide a message describing the bug.");
        }

        client.users.cache.get('568729687291985930').send(report);
    }
}