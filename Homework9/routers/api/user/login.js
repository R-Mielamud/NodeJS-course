const { Router } = require("express");
const passport = require("passport");

const router = Router();

router.post(
    "/",
    passport.authenticate("local"),
    (req, res) => {
        if (req.user.locked) {
            req.logOut();

            return res.json({
                success: false
            });
        }

        return res.json({
            success: true
        });
    }
);

module.exports = router;