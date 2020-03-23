const http = require("http");
const path = require("path");
const fs = require("fs");
const getTemplate = require("./readFile");
const controllers = require("./controllers");

const INDEX = path.join(__dirname, "templates", "index.html");

const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const { pathname } = url;
    const { method } = request;
    const messagesRegexp = /\/messages/i;
    console.log(`[${request.method}] ${request.url}`);

    if (request.url === "/") {
        const body = await getTemplate(INDEX);
        if (body.type) response.setHeader("content-type", body.type);
        response.end(body.body);
    } else if (messagesRegexp.test(pathname)) {
        const route = pathname[pathname.length - 1] === "/" ? pathname.slice(0, pathname.length - 1) : pathname;
        const params = route.split("/");
        const id = params.length === 3 ? +params[2] : null;

        if (method === "GET") {
            if (!id) controllers.messages(request, response);
            else controllers.message(request, response, id);
        }
        
        else if (method === "POST") controllers.addMessage(request, response);
        else if (method === "PUT") controllers.updMessage(request, response, id);
        else if (method === "DELETE") controllers.delMessage(request, response, id);
    }
});

server.listen(3000, "", () => {
    const address = server.address();
    console.log(`Server is running on http://127.0.0.1:${address.port}`);
});