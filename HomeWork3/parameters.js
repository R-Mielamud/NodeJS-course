const minimist = require("minimist");
const os = require("os");

const defaults = {
    dirname: os.homedir(),
    name: "*\\",
    search: null,
    colors: JSON.stringify(["red", "green", "blue"]),
    deep: 0
}

let parameters;

try {
    parameters = minimist(process.argv.slice(2, process.argv.length), {
        string: ["dirname", "name", "search", "colors"],
        number: ["deep"],
        default: defaults
    });
} catch (error) {
    throw error;
}

parameters.colors = JSON.parse(parameters.colors);
module.exports = parameters;