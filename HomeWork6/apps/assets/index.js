const express = require("express");
const controllers = require("./controllers");
const router = express.Router();
router.get("/assets/:fname", controllers.getAssetFileController);
exports.router = router;