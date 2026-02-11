const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

const rooms = {}; 

console.log("Servidor WebSocket escuchando en puerto 8080");

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    const msg = JSON.parse(data);

    // Unirse a una sala
    if (msg.type === "join") {
      const { room, password, user } = msg;

      if (!rooms[room]) {
        rooms[room] = { password, users: {} };
      }

      if (rooms[room].password !== password) {
        ws.send(JSON.stringify({ type: "error", message: "Contraseña incorrecta" }));
        return;
      }

      rooms[room].users[user] = ws;
      ws.room = room;
      ws.user = user;

      ws.send(JSON.stringify({ type: "info", message: `Conectado a la sala ${room}` }));
      console.log(`${user} se unió a ${room}`);
    }

    // Enviar mensaje privado
    if (msg.type === "message") {
      const { to, message } = msg;
      const room = ws.room;

      if (rooms[room]?.users[to]) {
        rooms[room].users[to].send(JSON.stringify({
          type: "message",
          from: ws.user,
          message
        }));
      } else {
        ws.send(JSON.stringify({
          type: "error",
          message: "Usuario no encontrado en la sala"
        }));
      }
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      delete rooms[ws.room].users[ws.user];
      console.log(`${ws.user} salió de ${ws.room}`);
    }
  });
});
