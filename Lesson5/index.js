const http = require("http");
const fs = require("fs");
const path = require("path");
const filetype = require("file-type");

const server = http.createServer((req, res) => {
    const { url, method } = req;

    if (url === "/") {
        const stream = fs.createReadStream(path.join(__dirname, "client/index.html"));
        stream.pipe(res);
    } else {
        fs.stat(path.join(__dirname, url), (error, data) => {
            if (!error) {
                if (data.isFile()) {
                    const defChunkSize = Math.round(data.size / 1000);
                    const { range } = req.headers;
                    const rangeData = range.split("=")[1].split("-");
                    const rangeStart = parseInt(rangeData[0]);
                    const rangeEnd = rangeData[1] ? parseInt(rangeData[1]) : rangeStart + defChunkSize;

                    const stream = fs.createReadStream(path.join(__dirname, url), {
                        start: rangeStart,
                        end: rangeEnd
                    });

                    res.writeHead(206, {
                        "Content-Range": `bytes ${rangeStart}-${rangeEnd}/${data.size}`,
                        "Accept-Range": "bytes",
                        "Content-Length": data.size,
                        "Content-Type": "video/mp4"
                    });

                    stream.pipe(res);
                } else {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ message: "not found" }));
                }
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ message: "not found" }));
            } 
        });
    }
});

server.listen(3000, "", () => {
    const { port } = server.address();
    console.log(`Test server started on http://127.0.0.1:${port}`);
});