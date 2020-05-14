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
        this.totalFiles = 0;
        this.processInterval = null;
        setTimeout(() => this.emit("started"), 0);

        this.on("finished", () => {
            clearInterval(this.processInterval);
        });
    }

    _openDir(dirname, deep) {
        return new Promise(resolve => {
            let files = [];

            fs.readdir(dirname, async (error, data) => {
                if (error) {
                    console.log("Oops! " + error.name + ": " + error.message);
                    return;
                }
                
                for (const file of data) {
                    const filePath = path.join(dirname, file);

                    await new Promise(resolve => {
                        fs.stat(filePath, async (error, stat) => {
                            if (error) {
                                console.log("Oops! " + error.name + ": " + error.message);
                                return;
                            }

                            const isDir = stat.isDirectory();
                            const isFile = stat.isFile();

                            if (isDir && (this.startDeep === 0 || deep > 1)) {
                                this.totalDirs++;
                                files = files.concat(await this._openDir(filePath, deep - 1));
                            } else if ((this.ext ? this.ext.includes(path.extname(file)) : true) && (file.indexOf(this.subname) != -1) && isFile) {
                                this.emit("file", filePath);
                                files.push(file);
                                this.totalFiles++;
                            }

                            resolve();
                        });
                    });
                }

                resolve(files);
            });
        });
    }

    parse() {
        this.processInterval = setInterval(() => {
                this.emit("processing", this.totalDirs, this.totalFiles);
        }, 2000);

        this._openDir(this.dirname, this.deep).then(files => this.emit("finished"));
    }
}

module.exports = Finder;