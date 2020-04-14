const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        author: { type: String },
        time: { type: String },
        text: { type: String }
    },
    {
        collection: "message"
    }
);

module.exports = mongoose.model("Message", schema);