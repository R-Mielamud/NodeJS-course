document.forms[0].children[2].onclick = async () => {
    const body = {
        email: document.forms[0].children[0].value,
        password: document.forms[0].children[1].value
    }

    await fetch(`${window.location.origin}/api/user/login`, {
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST"
    });

    window.location.href = window.location.origin;
}