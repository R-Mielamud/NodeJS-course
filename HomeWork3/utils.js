const path = require("path");
const FileType = require("file-type");
const readChunk = require("read-chunk");

async function checkFileByName(dirname, file, name) {
    if (!name) return true;
    const nameSplited = name.split("*\\");

    const options = ({
        fname: nameSplited[0],
        ext: nameSplited[1]
    });

    let matchesEXT = true;
    let type;

    await (async () => {
        const buffer = readChunk.sync(path.join(dirname, file), 0, 4100);
        type = await FileType.fromBuffer(buffer);

        if (options.ext) {
            if (!type) matchesEXT = path.extname(file) === options.ext;
            else matchesEXT = "." + type.ext === options.ext;
        }
    })();

    let matchesName = options.fname ? !!file.split(".")[0].match(options.fname) : true;
    return { matches: matchesName && matchesEXT, ftype: type };
}

module.exports = {
    fileFunctions: {
        checkFileByName: checkFileByName
    }
}