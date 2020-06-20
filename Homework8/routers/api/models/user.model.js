const { Schema, model } = require("mongoose");
const { hashSync } = require("bcryptjs");

const user = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        lowercase: true,
        index: true,
    },
    password: {
        type: String,
        trim: true,
        required: true
    }
}, {
    collection: "users",
    timestamps: true
});

user.pre("save", function (next) {
    if (this.isNew && this.isModified("password")) {
        this.password = hashSync(this.password);
    }

    next();
});

module.exports = model("User", user);