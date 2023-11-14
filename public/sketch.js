let x;
let y;
let i;
let roomID = [];
let itens = [];
let players = [];

function setup() {
  createCanvas(800, 800);

  const socket = io.connect();

  //mover
  socket.on("updateGame", function (data) {
    // Atualizar posições dos jogadores
    for (const [playerId, position] of Object.entries(data.players)) {
      x = position.x * 100;
      y = position.y * 100;
    }
  });

  //itens
  for (let i = 0; i < 4; i++) {
    itens.push(new item(i + 1, i + 1, 0));
  }

  //Room IDs dos Players
  for (let i = 0; i < 3; i++) {
    roomID.push(i + 1);
    //console.log(roomID[i]);
  }

  //3 Players
  for (let i = 0; i < 3; i++) {
    players.push(new player(i + 1, i + 1, roomID[i]));
  }
}

function draw() {
  background(220);

  //movimento dos jogadores (x é = ao ID da sala, y é = ao ID do player)
  if (y == 100) {
    if (x == 0) {
      roomID[0] = 1;
    } else if (x == 100) {
      roomID[0] = 2;
    } else if (x == 200) {
      roomID[0] = 3;
    } else if (x == 300) {
      roomID[0] = 4;
    } else if (x == 400) {
      roomID[0] = 5;
    }
  } else if (y == 200) {
    if (x == 0) {
      roomID[1] = 1;
    } else if (x == 100) {
      roomID[1] = 2;
    } else if (x == 200) {
      roomID[1] = 3;
    } else if (x == 300) {
      roomID[1] = 4;
    } else if (x == 400) {
      roomID[1] = 5;
    }
  } else if (y == 300) {
    if (x == 0) {
      roomID[2] = 1;
    } else if (x == 100) {
      roomID[2] = 2;
    } else if (x == 200) {
      roomID[2] = 3;
    } else if (x == 300) {
      roomID[2] = 4;
    } else if (x == 400) {
      roomID[2] = 5;
    }
  }

  for (let i = 0; i < players.length; i++) {
    players[i].display(roomID[i]);
  }

  for (let i = 0; i < itens.length; i++) {
    itens[i].display();
  }
}

//classe Itens de Jogo
class item {
  constructor(itemID, roomID, playerID) {
    this.playerID = playerID;
    this.roomID = roomID;
    this.itemID = itemID;

    this.visibility = true;
  }

  display() {
    let x;
    let y;
    let colour;

    if (this.itemID == 1) {
      colour = "green";
    } else if (this.itemID == 2) {
      colour = "red";
    } else if (this.itemID == 3) {
      colour = "blue";
    } else if (this.itemID == 4) {
      colour = "yellow";
    }

    //Na planta
    if (this.roomID == 1) {
      x = 200;
      y = 200;
    } else if (this.roomID == 2) {
      x = 600;
      y = 600;
    } else if (this.roomID == 3) {
      x = 450;
      y = 70;
    } else if (this.roomID == 4) {
      x = 700;
      y = 40;
    } else if (this.roomID == 5) {
      x = 500;
      y = 100;
    }

    if (this.roomID != 0 && this.visibility == true) {
      fill(colour);
      circle(x, y, 50);
    }

    //No Inventário

    if (this.playerID == 1) {
      x = 100;
      y = 20;
    } else if (this.playerID == 2) {
      x = 100;
      y = 60;
    } else if (this.playerID == 3) {
      x = 100;
      y = 80;
    }

    if (this.playerID != 0) {
      fill(colour);
      circle(x, y, 50);
    }
  }

  guardar(newPlayerID, playerRoom) {
    if (playerRoom == this.roomID) {
      this.roomID = 0;
      this.playerID = newPlayerID;
    }
  }

  largar(newRoomID) {
    this.roomID = newRoomID;
    this.playerID = 0;
  }

  encontrar(playerRoom) {
    if (playerRoom == this.roomID) {
      this.visibility = true;
    }
  }

  esconder(playerRoom) {
    if (playerRoom == this.roomID) {
      this.visibility = false;
    }
  }
}

//classe Players
class player {
  constructor(playerID, colourID, roomID) {
    this.playerID = playerID;
    this.roomID = roomID;
    this.colourID = colourID;
  }

  displayTeste(xValue, yValue) {
    this.x = xValue;
    this.y = yValue;
    fill("pink");
    rect(x, y, 80, 80);
  }

  display(newRoomID) {
    let x;
    let y;
    let colour;
    this.roomID = newRoomID;

    if (this.colourID == 1) {
      colour = "pink";
    } else if (this.colourID == 2) {
      colour = "purple";
    } else if (this.colourID == 3) {
      colour = "blue";
    }

    if (this.roomID == 1) {
      x = 190;
      y = 200;
    } else if (this.roomID == 2) {
      x = 290;
      y = 200;
    } else if (this.roomID == 3) {
      x = 390;
      y = 200;
    } else if (this.roomID == 4) {
      x = 490;
      y = 200;
    } else if (this.roomID == 5) {
      x = 590;
      y = 200;
    }

    fill(colour);
    rect(x, y, 80, 80);
  }
}
