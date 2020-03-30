const http = require("http");

const options = {
    hostname: "localhost",
    port: 3000,
    method: "GET",
    path: "/",
}

const req = http.request(options, res => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("close", () => console.log(data));
});

req.end();