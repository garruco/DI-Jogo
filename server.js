const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/jogo.html"));
});

app.get("/mobile", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/mobile.html"));
});

app.get("/context", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/context.html"));
});

// Cores disponíveis para os jogadores
const availableColors = ["red", "blue", "green", "yellow"];
let players = {};
let connectedPlayersCount = 0;

io.on("connection", (socket) => {
  console.log("Um jogador conectou-se:", socket.id);
  connectedPlayersCount++;

  if (connectedPlayersCount === 4) {
    // Emit an event to trigger redirection on the client side
    io.emit("redirect", "/context");
  }

  // Atribui características a cada player
  players[socket.id] = {
    playerID: socket.id,
    sala: 1,
    action: 3,
    color: "green",
  };

  // Envie entrada do player para o frontend
  io.emit("addPlayer", socket.id);

  // characters
  socket.on("submit", (data) => {
    if (players[socket.id]) {
      players[socket.id].cores = data.col;
      console.log(data.col, data.char);
      io.emit("changeActor", socket.id);
      io.emit("updateGame", { players });
    }
  });

  // mover
  socket.on("move", (data) => {
    if (players[socket.id]) {
      players[socket.id].sala = data.sala;
      players[socket.id].action = data.action;
      console.log("O jogador" + socket.id + "moveu-se para a sala" + data.sala);
      io.emit("changeActor", socket.id);
      io.emit("updateGame", { players });
    }
  });



  socket.on("steal", (data) => {
    if (players[socket.id]) {
      players[socket.id].action = data.action;
      io.emit("changeActor", socket.id);
      io.emit("updateGame", { players });
    }
  });

  socket.on("disconnect", () => {
    console.log("Jogador desconectou-se:", socket.id);
    connectedPlayersCount--;

    // Devolver a cor ao conjunto de cores disponíveis
    if (players[socket.id]) {
      availableColors.push(players[socket.id].color);
    }
    delete players[socket.id];
    io.emit("removePlayer", socket.id);

    // Check if three players are connected after a player disconnects

  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});