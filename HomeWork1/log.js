const chalk = require("chalk");

class Logger {
    constructor(colors) {
        this.colors = colors;
        this.index = 0;
    }

    color(data) {
        for (const line of data) {
            const color = this.colors[this.index % this.colors.length];

            try {
                console.log(chalk[color](line));
            } catch (e) {
                console.log(chalk.bgRed("Unsupported color: " + color));
                this.colors.splice(this.colors.indexOf(color), 1);
            }

            this.index++;
        }
    }
}

exports.Logger = Logger;