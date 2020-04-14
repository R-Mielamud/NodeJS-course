const minimist = require("minimist");
const os = require("os");

const defaults = {
    dirname: os.homedir(),
    subname: "",
    colors: "[\"red\", \"green\", \"blue\"]",
    deep: 0
}

let parameters;

try {
    parameters = minimist(process.argv.slice(2), {
        string: ["dirname", "subname", "colors"],
        number: "deep",
        default: defaults
    });

    let ext = process.env.EXT;
    if (ext) ext = JSON.parse(ext);
    parameters.ext = ext;
    parameters.colors = JSON.parse(parameters.colors);
} catch (e) {
    console.log("Oops! " + error.name + ": " + error.message);
    parameters = defaults;
    parameters.ext = null;
}

module.exports = parameters;