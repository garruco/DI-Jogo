const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/mobile", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/mobile.html"));
});

// Cores disponíveis para os jogadores
const availableColors = ["red", "blue", "green", "yellow"];
let players = {};

io.on("connection", (socket) => {
  console.log("Um jogador conectou-se:", socket.id);

  if (Object.keys(players).length >= 3) {
    socket.emit("error", "Máximo de 3 jogadores atingido");
    socket.disconnect();
    return;
  }

  // Atribuir uma cor ao jogador
  const playerColor = availableColors.pop();
  if (!playerColor) {
    socket.emit("error", "Não há mais cores disponíveis");
    socket.disconnect();
    return;
  }
  socket.emit("yourColor", playerColor);

  players[socket.id] = { x: 0, y: 0, color: playerColor };

  io.emit("updateScreen", { players });

  socket.on("move", (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      io.emit("updateGame", { players });
    }
  });

  socket.on("disconnect", () => {
    console.log("Jogador desconectou-se:", socket.id);
    // Devolver a cor ao conjunto de cores disponíveis
    if (players[socket.id]) {
      availableColors.push(players[socket.id].color);
    }
    delete players[socket.id];
    io.emit("updateScreen", { players });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
