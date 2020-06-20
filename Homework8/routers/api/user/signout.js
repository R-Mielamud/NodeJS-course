const { Router } = require("express");

const router = Router();

router.post("/", (req, res) => {
    req.session.user = null;
    req.session.save();
    
    res.json({
        success: true
    });
});

module.exports = router;