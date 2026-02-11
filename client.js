const WebSocket = require("ws");
const readline = require("readline");

const green = text => `\x1b[32m${text}\x1b[0m`;
const red = text => `\x1b[31m${text}\x1b[0m`;
const cyan = text => `\x1b[36m${text}\x1b[0m`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

(async () => {
    console.clear();
    console.log(`
░▒▓█▓▒░▒▓███████▓▒░ ░▒▓███████▓▒░▒▓████████▓▒░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓████████▓▒░       ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░▒▓████████▓▒░ 
░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░     
░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░     ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░             ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░     
░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░░▒▓██████▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓██████▓▒░        ░▒▓█▓▒░      ░▒▓████████▓▒░▒▓████████▓▒░ ░▒▓█▓▒░     
░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░     ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░             ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░     
░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░     
░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓████████▓▒░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░       ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░     
    `)
    console.log(":: Insecure Chat Console ::\n");
    console.log(green("[+] Initializing insecure channel...\n"));
    const user = await ask(cyan("┌─[ USER ]───────────────\n└──> "));
    const to = await ask(cyan("┌─[ TARGET ]─────────────\n└──> "));
    const ip = await ask(cyan("┌─[ SERVER IP ]──────────\n└──> "));
    const port = await ask(cyan("┌─[ SERVER PORT ]────────\n└──> "));
    const room = await ask(cyan("┌─[ ROOM ]───────────────\n└──> "));
    const password = await ask(cyan("┌─[ PASSWORD ]───────────\n└──> "));

    const ws = new WebSocket(`ws://${ip}:${port}`);
    console.log(green("\n[+] Parameters loaded"));
    console.log(green("[+] Establishing connection..."));
    console.log(red("[!] Encryption: NONE"));

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
        console.log("Conexión cerrada");
        process.exit();
    });
})();
