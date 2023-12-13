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
let characters = [0, 1, 1, 1];
let colors = [0, 1, 1, 1];

let atual = 0;
let c_atual = 0;

let guardar = 0;
let largar = 0;
let esconder = 0;
let procurar = 0;

let ronda = 1;

let ator = 0;
let turnoAtual = 0;
let todas;

//lista de ações do bot: guardar 0, largar 1, procurar 2, esconder 3, mover 4
let lastBotMoves = [];
let isFirstMove = true;

//Imagens
let planta,
  inventario,
  inventario_assassino,
  assassino,
  bobby,
  carter,
  emma,
  faca,
  arma,
  estatua,
  tesoura;

//Canvas
let w = window.innerWidth - 50;
let h = window.innerHeight - 30;
let plantaOffset = 325;

//Array com a posicao fixa de cada sala
let salaX = [
  plantaOffset + 0.17 * h,
  plantaOffset + 0.25 * h,
  plantaOffset + 0.3 * h,
  plantaOffset + 0.7 * h,
  plantaOffset + 0.7 * h,
];
let salaY = [0.21 * h, 0.5 * h, 0.83 * h, 0.22 * h, 0.58 * h];
//let salaX = [375, 400, 475, 725, 725];
//let salaY = [140, 325, 560, 150, 400];

let salaXItem = [
  plantaOffset + 0.24 * h,
  plantaOffset + 0.35 * h,
  plantaOffset + 0.45 * h,
  plantaOffset + 0.83 * h,
  plantaOffset + 0.83 * h,
];
let salaYItem = [0.19 * h, 0.38 * h, 0.87 * h, 0.13 * h, 0.68 * h];
//let salaXItem = [420, 500, 575, 820, 820];
//let salaYItem = [125, 250, 590, 100, 500];

