const chalk = require("chalk");
const fs = require("fs");

class Logger {
    constructor(colors) {
        this.colors = colors;
        this.index = 0;
        const date = new Date();
        const filename = `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}_${Math.random().toFixed(12) * 10 ** 12}_log.finderlog`;
        fs.writeFileSync(filename, "");
        this._writeStream = fs.createWriteStream(filename);
    }

    color(string) {
        try {
            this.currentColor = this.colors[this.index % this.colors.length];
            console.log(chalk[this.currentColor](string));
            this.index++;
            this._writeStream.write(string + "\n");
        } catch (error) {
            console.error(error);
            console.log(chalk.bgRed("Unsupported color: " + this.currentColor));
            this.colors.splice(this.colors.indexOf(this.currentColor), 1);
        }
    }

    close() {
        this._writeStream.close();
    }
}

module.exports = Logger;