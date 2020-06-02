const { Router } = require("express");
const User = require("../api/models/user.model");

const router = Router();

router.get("/", async (req, res) => {
    if (req.user) {
        const user = req.user;

        if (!user) {
            req.user = null;
        }
    }

    res.render("index.html", {
        user: req.user || null
    });
});

router.get("/register", (req, res) => {
    res.render("register.html");
});

router.get("/login", (req, res) => {
    res.render("login.html");
});

module.exports = router;