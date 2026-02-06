import WebSocket from "ws";
import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const me = process.argv[2];
const peer = process.argv[3];
const roomKey = "sa656ksjkncks7dabjca7";
const secretToken = process.argv[4];

if (!secretToken) {
    console.error("Error: Debes proporcionar un secretToken como cuarto argumento.");
    console.error("Uso: node client.js <tu_nombre> <nombre_peer> <secretToken>");
    process.exit(1);
}

// Reemplaza por la IP real de tu PC servidor
const ws = new WebSocket("ws://10.41.1.171:8090");

ws.on("open", () => {
    ws.send(JSON.stringify({ type: "join", from: me, roomKey, secretToken }));
    prompt();
});

ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.type === "msg") {
        console.log(`\n[${msg.from}] ${msg.text}`);
    }
    if (msg.type === "error") {
        console.error(`\n[ERROR] ${msg.message}`);
        process.exit(1);
    }
});

function prompt() {
    rl.question("> ", (line) => {
        ws.send(JSON.stringify({ type: "msg", from: me, to: peer, text: line, roomKey }));
        prompt();
    });
}