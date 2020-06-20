document.forms[0].children[4].onclick = async () => {
    const body = {
        email: document.forms[0].children[2].value,
        password: document.forms[0].children[3].value
    }

    if (document.forms[0].children[0].value) {
        body.firstName = document.forms[0].children[0].value;
    }

    if (document.forms[0].children[1].value) {
        body.lastName = document.forms[0].children[1].value;
    }

    const Ores = await fetch(`${window.location.origin}/api/user/register`, {
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST"
    });

    const res = await Ores.json();

    if (res.message) {
        document.getElementsByClassName("alert")[0].innerHTML = res.message;
    } else {
        await fetch(`${window.location.origin}/api/user/login`, {
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST"
        });

        window.location.href = window.location.origin;
    }
} 