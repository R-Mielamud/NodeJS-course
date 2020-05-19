const { Router } = require("express");
const Message = require("../models/message.model");
const { valid } = require("../validators/valid");
const { paramsValid } = require("../validators/paramsValid");
const { messageValidSchema, messageUpdValidSchema, messageDelValidSchema } = require("../validators/fieldsValid");

const router = Router();

router.get("/", paramsValid, async (req, res) => {
    let messages = await Message.find().lean();
    const sortValues = req.query.sortValue === "asc" ? [1, -1] : [-1, 1]
    messages = messages.filter(message => !message.deletedAt);
    messages = messages.slice(req.query.skip, req.query.limit);
    messages = messages.sort((a, b) => a[req.query.sort] < b[req.query.sort] ? sortValues[0] : sortValues[1]);
    res.json(messages);
});

router.post("/", valid(messageValidSchema()), async (req, res) => {
    if (req.session.user) {
        const message = new Message(req.body);
        const result = await message.save();
        res.json({ _id: result._id });
    }

    res.status(401).json({ succes: false });
});

router.put("/", valid(messageUpdValidSchema()), async (req, res) => {
    const message = await Message.findOne(req.body.findBy);

    if (req.session.user && req.session.user.display === message.author) {
        if (message && -(message.createdAt - new Date()) < 1000 * 60 * 5) {
            await message.update(req.body.newData);
        }

        res.json({ success: true });
    }

    res.status(!req.session.user ? 401 : 403).json({ success: false });
});

router.delete("/", valid(messageDelValidSchema()), async (req, res) => {
    const message = Message.findOne(req.body.findBy);
    
    if (req.session.user.display === message.author) {
        if (message) {
            await message.update({ deletedAt: new Date() });
        }

        res.json({ success: true });
    }
});

module.exports = router;