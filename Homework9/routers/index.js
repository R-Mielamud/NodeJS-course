const { Router } = require("express");
const client = require("./client");
const api = require("./api");

const router = Router();

router.use(client);
router.use("/api", api);

module.exports = router;