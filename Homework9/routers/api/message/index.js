const { Router } = require("express");
const Message = require("../models/message.model");
const { valid } = require("../validators/valid");
const { paramsValidSchema } = require("../validators/paramsValid");
const { messageValidSchema, messageUpdValidSchema, messageDelValidSchema } = require("../validators/fieldsValid");
const { userRequired } = require("../admin/middleware");

const router = Router();

router.get("/", valid(paramsValidSchema()), async (req, res) => {
    const messages = await Message
        .find({ deletedAt: null })
        .sort({ [req.query.sort]: req.query.sortValue })
        .skip(req.query.skip)
        .limit(req.query.limit)
        .lean()
        .exec();

    res.json(messages);
});

router.post("/", userRequired, valid(messageValidSchema()), async (req, res) => {
    const message = new Message(req.body);
    const result = await message.save();
    res.json({ _id: result._id });
});

router.put("/", userRequired, valid(messageUpdValidSchema()), async (req, res) => {
    const message = await Message.findOne(req.body.findBy);

    if ((req.user.firstName + " " + req.user.lastName) === message.author) {
        if (message && -(message.createdAt - new Date()) < 1000 * 60 * 5) {
            await message.update(req.body.newData);
        }

        res.json({ success: true });
    }

    res.status(403).json({ message: "Not author of message", status: 403, error: true });
});

router.delete("/", userRequired, valid(messageDelValidSchema()), async (req, res) => {
    const message = Message.findOne(req.body.findBy);
    
    if ((req.user.firstName + " " + req.user.lastName) === message.author) {
        if (message) {
            await message.update({ deletedAt: new Date() });
        }

        res.json({ success: true });
    }

    res.status(403).json({ message: "Not author of message", status: 403, error: true });
});

module.exports = router;