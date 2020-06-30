const { Router } = require("express");
const passport = require("passport");

const router = Router();

router.post(
    "/",
    passport.authenticate("local"),
    (req, res) => {
        return res.json({
            success: req.user ? true : false
        });
    }
);

module.exports = router;