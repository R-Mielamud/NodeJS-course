const express = require("express");
const nunjucks = require("nunjucks");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const routers = require("./routers");
const fs = require("fs");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const User = require("./routers/api/models/user.model");
const { compareSync } = require("bcryptjs");
require("dotenv").config();

const server = express();

nunjucks.configure(path.join(__dirname, "templates"), {
    watch: true,
    autoescape: true,
    express: server
});

mongoose.connect("mongodb://localhost:27017/telephone-book-1", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

mongoose.connection.on("error", err => {
    console.error("Mongo error:", err);
    process.exit(1);
});

mongoose.set("debug", true);

server.use(
    session({
        name: "session",
        secret: "SecretKey1234567890",
        resave: false,
        saveUninitialized: false,
        maxAge: 24 * 60 * 60 * 1000,
        store: new MongoStore({
            collection: "session",
            mongooseConnection: mongoose.connection,
            stringify: false
        })
    })
);

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "static")));
server.use(passport.initialize());
server.use(passport.session());

passport.use(
    "local",
    new LocalStrategy(
        {
            passReqToCallback: true,
            passwordField: "password",
            usernameField: "email"
        },
        async (req, email, password, callbackfn) => {
            const user = await User.findOne({ email: email });

            if (!user) {
                return callbackfn(null, null);
            }

            if (!compareSync(password, user.password)) {
                return callbackfn(null, null);
            }

            return callbackfn(null, user);
        }
    )
);

passport.serializeUser((req, user, callbackfn) => {
    return callbackfn(null, user._id);
});

passport.deserializeUser(async (req, id, callbackfn) => {
    const user = await User.findById(id);
    return callbackfn(null, user);
});

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