const fs = require("fs");
const path = require("path");
const readline = require("readline");
const readLastLines = require("read-last-lines");

class Message {
    constructor(author = "Anonymous", text = "Hello, everybody!") {
        (async () => {
            this.time = (new Date()).toUTCString();
            this.author = author;
            this.text = text;

            const lines = await readLastLines.read(path.join(__dirname, "db.httpdb"), 1)
            const lastLine = lines.split("\n")[0];
            this.id = Message._fmtFileLines([lastLine])[0].id + 1;

            const stream = fs.createWriteStream(path.join(__dirname, "db.httpdb"), { flags: "a" });
            stream.end(`${this.id};${this.time};${author};${text}\n`);
        })();
    }

    static _fmtFileLines(lines) {
        let result = [];

        for (const l of lines) {
            const [ id, time, author, text ] = l.split(";");

            result.push({
                id: +id,
                time: time,
                author: author,
                text: text
            });
        }

        return result;
    }

    static _unformatFileLines(lines) {
        let result = [];
        for (const l of lines) result.push(`${l.id};${l.time};${l.author};${l.text}`);
        return result;
    }

    static SLOTS() {
        return ["id", "time", "author", "text"];
    }

    static diapazone(min, max) {
        return new Promise(resolve => {
            let lines = [];
            let lineCount = 0;
            const input = fs.createReadStream(path.join(__dirname, "db.httpdb"));
            const rl = readline.createInterface({ input: input });

            rl.on("line", line => {
                lineCount++;
                if (lineCount > min && lineCount < max) lines.push(line);
            });

            rl.on("close", () => {
                input.close();
                const greaterThanMax = lineCount >= max;

                resolve({
                    content: this._fmtFileLines(lines),
                    greaterThanMax: greaterThanMax
                });
            });
        });
    }

    static all() {
        return new Promise(resolve => {
            const rs = fs.createReadStream(path.join(__dirname, "db.httpdb"));
            let content = "";
            rs.on("data", chunk => content += chunk);

            rs.on("close", () => {
                const lines = content.split("\n").slice(0, -1);
                resolve(this._fmtFileLines(lines));
            });
        });
    }

    static update(id, options) {
        return new Promise((resolve, reject) => {
            const optionsKeys = Object.keys(options);

            fs.readFile(path.join(__dirname, "db.httpdb"), (error, data) => {
                data = data.toString("utf8");

                if (!error) {
                    const splited = data.split("\n");

                    for (const line of splited) {
                        const formatted = this._fmtFileLines([line])[0];

                        if (formatted.id === id) {
                            const dataMatch = this._fmtFileLines(data.match(new RegExp(`${formatted.id};.*;[a-z1-9]+;[a-z1-9]+`, "i")))[0];
                            for (const key of this.SLOTS()) if (!optionsKeys.includes(key)) options[key] = dataMatch[key];

                            data = data.replace(
                                new RegExp(`${formatted.id};.*;[a-z1-9]+;[a-z1-9]+`, "i"),
                                this._unformatFileLines([options])[0]
                            );

                            break;
                        }
                    }

                    fs.writeFile(path.join(__dirname, "db.httpdb"), data, error => !error ? resolve() : reject());
                }
            });
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, "db.httpdb"), (error, data) => {
                if (!error) {
                    data = data.toString("utf8");
                    const splited = data.split("\n");
                    
                    for (const line of splited) {
                        const formatted = this._fmtFileLines([line])[0];
                        if (formatted.id === id) data = data.split(new RegExp(`\n?${line}${splited.length === 2 ? "\n" : ""}`, "i"));
                    }

                    fs.writeFile(path.join(__dirname, "db.httpdb"), data.join(""), error => !error ? resolve() : reject());
                }
            });
        });
    }
}

module.exports = {
    Message: Message
}