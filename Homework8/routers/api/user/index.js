const { Router } = require("express");
const login = require("./login");
const register = require("./register");
const signout = require("./signout");

const router = Router();

router.use("/register", register);
router.use("/login", login);
router.use("/signout", signout);

module.exports = router;