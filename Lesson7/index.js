const express = require("express");
const nunjucks = require("nunjucks");
const mongoose = require("mongoose");
const controllers = require("./controllers");

mongoose.connect("mongodb://localhost:27017/messages", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on("error", err => {
    console.log("Mongo error: " + err.name + ": " + err.message);
    process.exit(1);
});

mongoose.set("debug", true);

const server = express();

server.use(express.json());

server.use(express.urlencoded({ extended: true }));

nunjucks.configure({
    autoescape: true,
    watch: true,
    express: server
});

server.get("/", controllers.indexController);

server.get("/messages/all", controllers.getAllMessagesController);

server.post("/message/add", controllers.addMessageController);

server.put("/message/upd", controllers.updateMessageController);

server.delete("/message/del", controllers.deleteMessageController);

server.listen(3000, "", () => {
    console.log("Web server started on http://127.0.0.1:3000");
});