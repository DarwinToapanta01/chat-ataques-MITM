// server.js
import { WebSocketServer } from "ws";

const PORT = 8090;
const ROOM_KEY = "12345"; // El identificador de la sala
const wss = new WebSocketServer({ port: PORT });

// --- CAMBIOS AQUÍ ---
// Mapa para guardar el token esperado para cada sala.
// En un sistema real, esto estaría en una base de datos.
// Por ahora, lo hardcodeamos para nuestra sala de prueba.
const roomSecrets = new Map();
roomSecrets.set(ROOM_KEY, "miTokenSuperSecreto123"); // ¡Este es el secreto a proteger!
// --- FIN DE CAMBIOS ---

const clients = new Map(); // Guarda los clientes conectados y validados

wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
        let msg;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            return;
        }
        const { type, from, to, text, roomKey, secretToken } = msg;

        // ---- join ----
        if (type === "join") {
            if (roomKey !== ROOM_KEY) {
                ws.send(JSON.stringify({ type: "error", message: "Invalid room key" }));
                return;
            }

            // --- CAMBIOS AQUÍ ---
            const expectedToken = roomSecrets.get(roomKey);
            if (secretToken !== expectedToken) {
                console.log(`[SERVER] Intento de unión fallido para '${from}'. Token incorrecto.`);
                ws.send(JSON.stringify({ type: "error", message: "Authentication failed: Invalid secret token." }));
                ws.close(); // Cerramos la conexión inmediatamente
                return;
            }
            // --- FIN DE CAMBIOS ---

            clients.set(from, ws);
            console.log(`[SERVER] ${from} se unió a la sala ${roomKey} (AUTENTICADO)`);
            return;
        }

        // ---- mensaje ----
        if (type === "msg") {
            // No necesitamos validar el token aquí porque ya se validó en el 'join'.
            // Cualquier cliente que llegue aquí es "de confianza".
            console.log("MENSAJE INTERCEPTADO");
            console.log("RoomKey:", roomKey);
            console.log("De:", from);
            console.log("Para:", to);
            console.log("Contenido:", text);

            // Modificación silenciosa (el ataque MITM sigue funcionando)
            const modifiedText = `${text} [intercepted]`;
            const target = clients.get(to);
            if (target) {
                target.send(JSON.stringify({ type: "msg", from, text: modifiedText }));
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

console.log(`Servidor "seguro" en ws://localhost:${PORT}`);