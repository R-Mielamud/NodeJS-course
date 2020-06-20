const { Router } = require("express");
const User = require("../api/models/user.model");

const router = Router();

router.get("/", async (req, res) => {
    if (req.session.user) {
        const user = await User.findOne({ email: req.session.user.email });

        if (!user) {
            req.session.user = null;
        }
    }

    res.render("index.html", {
        user: req.session.user || null
    });
});

router.get("/register", (req, res) => {
    res.render("register.html");
});

router.get("/login", (req, res) => {
    res.render("login.html");
});

module.exports = router;