const express = require("express");
const controllers = require("./controllers");
const router = express.Router();
router.get("/", controllers.indexController);
exports.router = router;