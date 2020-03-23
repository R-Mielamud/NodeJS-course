const qs = require("querystring");
let messages = [];

module.exports = {
    messages: (request, response) => {
        response.setHeader("content-type", "text/html");
        response.write(`
            <ul>

            <style>
                h1 {
                    color: yellow;
                    text-align: center;
                }

                body {
                    background-color: green;
                }

                ul {
                    font-size: 24px;
                    color: yellow;
                    list-style-type: none;
                }

                input[type="submit"] {
                    padding: 10px 20px;
                    background-color: blue;
                    color: white;
                    border-radius: 10px;
                }

                .author {
                    margin-left: 200px;
                    text-transform: italic;
                    color: grey;
                }
            </style>
        `);

        for (const m of messages) {
            response.write(`<li>
                    <div class="message">
                        <div class="text">
                            ${m.text}
                        </div>

                        <div class="author">
                            ${m.author}
                        </div>
                    </div>
                </li>
            `);
        }

        response.end(`
            </ul>

            <form method="POST" action="">
                <input placeholder="Author" required name="author" id="author">
                <input required placeholder="Message" name="text" id="text">
                <input type="submit" value="Add">
            </form>
        `);
    },

    message: (request, response, id) => {
        response.end(JSON.stringify(messages.find(m => m.id === +id)));
    },

    updMessage: (request, response, id) => {
        let body = "";
        request.on("data", chunk => body += chunk);

        request.on("end", () => {
            const ct = request.headers["content-type"];
            if (ct === "application/json") body = JSON.parse(body);
            else if (ct === "x-www-form-urlencoded") body = qs.parse(body);
            const index = messages.indexOf(messages.find(m => m.id === +id));

            messages[index] = {
                text: body.text || messages[index].text,
                author: body.author || messages[index].author
            };

            console.log(messages);
            response.end("Updated");
        });
    },

    delMessage: (request, response, id) => {
        messages.splice(0, messages.indexOf(messages.find(m => m.id === +id)));
        response.end("Deleted");
    },

    addMessage: (request, response) => {
        let body = "";
        request.on("data", chunk => body += chunk);

        request.on("end", () => {
            const ct = request.headers["content-type"];
            console.log(ct);
            if (ct === "application/json") body = JSON.parse(body);
            else if (ct === "application/x-www-form-urlencoded" || ct === "x-www-form-urlencoded") body = qs.parse(body);

            messages.push({
                id: messages.length > 0 ? messages[messages.length - 1].id : 1,
                text: body.text || "",
                author: body.author || ""
            });

            console.log(messages);
            response.end("<script>window.location.href = \"/messages\"</script>");
        });
    }
}