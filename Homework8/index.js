const express = require("express");
const nunjucks = require("nunjucks");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const path = require("path");
const routers = require("./routers");
const fs = require("fs");
require("dotenv").config();

const server = express();

nunjucks.configure(path.join(__dirname, "templates"), {
    watch: true,
    autoescape: true,
    express: server
});

mongoose.connect("mongodb://localhost:27017/chat8", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

mongoose.connection.on("error", err => {
    console.error("Mongo error:", err);
    process.exit(1);
});

mongoose.set("debug", true);

server.use(cookieSession({
    name: "session",
    keys: [
        "SecretKey1234567890"
    ],
    maxAge: 24 * 60 * 60 * 1000
}));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "static")));

function onFinish(req, res, stream) {
    const { method, url, headers } = req;
    const { statusCode, start } = res;
    const end = new Date();
    const time = end - start;
    const string = `${method} request from ${headers["user-agent"]}\nto ${url} with status ${statusCode} took ${time}ms\n\n`;
    stream.write(string);
    console.log(string);
}

server.use((req, res, next) => {
    if (process.env.NODE_ENV === "dev") {
        res.start = new Date();
        const logPath = path.join(__dirname, "logs", `logs.log`);
    
        const stream = fs.createWriteStream(logPath, {
            flags: "a"
        });

        const onFinishWrapper = () => {
            onFinish(req, res, stream);
        }
    
        res.on("finish", onFinishWrapper);

        res.on("close", () => {
            res.removeListener("finish", onFinishWrapper);
            onFinishWrapper();
        });
    }

    next();
});

server.use(routers);

server.use((err, req, res, next) => {
    let e = {};

    if (err.joi) {
        e = { message: err.joi.message };
    } else if (err.name === "MongoError") {
        e = { message: err.message }
    } else {
        e = err;
    }

    res.status(e.status || 400).json(e);
});

const port = process.env.PORT || 3000;

server.listen(port, "", () => {
    console.log("Web server started on http://127.0.0.1:3000");
    console.log("App is running in " + (process.env.NODE_ENV === "dev" ? "development" : "production") + " mode");
    console.log("HINT: development mode makes logs about all requests in ./logs/logs.log");
});