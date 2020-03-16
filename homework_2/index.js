const params = require("./parameters.js");
const Finder = require("./finder.js");
const Logger = require("./colorful.js");
const logger = new Logger(params.colors);
const finder = new Finder(params.dirname, params.deep, params.ext, params.subname);

finder.on("started", () => {
    console.log("Started!\n");
    finder.parse();
});

finder.on("file", file => logger.color(params.colors, "Found file:  ", file));

finder.on("processing", files => console.log("Processing ... found", files, "files."));
finder.on("finished", () => console.log("\nFinished!"));