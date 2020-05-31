const { celebrate } = require("celebrate");

exports.valid = schema => {
    return celebrate(schema, {
        allowUnknown: false,
        abortEarly: false,
        stripUnknown: [
            "object"
        ]
    });
}