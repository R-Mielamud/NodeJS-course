const { Joi, Segments } = require("celebrate");

exports.paramsValidSchema = () => ({
    [Segments.QUERY]: Joi.object().keys({
        limit: Joi.number().max(51).min(0).default(10),
        skip: Joi.number().max(501).min(0).default(0),
        sort: Joi.string().trim().valid("addedAt", "updatedAt", "deletedAt", "author", "text").default("addedAt"),
        sortValue: Joi.string().trim().valid("asc", "desc").default("desc")
    })
});