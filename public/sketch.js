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

let assassino, bobby, carter, emma, faca, arma, estatua, tesoura;

let atual = 0;

let guardar = 0;
let largar = 0;
let esconder = 0;
let procurar = 0;

let ator = 0;
let turnoAtual = 1;

//Array com a posicao fixa de cada sala
let salaX = [150, 225, 275, 525, 525];
let salaY = [225, 375, 625, 225, 475];

//Imagem da planta
let planta;

function preload() {
  planta = loadImage("assets/planta.png");

  bobby = loadImage("assets/bobby.png");
  carter = loadImage("assets/carter.png");
  emma = loadImage("assets/emma.png");
  assassino = loadImage("assets/assassino.png");

  faca = loadImage("assets/faca.png");
  arma = loadImage("assets/arma.png");
  estatua = loadImage("assets/estatua.png");
  tesoura = loadImage("assets/tesoura.png");
}

function setup() {
  createCanvas(800, 800);

  //GUI - Pode precisar de ser mudado conforme outros rects que ponhamos later on
  rectMode(CENTER);

  const socket = io.connect();

  // -- MOVIMENTOS --
  socket.on("changeActor", function (data) {
    for (let i = 0; i <= players.length - 1; i++) {
      //Se o socket id corresponde ao actor que enviou o update

      if (players[i].socketID === data) {
        ator = i;
        console.log("O player " + i + " fez um pedido.");
      }
    }
  });

  socket.on("addPlayer", function (data) {
    if (players.length < 4) {
      players.push(new player(players.length, players.length, 0, data));
    } else {
      for (let i = 0; i < 4; i++) {
        if (players[i] === null) {
          players[i] = new player(i, i, 0, data);
        }
      }
    }
  });

  socket.on("removePlayer", function (data) {
    console.log("Removi o player " + data);
    for (let i = 0; i <= players.length; i++) {
      if (players[i].socketID === data) {
        players[i] = null;
      }
    }
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
          currentRoom[ator] = player.sala;

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
          }

          if (turnoAtual < 3) {
            turnoAtual++;
          } else {
            turnoAtual = 1;
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
  for (let i = 0; i < 4; i++) {
    //Cada item começa sem owner (owner = -1)
    itens.push(new item(i, i, -1));
  }

  //Room IDs dos Players
  for (let i = 0; i < 4; i++) {
    //Todos os players começam na mesma sala
    currentRoom.push(1);
  }

  //Action IDs dos Players (ultima ação realizada)
  for (let i = 0; i < 3; i++) {
    currentItemAction.push(4);
  }

  //Instancia os 3 players
  /*
  for (let i = 0; i < 3; i++) {
    //O array de players começa com os placeholders, mas sem o respetivo socket id
    playerID.push([i, 0]);
    //GUI - Aqui na proxima meta podemos enviar todo este playerID para dentro da classe, e la depois usar o que der jeito
    players.push(new player(playerID[i][0], i, 0));
  }
  */
}

function draw() {
  background(220);

  console.log(turnoAtual);

  push();
  textSize(30);
  fill(0);
  stroke(0);
  text(turnoAtual, 200, 200);
  pop();

  image(planta, 0, 0, 800, 800);

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
    for (let j = 0; j < players.length; j++) {
      //guardar
      if (currentItemAction[j] == 0 && itens[i].owner == -1) {
        itens[i].guardar(j, currentRoom[j]);
      }

      /*
      if (currentItemAction[j] == 0 && itens[i].owner == -1) {
        for (let k = 0; k < itens.length; k++) {
          if (k != i && itens[k].owner == -1) {
            itens[k].guardar(j, currentRoom[j]);
            currentItemAction[j] = -1;
            console.log("HERE");
          }
        }
      }
      */
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
    let img;

    if (this.itemID == 0) {
      colour = color(0, 255, 0);
      img = tesoura;
    } else if (this.itemID == 1) {
      colour = color(255, 0, 0);
      img = estatua;
    } else if (this.itemID == 2) {
      colour = color(0, 0, 255);
      img = faca;
    } else if (this.itemID == 3) {
      colour = color(255, 255, 0);
      img = arma;
    }

    //Na planta

    //Ainda preciso de rever isto, poupa imenso código mas depois ainda temos de fazer offsets individuais para cada sala

    if (this.owner == -1 && this.visibility == true) {
      x = salaX[this.itemCurrentRoom];
      y = salaY[this.itemCurrentRoom];
      //fill(colour);
      //circle(x, y, 50);

      push();
      imageMode(CENTER);
      image(img, x, y, 80, 80);
      pop();
    } else if (this.owner == -1 && this.visibility == false) {
      //fill(200, 200, 200, 128);
      //circle(x, y, 50);

      push();
      imageMode(CENTER);
      image(img, x, y, 80, 80);
      pop();
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

      //fill(colour);
      //circle(x, y, 50);

      push();
      imageMode(CENTER);
      image(img, x, y, 80, 80);
      pop();
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
      colour = "pink";
      img = assassino;
    } else if (this.playerID == 1) {
      colour = "purple";
      img = bobby;
    } else if (this.playerID == 2) {
      colour = "blue";
      img = carter;
    } else if (this.playerID == 3) {
      colour = "red";
      img = emma;
    }

    for (let i = 0; i < 3; i++) {
      if (i != this.playerID) {
        if (this.currentRoom === currentRoom[i]) {
          this.neighbors++;
        }
      }
    }
    //console.log(this.neighbors);

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
    }

    let x = salaX[this.currentRoom] + this.offset * 50;
    let y = salaY[this.currentRoom];

    push();
    fill(colour);
    //rect(x, y, 80, 80);
    imageMode(CENTER);
    image(img, x, y, 100, 100);
    pop();

    fill(0);
    textSize(30);
    text(this.playerID, x, y);

    this.neighbors = 0;
    this.offset = 0;
  }
}
