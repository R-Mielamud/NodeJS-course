const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");

class Finder extends EventEmitter {
    constructor(dirname, deep, ext, subname) {
        super();
        this.dirname = dirname;
        this.deep = deep;
        this.startDeep = deep;
        this.ext = ext;
        this.subname = subname;
        this.processInterval = null;
        this.totalFiles = 0;
        this.counter = 0;
        setTimeout(() => this.emit("started"), 0);

        this.on("file", () => {
            if (this.processInterval) {
                clearInterval(this.processInterval);
                this.processInterval = null;
            }
        });
    }

    canShowFile(file) {
        return (this.ext ? this.ext.includes(path.extname(file)) : true) && file.includes(this.subname) && file.includes(".");
    }

    parse(dirname = this.dirname) {
        let files = [];
        this.processInterval = setInterval(() => this.emit("processing", this.totalFiles), 2000);

        let data = fs.readdirSync(dirname);
        
        if (data) {
            for (let file of data) {
                if (fs.lstatSync(path.join(dirname, file)).isDirectory() && (this.startDeep === 0 || this.deep > 0)) {
                    clearInterval(this.processInterval);
                    this.deep--;
                    let folderpath = path.join(dirname, file);
                    data = data.concat(this.parse(folderpath));
                } else if (this.canShowFile(file)) {
                    this.totalFiles++;
                    this.emit("file", path.join(dirname, file));
                }
            }
        }

        files = data;
        if (files) files.filter(file => this.canShowFile(file));

        if (dirname === this.dirname && this.counter > 0) {
            clearInterval(this.processInterval);
            this.emit("finished");
            this.counter = 0;
        } else this.counter++;

        return files;
    }
}

module.exports = Finder;