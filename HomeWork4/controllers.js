const { Message } = require("./models");
const fs = require("fs");
const path = require("path");
const fileType = require("file-type");
const qs = require("querystring");

const ALLOWED_BODY_TYPES_ADD = ["application/json", "application/x-www-form-urlencoded"];
const ALLOWED_BODY_TYPES_UPD = ["application/json"];

let addedMessages = [];

exports.indexController = async (req, res) => {
    res.write(`
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="/assets/css/index.css">
                <title>My Little Chat</title>
            </head>

            <body>
    `);

    let messages = await Message.all();
    messages = messages.concat(addedMessages);

    for (const m of messages) res.write(`
        <div>
            <span class="time">${m.time}</span>
            <span> | </span>
            <span class="author">${m.author}: </span>
            <span class="message">${m.text}</span>
        </div>
    `);

    res.end(`
                <form action="/messages/add/" method="post">
                    <input placeholder="Author" id="author" name="author">
                    <input placeholder="Message" id="text" name="text">
                    <input type="submit" id="submit">
                </form>
            </body>
        </html>
    `);
}

exports.assetsController = (req, res, reqPath) => {
    return new Promise(async resolve => {
        const splited = reqPath.split("/");
        const pathToFolder = path.join(__dirname, "assets/", ...splited.slice(0, -1));
        const file = splited[splited.length - 1];
        const start = Date.now() / 1000;
        const ws = fs.createWriteStream(path.join(__dirname, "assets_requests_log.httplog"), { flags: "a" });

        fs.readdir(pathToFolder, (error, files) => {
            if (error || !files.includes(file)) {
                res.statusCode = 404;
                res.end();
                const end = Date.now() / 1000;
                const time = end - start;
                ws.end(`${start} > ${end} : ${time} (404)\n`);
                resolve();
            } else {
                const stream = fs.createReadStream(path.join(pathToFolder, file));
                let content = "";

                stream.on("data", chunk => {
                    content += chunk;
                    res.write(chunk);
                });

                stream.on("close", async () => {
                    const type = await fileType.fromBuffer(Buffer.from(content, "utf8"));
                    if (type) res.setHeader("content-type", type.mime);
                    res.end();
                    const end = Date.now() / 1000;
                    const time = end - start;
                    ws.end(`${start} > ${end} : ${time} (${res.statusCode})\n`);
                    resolve();
                });
            }
        });
    });
}

exports.getMessagesController = async (req, res, params) => {
    const skip = (params.skip && !isNaN(+params.skip)) ? +params.skip : 10;
    const limit = (params.limit && !isNaN(+params.limit)) ? +params.limit + 1 : Infinity;
    const sort = (params.sort && Message.SLOTS().includes(params.sort)) ? params.sort : "time";

    let all = [];
    if (limit !== Infinity) all = (await Message.diapazone(0, limit)).content;
    else all = await Message.all();

    const sorted = all.sort((a, b) => a[sort] < b[sort] ? -1 : 1);

    res.write("[");

    for (let index = 0; index < sorted.length; index += skip) {
        const data = all.slice(index, index + skip);
        const startChar = (index === 0 ? "" : ",");
        const stringContent = JSON.stringify(data).slice(1, -1);
        res.write(startChar + stringContent);
    }

    res.end("]");
}

exports.addMessageController = async (req, res) => {
    res.write(`<script>window.location.href = "/"</script>`);
    let body = "";
    req.on("data", chunk => body += chunk);

    req.on("end", () => {
        if (ALLOWED_BODY_TYPES_ADD.includes(req.headers["content-type"])) {
            if (req.headers["content-type"] === "application/json") body = JSON.parse(body);
            else if (req.headers["content-type"] === "application/x-www-form-urlencoded") body = qs.parse(body);

            else {
                res.statusCode = 404;
                return res.end();
            }

            new Message(body.author || "Anonymous", body.text || "Hello, everyone!");

            addedMessages.push({
                time: (new Date()).toUTCString(),
                author: body.author || "Anonymous",
                text: body.text || "Hello, everyone!"
            });

            res.end();
        } else {
            res.statusCode = 404;
            res.end();
        }
    });
}

exports.updateMessageController = async (req, res) => {
    let body = "";
    req.on("data", chunk => body += chunk);

    req.on("end", () => {
        if (ALLOWED_BODY_TYPES_UPD.includes(req.headers["content-type"])) {
            body = JSON.parse(body);
            Message.update(+(req.url.match(/\/[1-9]+\//)[0].slice(1, -1)), body);
            res.end();
        } else {
            res.statusCode = 404;
            return res.end();
        }
    });
}

exports.deleteMessageController = async (req, res) => {
    const id = +(req.url.match(/\/[1-9]+\//)[0].slice(1, -1));
    Message.delete(id);
    res.end();
}