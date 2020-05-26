const { Router } = require("express");

const router = Router();

router.post("/", (req, res) => {
    req.logOut();
    
    res.json({
        success: true
    });
});

module.exports = router;