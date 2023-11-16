let x;
let y;
let sala;
let i;
let currentRoom = [];
let currentItemAction = [];
let playerID = [];
let salas = [];
let itens = [];
let players = [];

let atual = 0;

let guardar = 0;
let largar = 0;
let esconder = 0;
let procurar = 0;

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
    for (const [burriceburra, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (atual != 0) {
        //Atualiza a posicao de todos os players: P1 = [0], P2 = [1], ...
        currentRoom[atual - 1] = player.sala;
        currentItemAction[atual - 1] = player.action;

        //PIPA - O Array 2D permite-nos associar a cada player um número (para ser mais fácil nas classes) e o ID atribuido ao player
        playerID[atual - 1] = [atual - 1, player.playerID];
        //console.log(playerID[atual - 1]);
      }
      atual++;
    }
    atual = 0;
  });

  socket.on("pickup", function (data) {
    //console.log("Player " + data.playerID + " quer apanhar.");
    //console.log(data.action);
    for (const [burriceburra, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (guardar != 0) {
        //Atualiza a ação (itens) de todos os players: P1 = [0], P2 = [1], ...
        currentItemAction[guardar - 1] = player.action;
      }
      guardar++;
    }
    guardar = 0;
    console.log(currentItemAction);
  });

  socket.on("drop", function (data) {
    //console.log("DROP");
    //console.log(data.action);
    for (const [burriceburra, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (largar != 0) {
        //Atualiza a ação (itens) de todos os players: P1 = [0], P2 = [1], ...
        currentItemAction[largar - 1] = player.action;
      }
      largar++;
    }
    largar = 0;
    console.log(currentItemAction);
  });

  socket.on("search", function (data) {
    console.log("SEARCH");
    //console.log("Player " + data.playerID + " quer apanhar.");
    console.log(data.action);
    for (const [burriceburra, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (procurar != 0) {
        //Atualiza a ação (itens) de todos os players: P1 = [0], P2 = [1], ...
        currentItemAction[procurar - 1] = player.action;
      }
      procurar++;
    }
    procurar = 0;
    console.log(currentItemAction);
  });

  socket.on("hide", function (data) {
    //console.log("HIDE");
    //console.log("Player " + data.playerID + " quer apanhar.");
    //console.log(data.action);
    for (const [burriceburra, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (esconder != 0) {
        //Atualiza a ação (itens) de todos os players: P1 = [0], P2 = [1], ...
        currentItemAction[esconder - 1] = player.action;
      }
      esconder++;
    }
    esconder = 0;
    console.log(currentItemAction);
  });

  //Instancia cada um dos itens
  for (let i = 0; i < 4; i++) {
    //GUI - Aqui vale a pena indexar os IDs a partir do 1? Ou era melhor fazer a partir de 0?
    itens.push(new item(i, i, -1));
  }

  //Room IDs dos Players
  for (let i = 0; i < 3; i++) {
    currentRoom.push(1);
  }

  //Action IDs dos Players (ultima ação realizada)
  for (let i = 0; i < 3; i++) {
    currentItemAction.push(4);
  }

  //Room IDs dos Players
  for (let i = 0; i < 3; i++) {
    playerID.push([i, 0]);
  }

  //Instancia os 3 players
  for (let i = 0; i < 3; i++) {
    players.push(new player(playerID[i][0], i, 0));
  }
}

function draw() {
  background(220);

  image(planta, 0, 0, 800, 800);

  //Desenha os players na sua sala atual
  for (let i = 0; i < players.length; i++) {
    players[i].display(currentRoom[i]);
  }

  //Desenha os itens na sua sala atual
  for (let i = 0; i < itens.length; i++) {
    itens[i].display();
  }

  //Ações com itens
  // Verificar todos os pares player-item para ver quais partilham a mesma sala
  for (let i = 0; i < itens.length; i++) {
    for (let j = 0; j < players.length; j++) {
      //guardar
      if (currentItemAction[j] == 0 && itens[i].owner == -1) {
        itens[i].guardar(j, currentRoom[j]);
      }

      //largar
      if (currentItemAction[j] == 1 && itens[i].itemCurrentRoom == -1) {
        itens[i].largar(currentRoom[j]);
      }

      //procurar
      if (currentItemAction[j] == 2) {
        itens[i].encontrar(currentRoom[j]);
      }

      //esconder
      if (currentItemAction[j] == 3) {
        itens[i].esconder(currentRoom[j]);
      }
    }
  }
}

//classe Itens de Jogo
class item {
  constructor(itemID, itemCurrentRoom, owner) {
    this.owner = owner;
    this.itemCurrentRoom = itemCurrentRoom;
    this.itemID = itemID;

    this.visibility = true;
  }

  display() {
    let x;
    let y;
    let colour;

    if (this.itemID == 0) {
      colour = "green";
    } else if (this.itemID == 1) {
      colour = "red";
    } else if (this.itemID == 2) {
      colour = "blue";
    } else if (this.itemID == 3) {
      colour = "yellow";
    }

    //Na planta

    //Ainda preciso de rever isto, poupa imenso código mas depois ainda temos de fazer offsets individuais para cada sala

    if (this.owner == -1 && this.visibility == true) {
      x = salaX[this.itemCurrentRoom];
      y = salaY[this.itemCurrentRoom];
      fill(colour);
      circle(x, y, 50);
    }

    //No Inventário

    if (this.owner != -1) {
      if (this.owner == 0) {
        x = 700;
        y = 100;
      } else if (this.owner == 1) {
        x = 700;
        y = 200;
      } else if (this.owner == 2) {
        x = 700;
        y = 300;
      }

      fill(colour);
      circle(x, y, 50);
    }
  }

  guardar(newOwner, playerRoom) {
    if (playerRoom == this.itemCurrentRoom) {
      this.itemCurrentRoom = -1;
      this.owner = newOwner;
    }
  }

  largar(playerRoom) {
    this.itemCurrentRoom = playerRoom;
    this.owner = -1;
  }

  encontrar(playerRoom) {
    if (playerRoom == this.itemCurrentRoom && this.visibility == false) {
      this.visibility = true;
    }
  }

  esconder(playerRoom) {
    if (playerRoom == this.itemCurrentRoom && this.visibility == true) {
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

  display(newRoomID) {
    let colour;
    this.currentRoom = newRoomID;

    if (this.playerID == 0) {
      colour = "pink";
    } else if (this.playerID == 1) {
      colour = "purple";
    } else if (this.playerID == 2) {
      colour = "blue";
    }

    //Esta cena do '-1' nao precisa de estar aqui se indexarmos os ids a partir de 0 em vez de comecar em 1
    x = salaX[this.currentRoom];
    y = salaY[this.currentRoom];

    fill(colour);
    rect(x, y, 80, 80);
  }
}
