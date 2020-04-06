const express = require("express");
const qs = require("querystring");

const router = express.Router();

let messages = [];

router.post("/messages/add", (req, res) => {
    const content = req.body;

    messages.push({
        id: (messages.length === 0 ? 1 : (+messages[messages.length - 1].id + 1)),
        author: content.author,
        text: content.text,
        timestamp: (new Date()).toUTCString()
    });

    res.end("<script>window.location.href = '/';</script>");
});

router.get("/messages/all", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(messages));
});

router.get("/message/:id", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(messages.find(m => m.id === +req.params.id)));
});

router.delete("/message/:id/delete", (req, res) => {
    const index = messages.indexOf(messages.find(m => m.id === +req.params.id));
    messages.splice(index, 1);
    res.end("<script>window.location.href = '/';</script>");
});

router.put("/message/:id/edit", (req, res) => {
    const content = req.body;

    const index = messages.indexOf(messages.find(m => m.id === +req.params.id));

    messages[index].text = content.text || messages[index].text;
    messages[index].author = content.author || messages[index].author;
    messages[index].timestamp = (new Date()).toUTCString();

    res.end("<script>window.location.href = '/';</script>");
});

exports.messages = messages;
exports.router = router;