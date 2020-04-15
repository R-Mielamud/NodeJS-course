const express = require("express");
const controllers = require("./controllers");
const validators = require("./validators");
const router = express.Router();
router.get("/messages/all", validators.getAllMessagesValidator, controllers.getAllMessagesController);
router.post("/message/add", controllers.addMessageController);
exports.router = router;