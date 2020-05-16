const Finder = require("./finder");
const Logger = require("./logger");
const parameters = require("./parameters");
const finder = new Finder(parameters.dirname, parameters.deep, parameters.name, parameters.search);
const logger = new Logger(parameters.colors);

finder.on("started", () => {
    logger.color("Started!\n");
    finder.parse();
});

finder.on("contents", contents => logger.color(contents));
finder.on("file", file => logger.color("File:   " + file));
finder.on("processing", (dirs, files) => logger.color(`Processing ... found ${dirs} dirs / ${files} files.`));

finder.on("finished", () => {
    logger.color("\nFinished!");
    logger.close();
});