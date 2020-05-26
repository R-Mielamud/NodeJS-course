const { Router } = require("express");
const User = require("../models/user.model");
const Message = require("../models/message.model");
const { valid } = require("../validators/valid");
const { adminLockUserValidSchema, adminDelMessageValidSchema, adminNewRoleValidSchema } = require("../validators/fieldsValid");

const router = Router();

router.get("/users", async (req, res) => {
    if (req.user && req.user.role === "admin") {
        const users = await User.find().lean().exec();
        return res.json(users);
    }

    return res.redirect("/");
});

router.put("/lock", valid(adminLockUserValidSchema()), async (req, res) => {
    if (req.user && req.user.role === "admin") {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            user.locked = true;
            await user.save();

            return res.json({
                success: true
            });
        }
    }

    return res.redirect("/");
});

router.delete("/del_one_message", valid(adminDelMessageValidSchema()), async (req, res) => {
    if (req.user && req.user.role === "admin") {
        const message = Message.findOne({ author: req.body.author });

        if (message) {
            await message.update({ deletedAt: new Date() });
        }

        return res.json({ success: true });
    }

    return res.redirect("/");
});

router.delete("/del_all_messages", valid(adminDelMessageValidSchema()), async (req, res) => {
    if (req.user && req.user.role === "admin") {
        const messages = await Message.find({ author: req.body.author });

        for (const m of messages) {
            await m.update({ deletedAt: new Date() });
        }

        return res.json({
            success: true
        });
    }

    return res.redirect("/");
});

router.put("/new_role", valid(adminNewRoleValidSchema()), async (req, res) => {
    if (req.user && req.user.role === "admin") {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            user.role = req.body.newRole;
            await user.save();

            return res.json({
                success: true
            });
        }
    }

    return res.redirect("/");
});

module.exports = router;