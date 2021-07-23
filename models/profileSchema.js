const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userID: {
        type: String, require: true, unique: true
    },
    serverID: {
        type: String, require: true
    },
    points: {
        type: Number, default: 0
    },
    makerName: {
        type: String, default: "<UNREGISTERED>"
    },
    clearedLevels: {
        type: Array, default: []
    }
});

const model = mongoose.model('ProfileModels', profileSchema);

module.exports = model;