function preload() {
  planta = loadImage("assets/planta2.png");
  inventario = loadImage("assets/inventory.png");
  inventario_assassino = loadImage("assets/inventorykiller.png");

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

    //console.log(currentItemAction);
  });

  //Quando recebe evento do socket
  socket.on("updateGame", function (data) {
    // Atualiza posições dos jogadores
    //GUI - Não entendo bem esta cena aqui do const e tal, preciso de uma explicação; se o apagar o código funciona igual somehow
    for (const [cache, player] of Object.entries(data.players)) {
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
          } else if (player.action === 5) {
            console.log("O player " + ator + " roubou um item");
          }

          if (turnoAtual < 3) {
            turnoAtual++;
          } else {
            turnoAtual = 0;
            ronda++;
          }
        }
      }
      atual++;
    }
    atual = 0;
  });

  /*
  socket.on("pickup", function (data) {
    for (const [cache, player] of Object.entries(data.players)) {
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
    for (const [cache, player] of Object.entries(data.players)) {
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
    for (const [cache, player] of Object.entries(data.players)) {
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
    for (const [cache, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (esconder != 0) {
        currentItemAction[esconder] = player.action;
      }
      esconder++;
    }
    esconder = 0;
    console.log(currentItemAction);
  });

  socket.on("steal", function (data) {
    for (const [cache, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (roubar != 0) {
        currentItemAction[roubar] = player.action;
      }
      roubar++;
    }
    roubar = 0;
    console.log(currentItemAction);
  });
  */
  socket.on("submit", function (data) {
    console.log(data);
    for (const [cache, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (c_atual == 0) {
        colors[c_atual] = 0;
        characters[c_atual] = 0;
      }
      if (c_atual != 0) {
        colors[c_atual] = player.color;
        characters[c_atual] = player.char;
      }
      c_atual++;
    }
    c_atual = 0;
    console.log(colors, characters);
  });
  console.log(colors, characters);

  socket.on("action", function (data) {
    for (const [cache, player] of Object.entries(data.players)) {
      //Se nao e o partilhado
      if (playerAtual != 0) {
        currentItemAction[playerAtual] = player.action;
      }
      playerAtual++;
    }
    playerAtual = 0;
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

function jogoGanhoBot() {
  console.log("BOT GANHOU JOGO");
}

function draw() {
  background(46, 55, 47);

  push();
  textSize(25);
  fill(200);
  noStroke();
  textFont("Courier New");
  text(rondaToHour(ronda) + " AM", 55, 50 + 80);
  text("Player " + turnoAtual + "'s turn.", 55, 50 + 115);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("Bathroom", 485, 40);
  text("Hall", 325, 335);
  text("Kitchen", 385, 550);
  text("Bedroom", 1010, 140);
  text("Lounge", 1010, 390);
  pop();

  //planta
  push();
  imageMode(CORNER);
  image(planta, plantaOffset, 0, h, h);
  pop();

  //inventário
  for (let i = 0; i < 3; i++) {
    //texto
    push();
    textSize(20);
    fill(200);
    noStroke();
    textFont("Courier New");
    textAlign(LEFT, CENTER);
    text("Killer", 1190, 40);
    text("Player" + " " + (i + 1), 1190, 40 + 150 * (i + 1));
    pop();

    //imagem
    image(inventario_assassino, w - 300, -75 + 0, 300, 300);
    image(inventario, w - 300, -75 + 150 * (i + 1), 300, 300);
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

    //roubar
    if (
      currentItemAction[ator] == 5 &&
      itens[i].itemCurrentRoom == -1 &&
      itens[i].owner == 0
    ) {
      itens[i].roubar(ator, currentRoom[ator]);
    }
  }

  //console.log("turno" + turnoAtual + "ator " + ator);
  //lista de ações do bot: guardar 0, largar 1, procurar 2, esconder 3, mover 4
  botComItem = false;
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
          botComItem = true;
        }
      }
      if (
        lastBotMoves[lastBotMoves.length - 1] != 2 &&
        currentRoom[0] != 1 &&
        !botComItem
      ) {
        for (let i = 0; i < itens.length; i++)
          itens[i].encontrar(currentRoom[0]);
        lastBotMoves.push(2); // procurar = int 0
        console.log("- bot a procurar sala");
      }
    }
    // se a ultima jogada foi guardar um item
    else if (lastBotMoves[lastBotMoves.length - 1] == 0) {
      // verifica se continua com o item e volta para a primeira sala
      for (let i = 0; i < itens.length; i++) {
        if (itens[i].owner == 0) {
          console.log("- bot a ir para sala 1");
          currentRoom[0] = 1;
          lastBotMoves.push(5); // ir sala um com item para ganhar = int 5
          botComItem = true;
        }
      }
      // se foi roubado, vai para outra sala aleatória sem ser a inicial
      if (!botComItem) {
        salaAIr = generateRandom(0, 4, [1]);
        console.log("- bot a ir para sala " + salaAIr);
        currentRoom[0] = salaAIr;
        lastBotMoves.push(4); // mover = int 4
      }
    }
    // se estiver na primeira sala
    else if ((currentRoom[0] = 1)) {
      // verifica se continua com o item e ganha
      for (let i = 0; i < itens.length; i++) {
        if (itens[i].owner == 0) {
          currentRoom[0] = 1;
          if (lastBotMoves[lastBotMoves.length - 1] == 5) {
            jogoGanhoBot(displayResult("You Lost :("));
          } else if (lastBotMoves[lastBotMoves.length - 1] == 4) {
            lastBotMoves.push(5); // condição de ganhar = int 5
            console.log("entrei para ganhar");
          }
          botComItem = true;
        }
      } // vai para outra sala aleatória
      if (!botComItem) {
        salaAIr = generateRandom(0, 4, [1]);
        console.log("- bot a ir para sala " + salaAIr);
        currentRoom[0] = salaAIr;
        lastBotMoves.push(4); // mover = int 4
      }
    }
    turnoAtual++;
  }

  if (ronda == 9) {
    displayResult("You Won :)");
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
      image(img, x, y, h / 10, h / 10);
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
        x = w - 185;
        y = 115;
      } else if (this.owner == 1) {
        x = w - 185;
        y = 265;
      } else if (this.owner == 2) {
        x = w - 185;
        y = 415;
      } else if (this.owner == 3) {
        x = w - 185;
        y = 565;
      }

      //fill(colour);
      //circle(x, y, 50);

      push();
      imageMode(CENTER);
      image(img, x, y, 60, 60);
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

  roubar(newOwner, playerRoom) {
    if (playerRoom == currentRoom[0]) {
      this.itemCurrentRoom = -1;
      this.owner = newOwner;
    }
    console.log(
      "O player " +
        ator +
        " tentou roubar na sala " +
        currentRoom[ator] +
        " ao player " +
        this.owner
    );
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

    /*if (this.playerID == 0) {
      colour = (44, 28, 4);
      img = assassino;
    } else if (this.playerID == 1) {
      colour = "#c4f4c4";
      img = bobby;
    } else if (this.playerID == 2) {
      colour = "#c4f4c4";
      img = carter;
    } else if (this.playerID == 3) {
      colour = "#506c4c";
      img = emma;
    }*/

    if (this.playerID == 0) {
      colour = (44, 28, 4);
      img = assassino;
    } else if (this.playerID == 1) {
      if (colors[1] == 0) {
        colour = (44, 28, 4);
      } else if (colors[1] == 1) {
        colour = "#c4f4c4";
      } else if (colors[1] == 2) {
        colour = "#496e49";
      } else if (colors[1] == 3) {
        colour = "#1c646c";
      }

      if (characters[1] == 0) {
        img = assassino;
      } else if (characters[1] == 1) {
        img = bobby;
      } else if (characters[1] == 2) {
        img = carter;
      } else if (characters[1] == 3) {
        img = emma;
      }

      //img = bobby;
    } else if (this.playerID == 2) {
      if (colors[2] == 0) {
        colour = (44, 28, 4);
      } else if (colors[2] == 1) {
        colour = "#c4f4c4";
      } else if (colors[2] == 2) {
        colour = "#496e49";
      } else if (colors[2] == 3) {
        colour = "#1c646c";
      }

      if (characters[2] == 0) {
        img = assassino;
      } else if (characters[2] == 1) {
        img = bobby;
      } else if (characters[2] == 2) {
        img = carter;
      } else if (characters[2] == 3) {
        img = emma;
      }
      //img = carter;
    } else if (this.playerID == 3) {
      if (colors[3] == 0) {
        colour = (44, 28, 4);
      } else if (colors[3] == 1) {
        colour = "#c4f4c4";
      } else if (colors[3] == 2) {
        colour = "#496e49";
      } else if (colors[3] == 3) {
        colour = "#1c646c";
      }

      if (characters[3] == 0) {
        img = assassino;
      } else if (characters[3] == 1) {
        img = bobby;
      } else if (characters[3] == 2) {
        img = carter;
      } else if (characters[3] == 3) {
        img = emma;
      }
      //img = emma;
    }

    //assassino: colour = (44, 28, 4); - 0
    //light green: colour = "#c4f4c4"; - 1
    //dark green: colour = "#496e49"; - 2
    //blue: colour = "#1c646c"; - 3

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
    rect(x, y, h / 10, h / 10);
    imageMode(CENTER);
    image(img, x, y, h / 8, h / 8);
    pop();

    this.neighbors = 0;
    this.offset = 0;
  }
}

function displayResult(result) {
  // Create a div element
  let resultDiv = createDiv(result);

  // Style the div
  resultDiv.style("background-color", "rgba(255, 255, 255, 0.8)");
  resultDiv.style("padding", "20px");
  resultDiv.style("font-size", "10em");
  resultDiv.style("position", "absolute");
  resultDiv.style("top", "50%");
  resultDiv.style("left", "50%");
  resultDiv.style("transform", "translate(-50%, -50%)");

  // Set a class for styling if needed
  resultDiv.class("result-div");

  // Optionally, you can remove the div after a certain amount of time
  setTimeout(() => {
    resultDiv.remove();
  }, 5000); // Remove after 5 seconds (adjust the time as needed)
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

function rondaToHour(ronda) {
  switch (ronda) {
    case 1:
      return "00:00";
    case 2:
      return "00:30";
    case 3:
      return "01:00";
    case 4:
      return "01:30";
    case 5:
      return "02:00";
    case 6:
      return "02:30";
    case 7:
      return "03:00";
    case 8:
      return "03:30";
    case 9:
      return "04:00";
  }
}
