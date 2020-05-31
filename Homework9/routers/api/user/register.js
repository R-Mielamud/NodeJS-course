const { Router } = require("express");
const User = require("../models/user.model");
const { valid } = require("../validators/valid");
const { userValidSchema } = require("../validators/fieldsValid");

const router = Router();

router.post("/", valid(userValidSchema()), async (req, res, next) => {
    try {
        const user = new User(req.body);
        const result = await user.save();
        res.json({ _id: result._id });
    } catch (e) {
        next(e);
    }
});

module.exports = router;