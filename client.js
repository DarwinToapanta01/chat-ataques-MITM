// client.js
import WebSocket from "ws";
import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// --- CAMBIOS AQUÍ ---
// Recibimos el token secreto como 4º argumento
const me = process.argv[2];
const peer = process.argv[3];
const roomKey = "12345"; // Este sigue siendo el identificador de la sala
const secretToken = process.argv[4]; // El nuevo token de "seguridad"
// --- FIN DE CAMBIOS ---

if (!secretToken) {
    console.error("Error: Debes proporcionar un secretToken como cuarto argumento.");
    console.error("Uso: node client.js <tu_nombre> <nombre_peer> <secretToken>");
    process.exit(1);
}

const ws = new WebSocket("ws://localhost:8090");

ws.on("open", () => {
    // --- CAMBIOS AQUÍ ---
    // Enviamos el token junto con el mensaje de join
    ws.send(JSON.stringify({ type: "join", from: me, roomKey, secretToken }));
    // --- FIN DE CAMBIOS ---
    prompt();
});

ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.type === "msg") {
        console.log(`\n[${msg.from}] ${msg.text}`);
    }
    // --- CAMBIOS AQUÍ ---
    // Manejamos los mensajes de error del servidor
    if (msg.type === "error") {
        console.error(`\n[ERROR] ${msg.message}`);
        process.exit(1);
    }
    // --- FIN DE CAMBIOS ---
});

function prompt() {
    rl.question("> ", (line) => {
        // --- CAMBIOS AQUÍ ---
        // El token ya no es necesario en cada mensaje, solo en el join.
        // El servidor ya validó a este cliente.
        ws.send(JSON.stringify({ type: "msg", from: me, to: peer, text: line, roomKey }));
        // --- FIN DE CAMBIOS ---
        prompt();
    });
}