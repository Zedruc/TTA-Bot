const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    levelID: {
        type: String, require: true
    },
    levelName: {
        type: String, require: true
    },
    creator: {
        type: String, require: true
    },
    approved: {
        type: String, default: "false"
    },
    difficulty: {
        type: Number, default: 0
    },
    tags: {
        type: Array, default: []
    },
    likes: {
        type: Number, default: 0
    },
    dislikes: {
        type: Number, default: 0
    }
});

const model = mongoose.model('LevelModels', levelSchema);

module.exports = model;