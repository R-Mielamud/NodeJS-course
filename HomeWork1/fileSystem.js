const fs = require("fs");
const path = require("path");

const findFilesByExt = function(ext, searchingPath, deep) {
    function readdir(dir, deep, startDeep) {
        let readedDir = [];
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            if (ext ? (ext.includes(path.extname(file)) || fs.statSync(path.join(dir, file)).isDirectory()) : true) {
                if (fs.statSync(path.join(dir, file)).isDirectory()) {
                    try {
                        if (startDeep === 0 || deep > 1) readedDir = readedDir.concat(readdir(path.join(dir, file), deep - 1, startDeep));
                        else readedDir.push(file + "/");
                    } catch (e) {
                        throw e;
                    }
                } else {
                    const currentPath = dir.split("\\");
                    if (dir !== searchingPath) readedDir.push(path.join(currentPath[currentPath.length - 1], file));
                    else readedDir.push(file);
                }
            }
        }

        return readedDir;
    }

    const result = readdir(searchingPath, deep, deep);
    return result;
}

module.exports.findFilesByExt = findFilesByExt;