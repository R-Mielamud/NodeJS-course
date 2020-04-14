const express = require("express");
const controllers = require("./controllers");
const router = express.Router();
router.get("/messages/all", controllers.getAllMessagesController);
router.post("/message/add", controllers.addMessageController)
exports.router = router;