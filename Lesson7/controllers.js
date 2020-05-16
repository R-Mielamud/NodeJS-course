const Message = require("./models/Message");

exports.indexController = async (req, res) => {
    const messages = await Message.find({}, { __v: 0 }).lean().exec();

    res.render("templates/index.html", {
        title: "Express Chat",
        messages: messages
    });
}

exports.addMessageController = async (req, res) => {
    const newMessage = new Message({
        time: (new Date()).toUTCString(),
        ...req.body
    });

    await newMessage.save();
    res.redirect("/");
}

exports.getAllMessagesController = async (req, res) => {
    const messages = await Message.find({}, { __v: 0 }).lean().exec();
    res.json(messages);
}

exports.deleteMessageController = async (req, res) => {
    const result = await Message.deleteOne(req.body).lean().exec();
    res.json(result);
}

exports.updateMessageController = async (req, res) => {
    const result = await Message.updateOne(req.body.cond, req.body.new).lean().exec();
    res.json(result);
}