const WebSocket = require("ws");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

(async () => {
    console.log("Insecure Chat");
    const user = await ask("User: ");
    const to = await ask("Receiver: ");
    const ip = await ask("IP Server: ");
    const port = await ask("PORT Server: ");
    const room = await ask("Room's name: ");
    const password = await ask("Room's pass: ");

    const ws = new WebSocket(`ws://${ip}:${port}`);

    ws.on("open", () => {
        ws.send(JSON.stringify({
            type: "join",
            user,
            room,
            password
        }));

        console.log("Write:");
        rl.on("line", (line) => {
            ws.send(JSON.stringify({
                type: "message",
                to,
                message: line
            }));
        });
    });

    ws.on("message", (data) => {
        const msg = JSON.parse(data);

        if (msg.type === "message") {
            console.log(`\n${msg.from}: ${msg.message}`);
        } else {
            console.log(`${msg.message}`);
        }
    });

    ws.on("close", () => {
        console.log("🔴 Conexión cerrada");
        process.exit();
    });
})();
