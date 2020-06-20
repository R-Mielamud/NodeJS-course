const { Schema, model } = require("mongoose");

const message = new Schema({
    author: {
        type: String,
        trim: true,
        required: true
    },
    text: {
        type: String,
        trim: true,
        required: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    collection: "messages",
    timestamps: true
});

module.exports = model("Message", message);