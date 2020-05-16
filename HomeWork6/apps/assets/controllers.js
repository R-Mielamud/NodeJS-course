const fs = require("fs");
const path = require("path");
const fileType = require("file-type");

exports.getAssetFileController = (req, res) => {
    fs.stat(path.join(__dirname, "../../assets/", req.params.fname), (err, stat) => {
        if (!err) {
            const stream = fs.createReadStream(path.join(__dirname, "../../assets/", req.params.fname));

            stream.once("readable", async () => {
                const chunk = stream.read(4100 < stat.size ? 4100 : stat.size);
                const type = await fileType.fromBuffer(chunk);

                if (type)
                    res.setHeader("Content-Type", type.mime);
                else
                    res.setHeader("Content-Type", "text/plain");

                res.write(chunk);
                stream.pipe(res);
            });
        } else {
            res.status(404).end();
        }
    });
}