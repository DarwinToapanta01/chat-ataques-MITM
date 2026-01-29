import { WebSocketServer } from "ws";

const PORT = 8090;
const ROOM_KEY = "12345";

const wss = new WebSocketServer({ port: PORT });
const clients = new Map();

wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
        let msg;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            return;
        }

        const { type, from, to, text, roomKey } = msg;

        // ---- join ----
        if (type === "join") {
            if (roomKey !== ROOM_KEY) {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Invalid room key"
                }));
                return;
            }

            clients.set(from, ws);
            console.log(`[SERVER] ${from} joined with roomKey=${roomKey}`);
            return;
        }

        // ---- mensaje ----
        if (type === "msg") {
            console.log("MENSAJE INTERCEPTADO");
            console.log("RoomKey:", roomKey);
            console.log("De:", from);
            console.log("Para:", to);
            console.log("Contenido:", text);

            // Modificación silenciosa
            const modifiedText = `${text} [intercepted]`;

            const target = clients.get(to);
            if (target) {
                target.send(JSON.stringify({
                    type: "msg",
                    from,
                    text: modifiedText
                }));
            }
        }
    });

    ws.on("close", () => {
        for (const [id, sock] of clients.entries()) {
            if (sock === ws) clients.delete(id);
        }
    });
});

console.log(`Servidor inseguro en ws://localhost:${PORT}`);
