const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/jogo", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/jogo.html"));
});

app.get("/mobile", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/mobile.html"));
});

app.get("/context", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/context.html"));
});

app.get("/context_mobile", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/context_mobile.html"));
});
// Cores disponíveis para os jogadores
const availableColors = ["red", "blue", "green", "yellow"];
let players = {};
let connectedPlayersCount = 0;
let playersClickedContinue1 = 0;
let playersClickedContinue2 = 0;

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
    color: 1,
    char: 1,
  };

  // Envie entrada do player para o frontend
  io.emit("addPlayer", socket.id);

  

  // characters
  socket.on("submit", (data) => {
    if (players[socket.id]) {
      players[socket.id].color = parseInt(data.col);
      players[socket.id].char = parseInt(data.char);
      console.log(data.col, data.char);
      console.log(players[socket.id].char);
      io.emit("submit", socket.id);
      io.emit("submit", { players });
  
      // Increment the count when a player clicks "Continue1"
      playersClickedContinue1++;
  
      // If all three players clicked "Continue1", emit an event to switch context
      if (playersClickedContinue1 === 3) {
        io.emit("switchContext", "/context2");
      }

      playersClickedContinue2++;

      // If all three players clicked "Continue2", emit an event to switch context to jogo.html
      if (playersClickedContinue2 === 3) {
        io.emit("switchContext", "/jogo");
      }
      
    }
  });
  

  socket.on("continue1Clicked", () => {
    socket.broadcast.emit("continue1Clicked");
  });

  socket.on("continue2Clicked", () => {
    playersClickedContinue2++;

    if (playersClickedContinue2 === 3) {
    io.emit("switchContext", "/jogo");
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

  socket.on("action", (data) => {
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
