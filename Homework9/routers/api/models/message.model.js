const { Schema, model } = require("mongoose");

const message = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
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