const http = require("http");
const controllers = require("./controllers");
const fs = require("fs");
const path = require("path");
const qs = require("querystring");

let requestsData = new Map();

setInterval(() => {
    fs.writeFile(path.join(__dirname, "server_requests_log.httplog"), "", () => {})

    requestsData.forEach((v, k) => {
        fs.appendFile(
            path.join(__dirname, "server_requests_log.httplog"), 
            `${k}: ${v.count} (${Array.from(v.agents).join(", ")})\n`,
            () => {}
        );
    });
}, 1000);

const server = http.createServer(async (req, res) => {
    const { url, method } = req;
    const route = new URL(url, `http://${req.headers.host}`);
    let { pathname } = route;

    console.log(`[${method}] ${url}`);

    pathname = pathname[pathname.length - 1] === "/" && pathname !== "/" ?
        pathname.slice(0, -1) : pathname;

    const start = (new Date()) / 1000;

    function onFinish() {
        const end = (new Date()) / 1000;
        const time = end - start;
        fs.appendFile(path.join(__dirname, "assets_requests_log.httplog"), `${start} > ${end} : ${time} (${res.statusCode})\n`, () => {});
    }

    res.on("finish", onFinish);

    res.on("close", () => {
        res.removeListener("finish", onFinish);
        onFinish();
    });

    switch (method) {
        case "GET":
            if (pathname === "/") {
                await controllers.indexController(req, res);
            } else if (/\/assets\/[a-z1-9]+/i.test(pathname)) {
                const splited = pathname.split("/assets/");
                await controllers.assetsController(req, res, splited[1]);
            } else if (/\/messages/i.test(pathname)) {
                const params = qs.parse(route.search.slice(1, route.search.length));
                await controllers.getMessagesController(req, res, params);
            } else {
                res.statusCode = 404;
                res.end();
            }

            break;
        case "POST":
            if (pathname === "/messages/add") {
                await controllers.addMessageController(req, res);
            } else {
                res.statusCode = 404;
                res.end();
            }
        case "PUT":
            if (/\/messages\/[1-9]+\/edit/i.test(pathname)) {
                await controllers.updateMessageController(req, res);
            } else {
                res.statusCode = 404;
                res.end();
            }
        case "DELETE":
            if (/\/messages\/[1-9]+\/delete/i.test(pathname)) {
                await controllers.deleteMessageController(req, res);
            } else {
                res.statusCode = 404;
                res.end();
            }
        default:
            res.statusCode = 404;
            res.end();
            break;
    }

    if (requestsData.has(res.statusCode)) {
        requestsData.get(res.statusCode).count++;
        requestsData.get(res.statusCode).agents.add(req.headers["user-agent"]);
    } else {
        requestsData.set(res.statusCode, {
            count: 1,
            agents: new Set()
        });

        requestsData.get(res.statusCode).agents.add(req.headers["user-agent"]);
    }
});

server.listen(3000, "", () => {
    const addr = server.address();
    console.log(`Test server started on http://127.0.0.1:${addr.port}`);
});