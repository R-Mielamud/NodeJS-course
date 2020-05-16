const chalk = require("chalk");

class Logger {
    constructor(colors) {
        this.colors = colors;
        this.index = 0;
    }

    color(...strings) {
        let text = strings.join(" ");
        let color = this.colors[this.index % this.colors.length];
        if (chalk[color]) console.log(chalk[color](text));
        
        else {
            console.log(chalk.black(chalk.bgRed("Unsupported color:", color)));
            this.colors.splice(this.colors.indexOf(color), 1);
        }

        this.index++;
    }
}

module.exports = Logger;