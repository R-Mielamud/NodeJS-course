const { Joi, Segments } = require("celebrate");

exports.userValidSchema = () => ({
    [Segments.BODY]: Joi.object().keys({
        firstName: Joi.string().max(50),
        lastName: Joi.string().max(50),
        password: Joi.string().min(3).max(20).required(),
        email: Joi.string().email().required().min(5).max(100)
    }).required()
});

exports.messageValidSchema = () => ({
    [Segments.BODY]: Joi.object().keys({
        author: Joi.string().min(1).max(300).required(),
        text: Joi.string().min(2).max(2000).required(),
        deletedAt: Joi.date()
    }).required()
});

exports.messageUpdValidSchema = () => ({
    [Segments.BODY]: Joi.object().keys({
        findBy: Joi.object().keys({
            author: Joi.string().min(1).max(300),
            text: Joi.string().min(2).max(2000)
        }).required(),
        newData: Joi.object().keys({
            author: Joi.string().min(1).max(300),
            text: Joi.string().min(2).max(2000),
            deletedAt: Joi.date()
        }).required()
    }).required()
});

exports.messageDelValidSchema = () => ({
    [Segments.BODY]: Joi.object().keys({
        findBy: Joi.object().keys({
            author: Joi.string().min(1).max(300),
            text: Joi.string().min(2).max(2000)
        }).required()
    }).required()
});

exports.adminLockUserValidSchema = () => ({
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().required()
    })
});

exports.adminDelMessageValidSchema = () => ({
    [Segments.BODY]: Joi.object().keys({
        author: Joi.string().required()
    })
});

exports.adminNewRoleValidSchema = () => ({
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().email().required(),
        newRole: Joi.string().required()
    })
});