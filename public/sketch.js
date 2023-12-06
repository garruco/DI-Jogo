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

let ator = 0;
let turnoAtual = 0;

//lista de ações do bot: guardar 0, largar 1, procurar 2, esconder 3, mover 4
let lastBotMoves = [];
let isFirstMove = true;

//Array com a posicao fixa de cada sala
let salaX = [150, 225, 275, 550, 550];
let salaY = [175, 375, 650, 150, 450];

let salaXItem = [220, 425, 340, 750, 800];
let salaYItem = [200, 350, 800, 160, 475];

//Imagens
let planta,
  inventario,
  assassino,
  bobby,
  carter,
  emma,
  faca,
  arma,
  estatua,
  tesoura;

//Canvas
var w = window.innerWidth;
var h = window.innerHeight;

function preload() {
  planta = loadImage("assets/planta.png");
  inventario = loadImage("assets/inventory.png");

  bobby = loadImage("assets/bobby_ficha.png");
  carter = loadImage("assets/carter_ficha.png");
  emma = loadImage("assets/emma_ficha.png");
  assassino = loadImage("assets/assassino_ficha2.png");

  faca = loadImage("assets/faca.png");
  arma = loadImage("assets/arma.png");
  estatua = loadImage("assets/estatua.png");
  tesoura = loadImage("assets/tesoura.png");
}

