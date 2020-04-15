exports.getAllMessagesController = (req, res) => {
    res.json(req.limited);
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

    res.redirect("/");
}