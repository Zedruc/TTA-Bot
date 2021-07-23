const Discord = require('discord.js');
const client = new Discord.Client();
const mongoose = require('mongoose');

require('dotenv').config();

/* const { Timer } = require('easytimer.js');
var timerInstance = new Timer(); */

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
});

mongoose.connect(process.env.MONGODB_SRV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log("Connected to Database");
}).catch((err) => {
    console.log(err);
});

client.login(process.env.token);
// TTA DB

/**
 * module.exports = {
    name: "play",
    aliases: ['alias1', 'alias2],
    description: "Desc",
    async execute(message, args, client, Discord, cmd) {

    the cmd parameters always is either the alias or the root name
 */