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
//GUI - Estas são as cores dos itens, por isso alguma coisa ta meio perdida aqui
const availableColors = ["red", "blue", "green", "yellow"];
let players = {};

io.on("connection", (socket) => {
  console.log("Um jogador conectou-se:", socket.id);

  //Se ultrapassar os 3 players
  if (Object.keys(players).length >= 4) {
    socket.emit("error", "Máximo de 3 jogadores atingido");
    socket.disconnect();
    return;
  }

  // Atribuir uma cor ao jogador
  const playerColor = availableColors.pop();
  //Se não sobrarem cores
  if (!playerColor) {
    socket.emit("error", "Não há mais cores disponíveis");
    socket.disconnect();
    return;
  }

  //GUI - Não faço ideia o que isto faz
  socket.emit("yourColor", playerColor);

  //Atribui caracteristicas a cada player
  //GUI - Este socket id dava jeito para passar para o frontend e atribuir como controlador individual de cada boneco
  players[socket.id] = {
    playerID: socket.id,
    sala: 1,
    color: playerColor,
  };

  //Envia entrada do player para o frontend
  //GUI - Neste momento isto não vai para lado nenhum!!
  io.emit("updateScreen", { players });

  //mover
  //GUI - Aqui este .x e meio burro, nao sei pq e que e preciso ngl mas so com ele e que funciona
  socket.on("move", (data) => {
    if (players[socket.id]) {
      players[socket.id].sala = data.sala;
      console.log("O jogador" + socket.id + "moveu-se para a sala" + data.sala);
      io.emit("updateGame", { players });
    }
  });

  socket.on("pickup", (data) => {
    if (players[socket.id]) {
      io.emit("pickup", players[socket.id]);
    }
  });

  socket.on("drop", (data) => {
    if (players[socket.id]) {
      io.emit("drop", players[socket.id]);
    }
  });

  socket.on("search", (data) => {
    if (players[socket.id]) {
      io.emit("search", players[socket.id]);
    }
  });

  socket.on("hide", (data) => {
    if (players[socket.id]) {
      io.emit("hide", players[socket.id]);
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
