exports.getAllMessagesController = (req, res) => {
    const route = new URL(req.url, `http://${req.headers.host}`);
    const params = route.searchParams;
    const all = res.app.locals.messages;
    const sort = ["id", "text", "sender", "addedAt"] ? params.get("sort") : "addedAt";
    const sortValue = ["asc", "desc"].includes(params.get("sortValue")) ? params.get("sortValue") : "desc";
    const limit = params.get("limit") ? Math.min(Math.max(1, +params.get("limit")), 50) : 10;
    const skip = params.get("skip") ? Math.min(Math.max(1, +params.get("skip")), 500) : 0;
    const sortValueNums = sortValue === "desc" ? [1, -1] : [-1, 1];
    const sorted = all.sort((a, b) => (a[sort] < b[sort]) ? sortValueNums[0] : sortValueNums[1]);
    const limited = sorted.slice(0, limit);
    
    if (skip > 0) {
        res.setHeader("Content-Type", "application/json");

        for (let i = 0; i < limited.length; i += skip) {
            const nextIndex = i + skip;
            res.write((i === 0 ? "" : ",") + JSON.stringify(limited.slice(i, nextIndex)));
        }

        res.end();
    } else
        res.json(limited);
}

exports.addMessageController = (req, res) => {
    const data = req.body;
    const messages = res.app.locals.messages;

    res.app.locals.messages.push({
        id: (messages.length === 0) ? 1 : (messages[messages.length - 1].id + 1),
        text: data.text || "Hello, everyone!!!",
        sender: data.sender || "Anonymous",
        addedAt: (new Date()).toUTCString()
    });

    res.redirect("/messages/all");
}