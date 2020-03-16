let minimist = require("minimist");

let processArgv = (argv) => {
    let path = "/", colors = ["red", "green", "blue"], deep = 0;

    let params = minimist(argv, {
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

let getArrayFromExt = ext => ext ? JSON.parse(ext) : ext;
global.processArgv = processArgv;
global.getArrayFromExt = getArrayFromExt;