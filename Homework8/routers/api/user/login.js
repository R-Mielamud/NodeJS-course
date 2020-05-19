const { Router } = require("express");
const User = require("../models/user.model");
const { compareSync } = require("bcryptjs");

const router = Router();

router.post("/", async (req, res, next) => {
    const user = await User.findOne({
        email: req.body.email
    }).lean().exec();

    if (!user || !compareSync(req.body.password, user.password)) {
        next({
            status: 404,
            message: "User not found"
        });
    }

    req.session.user = {
        email: null,
        display: null
    };

    req.session.user.email = user.email;
    req.session.user.display = user.firstName + " " + user.lastName;
    req.session.save();

    res.json({
        success: true
    });
});

module.exports = router;