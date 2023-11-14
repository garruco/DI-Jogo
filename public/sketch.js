let x;
let y;
let sala;
let i;
let currentRoom = [];
let itens = [];
let players = [];

let atual;

//Array com a posicao fixa de cada sala
let salaX = [150, 225, 275, 525, 525];
let salaY = [225, 375, 625, 225, 475];

//Imagem da planta
let planta;

function preload() {
  planta = loadImage("assets/planta.jpg");
}

function setup() {
  createCanvas(800, 800);

  //GUI - Pode precisar de ser mudado conforme outros rects que ponhamos later on
  rectMode(CENTER);

  const socket = io.connect();

  // -- MOVIMENTOS --

  //Quando recebe evento do socket
  socket.on("updateGame", function (data) {
    // Atualiza posições dos jogadores
    //GUI - Não entendo bem esta cena aqui do const e tal, preciso de uma explicação; se o apagar o código funciona igual somehow
    for (const [playerId, position] of Object.entries(data.players)) {
      x = position.x * 100;
      y = position.y * 100;
      sala = position.sala;
      currentRoom[atual] = sala;
      atual++;
    }
    //console.log(data);
    atual = 0;
  });

  //Instancia cada um dos itens
  for (let i = 0; i < 4; i++) {
    //GUI - Aqui vale a pena indexar os IDs a partir do 1? Ou era melhor fazer a partir de 0?
    itens.push(new item(i + 1, i + 1, 0));
  }

  //GUI - Este array currentRoom serve para quê? Não podia estar dentro da própria classe e ser acedido por lá?
  //Room IDs dos Players
  for (let i = 0; i < 3; i++) {
    currentRoom.push(i + 1);
    //console.log(currentRoom[i]);
  }

  //Instancia os 3 players
  for (let i = 0; i < 3; i++) {
    //GUI - Idem quanto à indexação, só um small issue
    players.push(new player(i + 1, i + 1, currentRoom[i]));
  }
}

function draw() {
  background(220);

  image(planta, 0, 0, 800, 800);

  //movimento dos jogadores (x é = ao ID da sala, y é = ao ID do player)
  /*
  if (y == 100) {
    if (x == 0) {
      currentRoom[0] = 1;
    } else if (x == 100) {
      currentRoom[0] = 2;
    } else if (x == 200) {
      currentRoom[0] = 3;
    } else if (x == 300) {
      currentRoom[0] = 4;
    } else if (x == 400) {
      currentRoom[0] = 5;
    }
  } else if (y == 200) {
    if (x == 0) {
      currentRoom[1] = 1;
    } else if (x == 100) {
      currentRoom[1] = 2;
    } else if (x == 200) {
      currentRoom[1] = 3;
    } else if (x == 300) {
      currentRoom[1] = 4;
    } else if (x == 400) {
      currentRoom[1] = 5;
    }
  } else if (y == 300) {
    if (x == 0) {
      currentRoom[2] = 1;
    } else if (x == 100) {
      currentRoom[2] = 2;
    } else if (x == 200) {
      currentRoom[2] = 3;
    } else if (x == 300) {
      currentRoom[2] = 4;
    } else if (x == 400) {
      currentRoom[2] = 5;
    }
  }
  */

  //Desenha os players na sua sala atual
  for (let i = 0; i < players.length; i++) {
    players[i].display(currentRoom[i]);
  }

  //Desenha os itens na sua sala atual
  for (let i = 0; i < itens.length; i++) {
    itens[i].display();
  }
}

//classe Itens de Jogo
class item {
  constructor(itemID, currentRoom, playerID) {
    this.playerID = playerID;
    this.currentRoom = currentRoom;
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
    if (this.currentRoom == 1) {
      x = 200;
      y = 200;
    } else if (this.currentRoom == 2) {
      x = 600;
      y = 600;
    } else if (this.currentRoom == 3) {
      x = 450;
      y = 70;
    } else if (this.currentRoom == 4) {
      x = 700;
      y = 40;
    } else if (this.currentRoom == 5) {
      x = 500;
      y = 100;
    }

    //Ainda preciso de rever isto, poupa imenso código mas depois ainda temos de fazer offsets individuais para cada sala
    //x = salaX[this.currentRoom];
    //y = salaY[this.currentRoom];

    if (this.currentRoom != 0 && this.visibility == true) {
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
    if (playerRoom == this.currentRoom) {
      this.currentRoom = 0;
      this.playerID = newPlayerID;
    }
  }

  largar(newRoomID) {
    this.currentRoom = newRoomID;
    this.playerID = 0;
  }

  encontrar(playerRoom) {
    if (playerRoom == this.currentRoom) {
      this.visibility = true;
    }
  }

  esconder(playerRoom) {
    if (playerRoom == this.currentRoom) {
      this.visibility = false;
    }
  }
}

//classe Players
class player {
  constructor(playerID, colourID, currentRoom) {
    this.playerID = playerID;
    this.currentRoom = currentRoom;
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
    this.currentRoom = newRoomID;

    if (this.playerID == 1) {
      colour = "pink";
    } else if (this.playerID == 2) {
      colour = "purple";
    } else if (this.playerID == 3) {
      colour = "blue";
    }

    /*
    if (this.currentRoom == 1) {
      x = 190;
      y = 200;
    } else if (this.currentRoom == 2) {
      x = 290;
      y = 200;
    } else if (this.currentRoom == 3) {
      x = 390;
      y = 200;
    } else if (this.currentRoom == 4) {
      x = 490;
      y = 200;
    } else if (this.currentRoom == 5) {
      x = 590;
      y = 200;
    }
    */

    //Esta cena do '-1' nao precisa de estar aqui se indexarmos os ids a partir de 0 em vez de comecar em 1
    x = salaX[this.currentRoom];
    y = salaY[this.currentRoom];

    fill(colour);
    rect(x, y, 80, 80);
  }
}
