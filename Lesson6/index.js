const express = require("express");
const { router, messages } = require("./messages");

const server = new express();

server.use((req, res, next) => {
    const { url, method } = req;
    console.log(`${(new Date()).toUTCString()}: [${method}] ${url}`);
    next();
});

server.use(express.json());
server.use(express.urlencoded({ extended: true }))

server.get("/", async (req, res) => {
    res.setHeader("Content-Type", "text/html");

    for (const m of messages) {
        res.write(`
            <p>${m.timestamp} | ${m.author}: ${m.text}</p>
        `);
    }

    res.end(`
        <form method="post" action="/messages/add">
            <input name="author">
            <textarea name="text"></textarea>
            <input type="submit">
        </form>
    `);
});

server.use(router);

server.use((err, req, res, next) => {
    res.status(err.code || 400).json({message: err.message || err});
});

server.listen(3000, "", () => {
    console.log("Web server started on http://127.0.0.1:3000");
});