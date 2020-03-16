require("./processArgv");
let fileSystem = require("./fileSystem");
let log = require("./log");

let argv = process.argv;
let ext = getArrayFromExt(process.env.EXT);
let params = processArgv(argv);
let logger = new log.Logger(params.colors);

let data = fileSystem.findFilesByExt(ext, params.path, params.deep);
logger.color(data);