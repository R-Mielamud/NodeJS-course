require("./processArgv");
const fileSystem = require("./fileSystem");
const log = require("./log");

const argv = process.argv;
const ext = getArrayFromExt(process.env.EXT);
const params = processArgv(argv);
const logger = new log.Logger(params.colors);

const data = fileSystem.findFilesByExt(ext, params.path, params.deep);
logger.color(data);