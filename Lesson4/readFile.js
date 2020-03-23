const fs = require("fs");
const fileType = require("file-type");

function read(path) {
    return new Promise(resolve => {
        const stream = fs.createReadStream(path);
        let data = "";
        let type;
            
        stream.once("data", async chunk => type = await fileType.fromBuffer(chunk));
        stream.on("data", chunk => data += chunk);

        stream.on("close", () => {
            resolve({
                body: data,
                type: type
            });
        });
    });
}

module.exports = read;