function setup() {
  createCanvas(w, h);

  //GUI - Pode precisar de ser mudado conforme outros rects que ponhamos later on
  rectMode(CENTER);

  const socket = io.connect();

  socket.on("addPlayer", function (data) {
    if (players.length < 4) {
      players.push(new player(players.length, players.length, 0, data));
      currentItemAction.push(4);
    } else {
      for (let i = 0; i < 4; i++) {
        if (players[i] === null) {
          players[i] = new player(i, i, 0, data);
        }
      }
    }
    if (players.length == 4 && isFirstMove) startGame();
  });

  function startGame() {
    salaAIr = generateRandom(0, 4, [1]);
    currentRoom[ator] = salaAIr;
    console.log("1a jogada do bot: moveu-se para sala " + salaAIr);
    lastBotMoves.push(4); // mover = int 4
    ator++;
    turnoAtual++;
    isFirstMove = false;
  }

  socket.on("removePlayer", function (data) {
    console.log("Removi o player " + data);
    for (let i = 0; i <= players.length; i++) {
      if (players[i].socketID === data) {
        players[i] = null;
      }
    }
  });

  // -- MOVIMENTOS --
  socket.on("changeActor", function (data) {
    for (let i = 0; i < players.length; i++) {
      //Se o socket id corresponde ao actor que enviou o update

      if (players[i].socketID === data) {
        ator = i;
        console.log("O player " + i + " fez um pedido.");
      }
    }

    console.log(currentItemAction);
  });

  //Quando recebe evento do socket
  socket.on("updateGame", function (data) {
    // Atualiza posições dos jogadores
    //GUI - Não entendo bem esta cena aqui do const e tal, preciso de uma explicação; se o apagar o código funciona igual somehow
    for (const [burriceburra, player] of Object.entries(data.players)) {
      //
      //Se nao e o partilhado
      if (atual != 0) {
        //
        if (ator === turnoAtual && ator === atual) {
          //Recebe a acao tomada por cada player
          currentItemAction[ator] = player.action;

          if (player.action === 0) {
            console.log("O player " + ator + " guardou um item");
          } else if (player.action === 1) {
            console.log("O player " + ator + " largou um item");
          } else if (player.action === 2) {
            console.log("O player " + ator + " descobriu um item");
          } else if (player.action === 3) {
            console.log("O player " + ator + " escondeu um item");
          } else if (player.action === 4) {
            currentRoom[ator] = player.sala;
          }

          if (turnoAtual < 3) {
            turnoAtual++;
          } else {
            turnoAtual = 0;
          }
        }
      }
      atual++;
    }
    atual = 0;
  });

  socket.on("pickup", function (data) {
    for (const [burriceburra, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (guardar != 0) {
        currentItemAction[guardar] = player.action;
      }
      guardar++;
    }
    guardar = 0;
    console.log(currentItemAction);
  });

  socket.on("drop", function (data) {
    for (const [burriceburra, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (largar != 0) {
        currentItemAction[largar] = player.action;
      }
      largar++;
    }
    largar = 0;
    console.log(currentItemAction);
  });

  socket.on("search", function (data) {
    for (const [burriceburra, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (procurar != 0) {
        currentItemAction[procurar] = player.action;
      }
      procurar++;
    }
    procurar = 0;
    console.log(currentItemAction);
  });

  socket.on("hide", function (data) {
    for (const [burriceburra, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (esconder != 0) {
        currentItemAction[esconder] = player.action;
      }
      esconder++;
    }
    esconder = 0;
    console.log(currentItemAction);
  });

  //Instancia cada um dos itens
  itens.push(new item(0, 0, -1));
  itens.push(new item(1, 2, -1));
  itens.push(new item(2, 3, -1));
  itens.push(new item(3, 4, -1));

  //Room IDs dos Players
  for (let i = 0; i < 4; i++) {
    //Todos os players começam na mesma sala
    currentRoom.push(1);
  }
}

function generateRandom(min, max, exclude) {
  let random;
  while (!random) {
    const x = Math.floor(Math.random() * (max - min + 1)) + min;
    if (exclude.indexOf(x) === -1) random = x;
  }
  return random;
}

function draw() {
  background(46, 55, 47);

  console.log("turno" + turnoAtual + "ator " + ator);
  //lista de ações do bot: guardar 0, largar 1, procurar 2, esconder 3, mover 4
  if (!isFirstMove && turnoAtual == 0) {
    console.log("Jogada do bot:");
    // se a ultima jogada foi mover-se
    if (lastBotMoves[lastBotMoves.length - 1] == 4) {
      //caso esteja um item à vista, apanha-o
      for (let i = 0; i < itens.length; i++) {
        if (
          itens[i].itemCurrentRoom == currentRoom[0] &&
          itens[i].visibility == true &&
          itens[i].owner == -1
        ) {
          itens[i].guardar(0, currentRoom[0]);
          lastBotMoves.push(0); // guardar = int 0
          console.log("- bot a guardar item");
        }
      }
      //caso contrário, procura na sala
    }
    // se a ultima jogada foi guardar um item, volta à sala inicial
    else if (lastBotMoves[lastBotMoves.length - 1] == 0) {
      console.log("- bot a ir para sala 1");
      currentRoom[0] = 1;
      lastBotMoves.push(4); // mover = int 4
    }

    turnoAtual++;
  }

  push();
  textSize(30);
  fill(0);
  stroke(0);
  text(turnoAtual, 200, 200);
  pop();

  //planta
  image(planta, 50, 20, 950, 950);

  //inventário
  for (let i = 0; i < 4; i++) {
    image(inventario, w - 350, 0 + 150 * i);
  }

  //Desenha os players na sua sala atual
  for (let i = 0; i < players.length; i++) {
    players[i].display(currentRoom[i]);
  }

  //GUI - Aqui porque é que os itens nao seguem a mesma logica de cima de dar plug ao currentRoom?

  //Desenha os itens na sua sala atual
  for (let i = 0; i < itens.length; i++) {
    itens[i].display();
  }

  //Ações com itens
  // Verificar todos os pares player-item para ver quais partilham a mesma sala

  for (let i = 0; i < itens.length; i++) {
    //apanhar

    //Se o ator quer apanhar e o item nao e de ninguem e o ator tem o inv vazio
    if (
      currentItemAction[ator] == 0 &&
      itens[i].owner == -1 &&
      checkInv(ator) == false
    ) {
      itens[i].guardar(ator, currentRoom[ator]);
    }

    //largar
    if (
      currentItemAction[ator] == 1 &&
      itens[i].itemCurrentRoom == -1 &&
      itens[i].owner == ator
    ) {
      itens[i].largar(currentRoom[ator]);
    }

    //procurar
    if (currentItemAction[ator] == 2) {
      itens[i].encontrar(currentRoom[ator]);
    }

    //esconder
    if (currentItemAction[ator] == 3) {
      itens[i].esconder(currentRoom[ator]);
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
    let img;

    if (this.itemID == 0) {
      colour = color(0, 255, 0);
      img = tesoura;
    } else if (this.itemID == 1) {
      colour = color(255, 0, 0);
      img = faca;
    } else if (this.itemID == 2) {
      colour = color(0, 0, 255);
      img = arma;
    } else if (this.itemID == 3) {
      colour = color(255, 255, 0);
      img = estatua;
    }

    //Na planta

    //Ainda preciso de rever isto, poupa imenso código mas depois ainda temos de fazer offsets individuais para cada sala

    if (this.owner == -1 && this.visibility == true) {
      x = salaXItem[this.itemCurrentRoom];
      y = salaYItem[this.itemCurrentRoom];
      //fill(colour);
      //circle(x, y, 50);

      push();
      imageMode(CENTER);
      image(img, x, y, 80, 80);
      pop();
    } else if (this.owner == -1 && this.visibility == false) {
      //fill(200, 200, 200, 128);
      //circle(x, y, 50);
      /*
      push();
      imageMode(CENTER);
      image(img, x, y, 80, 80);
      pop();
      */
    }

    //No Inventário

    if (this.owner != -1) {
      if (this.owner == 0) {
        x = w - 230;
        y = 200;
      } else if (this.owner == 1) {
        x = w - 230;
        y = 350;
      } else if (this.owner == 2) {
        x = w - 230;
        y = 500;
      } else if (this.owner == 3) {
        x = w - 230;
        y = 650;
      }

      //fill(colour);
      //circle(x, y, 50);

      push();
      imageMode(CENTER);
      image(img, x, y, 80, 80);
      pop();
    }
  }

  //itens[i].guardar(ator, currentRoom[ator]);

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
  constructor(playerID, colourID, currentRoom, socketID) {
    this.playerID = playerID;
    this.currentRoom = currentRoom;
    this.colourID = colourID;
    this.neighbors = 0;
    this.offset = 0;
    this.socketID = socketID;
  }

  display(newRoomID) {
    let colour;
    let img;
    this.currentRoom = newRoomID;

    if (this.playerID == 0) {
      colour = (44, 28, 4);
      img = assassino;
    } else if (this.playerID == 1) {
      colour = "aqua";
      img = bobby;
    } else if (this.playerID == 2) {
      colour = "blue";
      img = carter;
    } else if (this.playerID == 3) {
      colour = "beige";
      img = emma;
    }

    for (let i = 0; i < players.length; i++) {
      if (i != this.playerID) {
        if (this.currentRoom === currentRoom[i]) {
          this.neighbors++;
        }
      }
    }

    switch (this.playerID) {
      case 0:
        this.offset = 0;
        break;
      case 1:
        if (this.currentRoom === currentRoom[0]) {
          this.offset = 1;
        } else if (this.currentRoom === currentRoom[2]) {
          this.offset = 0;
        }
        break;
      case 2:
        if (
          this.currentRoom === currentRoom[0] &&
          this.currentRoom === currentRoom[1]
        ) {
          this.offset = 2;
        } else if (
          (this.currentRoom === currentRoom[0] &&
            this.currentRoom !== currentRoom[1]) ||
          (this.currentRoom === currentRoom[1] &&
            this.currentRoom !== currentRoom[0])
        ) {
          this.offset = 1;
        } else {
          this.offset = 0;
        }
        break;
      case 3:
        if (
          this.currentRoom === currentRoom[0] &&
          this.currentRoom === currentRoom[1] &&
          this.currentRoom === currentRoom[2]
        ) {
          this.offset = 3;
        } else if (
          (this.currentRoom === currentRoom[0] &&
            this.currentRoom === currentRoom[1] &&
            this.currentRoom !== currentRoom[2]) ||
          (this.currentRoom === currentRoom[0] &&
            this.currentRoom === currentRoom[2] &&
            this.currentRoom !== currentRoom[1]) ||
          (this.currentRoom === currentRoom[1] &&
            this.currentRoom === currentRoom[2] &&
            this.currentRoom !== currentRoom[0])
        ) {
          this.offset = 2;
        } else if (
          (this.currentRoom === currentRoom[0] &&
            this.currentRoom !== currentRoom[1] &&
            this.currentRoom !== currentRoom[2]) ||
          (this.currentRoom === currentRoom[1] &&
            this.currentRoom !== currentRoom[0] &&
            this.currentRoom !== currentRoom[2]) ||
          (this.currentRoom === currentRoom[2] &&
            this.currentRoom !== currentRoom[0] &&
            this.currentRoom !== currentRoom[1])
        ) {
          this.offset = 1;
        } else {
          this.offset = 0;
        }
        break;
    }

    let x = salaX[this.currentRoom] + this.offset * 50;
    let y = salaY[this.currentRoom];

    push();
    fill(colour);
    rect(x, y, 80, 80);
    imageMode(CENTER);
    image(img, x, y, 130, 130);
    pop();

    fill(0);
    textSize(30);
    text(this.playerID, x, y);

    this.neighbors = 0;
    this.offset = 0;
  }
}

function checkInv(player) {
  let cheio = false;

  for (let i = 0; i < itens.length; i++) {
    if (itens[i].owner == ator) {
      cheio = true;
    }
  }

  return cheio;
}
