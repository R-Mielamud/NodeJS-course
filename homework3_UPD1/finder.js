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
        this.__processInterval = null;
        this.totalDirs = 0;
        this.totalFiles = 0;
        setTimeout(() => this.emit("started"), 0);
    }

    _openDir(dirname, deep) {
        return new Promise((resolve, reject) => {
            fs.readdir(dirname, async (error, data) => {
                if (error) return reject(error);

                else {
                    let files = [];

                    for (const file of data) {
                        const pathToFile = path.join(dirname, file);

                        try {
                            await new Promise(resolve => {
                                fs.stat(pathToFile, async (error, stat) => {
                                    if (error) {
                                        console.log("Oops! " + error.name + ": " + error.message);
                                        return;
                                    }

                                    const isDirectory = stat.isDirectory();
                                    const isFile = stat.isFile();

                                    if (isDirectory && (this.startDeep === 0 || deep > 1)) {
                                        this.totalDirs++;
                                        const newFiles = await this._openDir(pathToFile, deep - 1);
                                        files = files.concat(newFiles);
                                    } else if (isFile) {
                                        const fileStatus = await fileFunctions.checkFileByName(dirname, file, this.name);

                                        if (fileStatus.matches) {
                                            files.push(file);
                                            this.emit("file", pathToFile);
                                            this.totalFiles++;

                                            if (this.search && !fileStatus.ftype) {
                                                await new Promise(resolve => {
                                                    const readableStream = fs.createReadStream(pathToFile, {
                                                        highWaterMark: 8
                                                    });

                                                    readableStream.setEncoding("utf-8");
                                                    let fileContent = "";

                                                    readableStream.on("data", chunk => {
                                                        fileContent += chunk;
                                                        if (fileContent.includes(this.search) && fileContent.length >= (fileContent.indexOf(this.search) + this.search.length + 20)) readableStream.close();
                                                    });

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

                                    resolve();
                                });
                            });
                        } catch (error) {
                            console.log("Oops! " + error.name + ": " + error.message);
                        }
                    }

                    resolve(files);
                }
            });
        });
    }

    parse() {
        setTimeout(() => {
            this.__processInterval = setInterval(() => {
                this.emit("processing", this.totalDirs, this.totalFiles);
            }, 2000);
        });

        this.on("finished", () => clearInterval(this.__processInterval));
        this._openDir(this.dirname, this.deep).then(files => this.emit("finished"));
    }
}

module.exports = Finder;