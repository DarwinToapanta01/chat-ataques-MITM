import WebSocket from "ws";
import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const me = process.argv[2];
const peer = process.argv[3];
const roomKey = "12345";

const ws = new WebSocket("ws://localhost:8090");

ws.on("open", () => {
    ws.send(JSON.stringify({
        type: "join",
        from: me,
        roomKey
    }));
    prompt();
});

ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.type === "msg") {
        console.log(`\n[${msg.from}] ${msg.text}`);
    }
});

function prompt() {
    rl.question("> ", (line) => {
        ws.send(JSON.stringify({
            type: "msg",
            from: me,
            to: peer,
            text: line,
            roomKey
        }));
        prompt();
    });
}