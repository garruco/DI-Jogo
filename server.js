const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path"); // Adicionado para lidar com caminhos de diretório

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve arquivos estáticos do diretório 'public'
app.use(express.static(path.join(__dirname, "public")));

// Serve a página principal (ecrã partilhado)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

// Serve a interface do telemóvel
app.get("/mobile", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/mobile.html"));
});

// Lista de jogadores conectados
let players = [];

io.on("connection", (socket) => {
  console.log("Um jogador conectou-se:", socket.id);

  // Adicionar jogador à lista
  players.push(socket.id);
  if (players.length > 3) {
    socket.emit("error", "Máximo de 3 jogadores atingido");
    socket.disconnect();
    return;
  }

  // Enviar atualizações para o ecrã partilhado
  io.emit("updateScreen", { players });

  // Ouvir movimentos do jogador
  socket.on("move", (data) => {
    console.log(
      `Jogador ${socket.id} quer ${data.action} na direção ${data.direction}`
    );

    // Aqui, pode adicionar lógica para processar o movimento, como atualizar a posição do personagem

    // Enviar atualizações para todos os jogadores e ecrã partilhado
    io.emit("updateGame", {
      message: `Jogador ${socket.id} moveu-se para ${data.direction}`,
    });
  });

  socket.on("disconnect", () => {
    console.log("Jogador desconectou-se:", socket.id);
    players = players.filter((player) => player !== socket.id);
    io.emit("updateScreen", { players });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
