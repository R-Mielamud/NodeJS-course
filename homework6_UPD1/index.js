const express = require("express");
const index = require("./apps/index");
const messages = require("./apps/messages");
const assets = require("./apps/assets");
const fs = require("fs");
const path = require("path");
const server = express();

let requestsData = {}

setInterval(() => {
    const writeStream = fs.createWriteStream(path.join(__dirname, "requests_info_log.httplog"), { encoding: "utf-8" });

    for (const status in requestsData) {
        writeStream.write(`${status} (${requestsData[status].count}): (${requestsData[status].agents.join(", ")})\n`);
    }

    writeStream.end();
}, 1000);

server.locals.messages = [];

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use((req, res, next) => {
    const start = Date.now() / 1000;
    const context = this;

    function onClose() {
        const end = Date.now() / 1000;
        const time = end - start;
        const isSuccess = res.statusCode > 199 && res.statusCode < 300;
        const statusText = isSuccess ? "success" : "denied";
        fs.appendFile(path.join(__dirname, "requests_time_log.httplog"), `${start} > ${end} : ${time} (${statusText})\n`, () => {});
        
        if (requestsData[res.statusCode]) {
            requestsData[res.statusCode].count++;
            
            if (!requestsData[res.statusCode].agents.includes(req.headers["user-agent"])) {
                requestsData[res.statusCode].agents.push(req.headers["user-agent"]);
            }
        } else {
            requestsData[res.statusCode] = {};
            requestsData[res.statusCode].count = 1;
            requestsData[res.statusCode].agents = [req.headers["user-agent"]];
        }
    }

    onClose.bind(context);

    res.on("finish", onClose);

    res.on("close", () => {
        res.removeListener("finish", onClose);
        onClose();
    });

    const { url, method } = req;
    console.log(`${(new Date()).toUTCString()} [${method}] ${url}`);
    next();
});

server.use(index.router);
server.use(messages.router);
server.use(assets.router);

server.listen(3000, "", () => console.log("Server started on http://127.0.0.1:3000"));