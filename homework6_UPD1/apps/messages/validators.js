exports.getAllMessagesValidator = (req, res, next) => {
    const { query: params } = req;
    const all = res.app.locals.messages;
    const sort = ["id", "text", "sender", "addedAt"] ? params["sort"] : "addedAt";
    const sortValue = ["asc", "desc"].includes(params["sortValue"]) ? params["sortValue"] : "desc";
    const limit = params["limit"] ? Math.min(Math.max(1, +params["limit"]), 50) : 10;
    const skip = params["skip"] ? Math.min(Math.max(1, +params["skip"]), 500) : 0;
    const sortValueNums = sortValue === "desc" ? [1, -1] : [-1, 1];
    const sorted = all.sort((a, b) => (a[sort] < b[sort]) ? sortValueNums[0] : sortValueNums[1]);
    req.limited = sorted.slice(skip, limit);
    next();
}