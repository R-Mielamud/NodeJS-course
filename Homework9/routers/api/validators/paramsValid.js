exports.paramsValid = (req, res, next) => {
    if (req.query.limit) {
        req.query.limit = +req.query.limit;
    }

    if (req.query.skip) {
        req.query.skip = +req.query.skip;
    }

    if (!req.query.sort || !(["addedAt", "updatedAt", "deletedAt", "author", "text"].includes(req.query.sort))) {
        req.query.sort = "addedAt";
    }

    if (!req.query.sortValue || !(["asc", "desc"].includes(req.query.sortValue))) {
        req.query.sortValue = "desc";
    }

    if (!req.query.limit || req.query.limit <= 0 || req.query.limit >= 51) {
        req.query.limit = 10;
    }

    if (!req.query.skip || req.query.skip <= 0 || req.query.skip >= 501) {
        req.query.skip = 0;
    }

    next();
}