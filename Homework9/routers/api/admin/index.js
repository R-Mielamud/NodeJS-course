const { Router } = require("express");
const User = require("../models/user.model");
const Message = require("../models/message.model");
const { valid } = require("../validators/valid");
const { adminLockUserValidSchema, adminDelMessageValidSchema, adminNewRoleValidSchema } = require("../validators/fieldsValid");
const { userRequired, adminRequired } = require("./middleware");

const router = Router();

router.use(userRequired, adminRequired);

router.get("/users", async (req, res) => {
    const users = await User.find().lean().exec();
    return res.json(users);
});

router.put("/lock", valid(adminLockUserValidSchema()), async (req, res) => {
    const user = req.user;

    if (user) {
        user.locked = true;
        await user.save();

        return res.json({
            success: true
        });
    }
});

router.delete("/del_one_message", valid(adminDelMessageValidSchema()), async (req, res) => {
    const message = Message.findOne({ author: req.body.author });

    if (message) {
        await message.update({ deletedAt: new Date() });
    }

    return res.json({ success: true });
});

router.delete("/del_all_messages", valid(adminDelMessageValidSchema()), async (req, res) => {
    const messages = await Message.find({ author: req.body.author });

    for (const m of messages) {
        await m.update({ deletedAt: new Date() });
    }

    return res.json({
        success: true
    });
});

router.put("/new_role", valid(adminNewRoleValidSchema()), async (req, res) => {
    const user = User.findOne({ email: req.body.email }).lean().exec();

    if (user) {
        user.role = req.body.newRole;
        await user.save();

        return res.json({
            success: true
        });
    }
});

module.exports = router;