const { Router } = require("express");
const user = require("./user");
const message = require("./message");
const admin = require("./admin");

const router = Router();

router.use("/user", user);
router.use("/message", message);
router.use("/admin", admin);

module.exports = router;