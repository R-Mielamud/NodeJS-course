let fs = require("fs");
let path = require("path");


let findFilesByExt = function(ext, searchingPath, deep) {
    function readdir(dir, deep, startDeep) {
        let readedDir = [];
        let files = fs.readdirSync(dir);
        
        for (let file of files)
            if (ext ? (ext.includes(path.extname(file)) || !file.includes(".")) : true) {
                if (fs.lstatSync(file).isDirectory()) {
                    try {
                        if (startDeep == 0 || deep > 1) readedDir = readedDir.concat(readdir(path.join(dir, file), deep - 1, startDeep));
                        else readedDir.push(file + "/");
                    } catch (e) {
                        if (e.name === "Error") {}
                        else throw e;
                    }
                } else {
                    let currentPath = dir.split("\\");
                    if (dir !== searchingPath) readedDir.push(path.join(currentPath[currentPath.length - 1], file));
                    else readedDir.push(file);
                }
            }

        return readedDir;
    }

    let result = readdir(path.join(__dirname, searchingPath), deep, deep);
    return result;
}

module.exports.findFilesByExt = findFilesByExt;