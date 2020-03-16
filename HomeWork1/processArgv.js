const minimist = require("minimist");

const processArgv = (argv) => {
    let path = __dirname, colors = ["red", "green", "blue"], deep = 0;

    const params = minimist(argv, {
        string: ["path", "colors"],
        number: ["deep"],

        default: {
            deep: deep,
            path: path
        }
    });

    params.colors = params.colors ? JSON.parse(params.colors) : colors;
    return params;
}

const getArrayFromExt = ext => ext ? JSON.parse(ext) : ext;
global.processArgv = processArgv;
global.getArrayFromExt = getArrayFromExt;