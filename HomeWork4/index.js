const http = require("http");
const controllers = require("./controllers");
const fs = require("fs");
const path = require("path");
const qs = require("querystring");

let requestsData = {};

setInterval(() => {
    fs.writeFile(path.join(__dirname, "server_requests_log.httplog"), "", () => {})

    for (const key in requestsData)
        fs.appendFile(
            path.join(__dirname, "server_requests_log.httplog"), 
            `${key}: ${requestsData[key].count} (${requestsData[key].agents.join(", ")})\n`,
            () => {}
        );
}, 1000);

const server = http.createServer(async (req, res) => {
    const { url, method } = req;
    let route = new URL(url, `http://${req.headers.host}`);
    let { pathname } = route;

    console.log(`[${method}] ${url}`);

    pathname = pathname[pathname.length - 1] === "/" && pathname !== "/" ?
        pathname.slice(0, -1) : pathname;

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

    if (Object.keys(requestsData).includes(String(res.statusCode))) {
        requestsData[res.statusCode].count++;

        if (!requestsData[res.statusCode].agents.includes(req.headers["user-agent"]))
            requestsData[res.statusCode].agents.push(req.headers["user-agent"]);
    } else {
        requestsData[res.statusCode] = {
            count: 1,
            agents: [req.headers["user-agent"]]
        }
    }
});

server.listen(3000, "", () => {
    const addr = server.address();
    console.log(`Test server started on http://127.0.0.1:${addr.port}`);
});