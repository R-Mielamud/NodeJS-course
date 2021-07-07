exports.indexController = (req, res) => {
    res.setHeader("Content-Type", "text/html");

    for (const message of res.app.locals.messages) {
        res.write(`
            <p>${message.addedAt} | ${message.sender}: ${message.text}</p>
        `);
    }

    res.end(`
        <form action="/message/add" method="post">
            <input name="sender">
            <textarea name="text"></textarea>
            <input type="submit">
        </form>
    `);
}