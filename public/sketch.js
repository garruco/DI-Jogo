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

//classe Itens de Jogo
class item {
  constructor(itemID, roomID, playerID) {
    this.playerID = playerID;
    this.roomID = roomID;
    this.itemID = itemID;

    let visibility = false;
  }

  display() {
    let x;
    let y;
    let colour;

    if (itemID == 1) {
      colour = color("green");
    } else if (itemID == 2) {
      colour = color("red");
    } else if (itemID == 3) {
      colour = color("blue");
    } else if (itemID == 4) {
      colour = color("yellow");
    }

    //Na planta
    if (roomID == 1) {
      x = 20;
      y = 20;
    } else if (roomID == 2) {
      x = 60;
      y = 60;
    } else if (roomID == 3) {
      x = 60;
      y = 40;
    } else if (roomID == 4) {
      x = 30;
      y = 40;
    } else if (roomID == 5) {
      x = 50;
      y = 10;
    }

    if (this.roomID != 0 && this.visibility == true) {
      fill(colour);
      circle(x, y, 50);
    }

    //No Inventário

    if (playerID == 1) {
      x = 100;
      y = 20;
    } else if (playerID == 2) {
      x = 100;
      y = 60;
    } else if (playerID == 3) {
      x = 100;
      y = 80;
    }

    if (this.playerID != 0) {
      fill(colour);
      circle(x, y, 50);
    }
  }

  guardar(newPlayerID) {
    this.roomID = 0;
    this.playerID = newPlayerID;
  }

  largar(newRoomID) {
    this.roomID = newRoomID;
    this.playerID = 0;
  }

  encontrar() {
    this.visibility = true;
  }

  esconder() {
    this.visibility = false;
  }
}

//classe Players
class player {
  constructor(playerID, colourID, roomID) {
    this.playerID = playerID;
    this.roomID = roomID;
    this.colourID = colourID;
  }

  display() {
    let x;
    let y;
    let colour;

    if (colourID == 1) {
      colour = color("pink");
    } else if (colourID == 2) {
      colour = color("purple");
    } else if (colourID == 3) {
      colour = color("blue");
    }

    if (roomID == 1) {
      x = 20;
      y = 20;
    } else if (roomID == 2) {
      x = 60;
      y = 60;
    } else if (roomID == 3) {
      x = 60;
      y = 40;
    } else if (roomID == 4) {
      x = 30;
      y = 40;
    } else if (roomID == 5) {
      x = 50;
      y = 10;
    }
    fill(colour);
    circle(x, y, 50);
  }

  updateRoomID(newRoomID) {
    this.roomID = newRoomID;
  }
}
