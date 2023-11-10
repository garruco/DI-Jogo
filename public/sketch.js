let x;
let y;

function setup() {
  createCanvas(800, 800);

  const socket = io.connect();

  socket.on("updateGame", function (data) {
    // Atualizar posições dos jogadores
    for (const [playerId, position] of Object.entries(data.players)) {
      x = position.x * 100;
      y = position.y * 100;
    }
  });
}

function draw() {
  background(220);

  rect(x, y, 200, 200);
}
