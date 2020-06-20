const { Router } = require("express");
const user = require("./user");
const message = require("./message");

const router = Router();

router.use("/user", user);
router.use("/message", message);

module.exports = router;