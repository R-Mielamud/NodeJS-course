const express = require("express");
const index = require("./apps/index");
const messages = require("./apps/messages");
const assets = require("./apps/assets");
const fs = require("fs");
const path = require("path");
const server = express();

let requestsData = {}

setInterval(() => {
    fs.writeFile(path.join(__dirname, "requests_info_log.httplog"), "", () => {});

    for (const status in requestsData) {
        fs.appendFile(path.join(__dirname, "requests_info_log.httplog"), `${status} (${requestsData[status].count}): (${requestsData[status].agents.join(", ")})\n`, () => {});
    }
}, 60000);

server.locals.messages = [];
server.use(express.json());
server.use(express.urlencoded({extended: true}));

server.use((req, res, next) => {
    const start = Date.now() / 1000;

    res.on("finish", () => {
        const end = Date.now() / 1000;
        const time = Date.now() / 1000;
        fs.appendFile(path.join(__dirname, "requests_time_log.httplog"), `${start} > ${end} : ${time} (${res.statusCode})\n`, () => {});
        
        if (requestsData[res.statusCode]) {
            requestsData[res.statusCode].count++;
            
            if (!requestsData[res.statusCode].agents.includes(req.headers["user-agent"]))
                requestsData[res.statusCode].agents.push(req.headers["user-agent"]);
        } else {
            requestsData[res.statusCode] = {};
            requestsData[res.statusCode].count = 1;
            requestsData[res.statusCode].agents = [req.headers["user-agent"]];
        }
    });

    res.on("close", () => {
        const end = Date.now() / 1000;
        const time = Date.now() / 1000;
        fs.appendFile(path.join(__dirname, "requests_time_log.httplog"), `${start} > ${end} : ${time} (${res.statusCode})\n`, () => {});
        
        if (requestsData[res.statusCode]) {
            requestsData[res.statusCode].count++;
            
            if (!requestsData[res.statusCode].agents.includes(req.headers["user-agent"]))
                requestsData[res.statusCode].agents.push(req.headers["user-agent"]);
        } else {
            requestsData[res.statusCode].count = 1;
            requestsData[res.statusCode].agents = [req.headers["user-agent"]];
        }
    });

    next();
});

server.use((req, res, next) => {
    const { url, method } = req;
    console.log(`${(new Date()).toUTCString()} [${method}] ${url}`);
    next();
});

server.use(index.router);
server.use(messages.router);
server.use(assets.router);

server.listen(3000, "", () => console.log("Server started on http://127.0.0.1:3000"));