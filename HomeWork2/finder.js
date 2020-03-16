const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");

class Finder extends EventEmitter {
    constructor(dirname, deep, ext, subname) {
        super();
        this.dirname = dirname;
        this.ext = ext;
        this.deep = this.startDeep = deep;
        this.subname = subname;
        this.totalDirs = 0;
        this.processTimeout = null;
        this.processInterval = null;
        setTimeout(() => this.emit("started"), 0);

        this.on("finished", () => {
            clearInterval(this.processInterval);
            clearTimeout(this.processTimeout);
        });
    }

    _openDir(dirname, deep) {
        return new Promise((resolve, reject) => {
            let files = [];

            fs.readdir(dirname, async (error, data) => {
                if (error) {
                    if (error.name === "Error") {}
                    else return reject(error);
                } else {
                    let i = 0;

                    for (const file of data) {
                        const filePath = path.join(dirname, file);

                        try {
                            const stat = fs.statSync(filePath);
                            const isDir = stat.isDirectory();
                            const isFile = stat.isFile();

                            if (isDir && (this.startDeep === 0 || deep > 1)) {
                                this.totalDirs++;
                                files = files.concat(await this._openDir(filePath, deep - 1));
                            } else if ((this.ext ? this.ext.includes(path.extname(file)) : true) &&
                                        (file.indexOf(this.subname) != -1) && isFile) {
                                            this.emit("file", filePath);
                                            files.push(file);
                            }
                        } catch (error) {
                            if (error.name === "Error") {}
                            else throw error;
                        }
                    }

                    resolve(files);
                }
            });
        });
    }

    parse() {
        this.processInterval = setInterval(() => {
            if (this.processTimeout ? this.processTimeout._called : true)
                this.processTimeout = setTimeout(() => this.emit("processing", this.totalDirs), 2000);
        }, 2000);

        this._openDir(this.dirname, this.deep).then(files => this.emit("finished"));
    }
}

module.exports = Finder;