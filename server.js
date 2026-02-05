import { WebSocketServer } from "ws";
import os from 'os';

const PORT = 8090;
const ROOM_KEY = "12345";
const wss = new WebSocketServer({ port: PORT });
const roomSecrets = new Map();
roomSecrets.set(ROOM_KEY, "miTokenSuperSecreto123");
const clients = new Map();
const MITM_IDENTITY = "SERVER_MITM";

//Función para obtener la IP local
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost'; // Fallback si no encuentra una IP
}

wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
        let msg;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            return;
        }
        const { type, from, to, text, roomKey, secretToken } = msg;

        if (type === "join") {
            if (roomKey !== ROOM_KEY) {
                ws.send(JSON.stringify({ type: "error", message: "Invalid room key" }));
                return;
            }
            const expectedToken = roomSecrets.get(roomKey);
            if (secretToken !== expectedToken) {
                console.log(`[SERVER] Intento de unión fallido para '${from}'. Token incorrecto.`);
                ws.send(JSON.stringify({ type: "error", message: "Authentication failed: Invalid secret token." }));
                ws.close();
                return;
            }
            clients.set(from, ws);
            console.log(`[SERVER] ${from} se unió a la sala ${roomKey} (AUTENTICADO)`);
            return;
        }

        if (type === "msg") {
            console.log("--- MENSAJE INTERCEPTADO ---");
            console.log("RoomKey:", roomKey);
            console.log("De:", from);
            console.log("Para:", to);
            console.log("Contenido:", text);
            console.log("---------------------------");
            const modifiedText = `${text} [intercepted by MITM]`;
            const target = clients.get(to);
            if (target) {
                target.send(JSON.stringify({ type: "msg", from: MITM_IDENTITY, text: modifiedText }));
            } else {
                console.log(`[SERVER] No se encontró al destinatario: ${to}`);
            }
        }
    });

    ws.on("close", () => {
        for (const [id, sock] of clients.entries()) {
            if (sock === ws) clients.delete(id);
        }
    });
});

const localIP = getLocalIPAddress();
console.log(`Servidor "MITM" escuchando en ws://${localIP}:${PORT}`);
console.log(`Asegúrate de que el firewall permita conexiones en el puerto ${PORT}`);