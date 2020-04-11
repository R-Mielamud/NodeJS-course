const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");
const { fileFunctions } = require("./utils");

class Finder extends EventEmitter {
    constructor(dirname, deep, name, search) {
        super();
        this.dirname = dirname;
        this.deep = this.startDeep = deep;
        this.name = name;
        this.search = search;
        this.__processTimeout = null;
        this.totalDirs = 0;
        this.__setProcessTimeout();
        setTimeout(() => this.emit("started"), 0);
    }

    __setProcessTimeout() {
        this.__processTimeout = setTimeout(() => {
            this.emit("processing", this.totalDirs);
            this.__setProcessTimeout();
        }, 2000);
    }

    __clearProcessTimeout() {
        clearTimeout(this.__processTimeout);
    }

    _reloadProcessTimeout() {
        this.__clearProcessTimeout();
        this.__setProcessTimeout();
    }

    _openDir(dirname, deep) {
        return new Promise((resolve, reject) => {
            fs.readdir(dirname, async (error, data) => {
                if (error) return reject(error);

                else {
                    let files = [];

                    for (const file of data) {
                        try {
                            const pathToFile = path.join(dirname, file);
                            const stat = fs.statSync(pathToFile);
                            const isDirectory = stat.isDirectory();
                            const isFile = stat.isFile();

                            if (isDirectory && (this.startDeep === 0 || deep > 1)) {
                                this.totalDirs++;
                                this._reloadProcessTimeout();
                                files = files.concat(await this._openDir(pathToFile, deep - 1));
                            } else if (isFile) {
                                const fileStatus = await fileFunctions.checkFileByName(dirname, file, this.name);

                                if (fileStatus.matches) {
                                    files.push(file);
                                    this._reloadProcessTimeout();
                                    this.emit("file", pathToFile);

                                    if (this.search && !fileStatus.ftype) {
                                        await new Promise(resolve => {
                                            const readableStream = fs.createReadStream(pathToFile);
                                            readableStream.setEncoding("utf-8");
                                            let fileContent = "";
                                            readableStream.on("data", chunk => fileContent += chunk);

                                            readableStream.on("close", () => {
                                                const searchIndex = fileContent.indexOf(this.search);

                                                if (searchIndex !== -1) {
                                                    let before = searchIndex - 20;
                                                    if (before < 0) before = 0;
                                                    let after = searchIndex + this.search.length + 20;
                                                    if (after > fileContent.length - 1) after = fileContent - 1;
                                                    this.emit("contents", fileContent.slice(before, after + 1));
                                                }

                                                resolve();
                                            });
                                        });
                                    }
                                }
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
        this.on("finished", this.__clearProcessTimeout);
        this._openDir(this.dirname, this.deep).then(files => this.emit("finished"));
    }
}

module.exports = Finder;