import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = process.env.PORT || 3000;
const clients = {};

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("socket connected");
  const client = {
    id: socket.id,
    color: Math.random() > 0.5 ? "red" : "blue",
    x: 0,
    y: 0,
  };
  clients[client.id] = client;
  io.emit("players", clients);

  socket.on("disconnect", () => {
    console.log("socket disconnected");
    // sends this event to all other clients with specified content
    // socket.broadcast.emit("player left", socket.id);
    // sends this to all clients
    io.emit("player left", socket.id);
    delete clients[socket.id];
  });

  // socket.on("newClient", (username) => {
  //   console.log("new client ", username);

  //   io.emit("newClient", client);
  // });

  socket.on("message", (message) => {
    console.log("from client: ", message);
    io.emit("message", message);
  });

  socket.on("updatePos", (pos) => {
    console.log("new pos: ", pos);
    clients[socket.id].x = pos[0];
    clients[socket.id].y = pos[1];
    io.emit("players", clients);
  });
});

httpServer.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
