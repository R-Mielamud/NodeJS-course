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

    await Message.populate(messages, [
        {
            path: "author",
            select: "firstName lastName"
        }
    ]);

    res.json(messages);
});

router.post("/", userRequired, valid(messageValidSchema()), async (req, res) => {
    const doc = await Message.create(req.body);

    await Message.populate(doc, [
        {
            path: "author",
            select: "firstName lastName"
        }
    ]);

    res.json(doc);
});

router.put("/", userRequired, valid(messageUpdValidSchema()), async (req, res) => {
    const message = await Message.findOne(req.body.findBy);

    if (req.user._id.equals(message.author._id)) {
        if (message && -(message.createdAt - new Date()) < 1000 * 60 * 5) {
            await Message.updateOne(message, req.body);

            await Message.populate(message, [
                {
                    path: "author",
                    select: "firstName lastName"
                }
            ]);

            await message.save();
        }

        return res.json(message);
    }

    res.status(403).json({ message: "Not author of message", status: 403, error: true });
});

router.delete("/", userRequired, valid(messageDelValidSchema()), async (req, res) => {
    const message = Message.findOne(req.body.findBy);
    
    if (req.user._id.equals(message.author._id)) {
        if (message) {
            await message.update({ deletedAt: new Date() });

            await Message.populate(message, [
                {
                    path: "author",
                    select: "firstName lastName"
                }
            ]);
        }

        return res.json(message);
    }

    res.status(403).json({ message: "Not author of message", status: 403, error: true });
});

module.exports = router;