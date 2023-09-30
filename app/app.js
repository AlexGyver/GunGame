// =================== DATA ===================
let ui;
let ws = null;
let game = null;
let calibrate = { r: 1000, g: 1000, b: 1000 };
let packet = null;
let config = { ip: '192.168.1.112', tresh: 50, size: 0.1, speed: 40, dark: false };

let data = {
  shot: null,
}
let assets = {
  shots: [],
  hits: [],
  sprites: { birds: {} },
};
let Colors = {
  Red: 0,
  Green: 1,
  Blue: 2,
  Yellow: 3,
  Cyan: 4,
  Magenta: 5,
  None: 6,
  codes: ['f00', '0f0', '00f', 'ff0', '0ff', 'f0f', '000']
}

let BirdsColors = ['Red', 'Yellow', 'Blue', 'Magenta'];

// =================== P5JS ===================
function preload() {
  for (let i = 0; i < 3; i++) {
    assets.shots.push(loadSound(`./assets/sound/shot${i}.mp3`));
  }
  for (let i = 0; i < 2; i++) {
    assets.hits.push(loadSound(`./assets/sound/hit${i}.mp3`));
  }
  
  assets.sprites['field'] = loadImage('./assets/images/field.png');

  for (let c of BirdsColors) {
    assets.sprites.birds[c] = new Array();
    for (let i = 0; i < 5; i++) {
      assets.sprites.birds[c].push(loadImage(`./assets/images/birds/${c}${i}.png`));
    }
  }
}

function setup() {
  if (localStorage.hasOwnProperty("calibrate")) {
    calibrate = JSON.parse(localStorage.getItem("calibrate"));
  }
  if (localStorage.hasOwnProperty("config")) {
    config = JSON.parse(localStorage.getItem("config"));
  }

  createCanvas(windowWidth, windowHeight);
  ui = QuickSettings.create(0, 0, "GunGame")
    .addText('IP', config.ip, cfg_h)
    .addButton('Connect', connect_h)
    .addHTML("Status", "Not connected")
    .addRange("Treshold", 0, 255, config.tresh, 5, cfg_h)
    .addHTML("Debug", "<div id='debug_raw' class='debug'></div><div id='debug_col' class='debug'></div>")
    .addButton('Calibrate', calibrate_h)
    .addBoolean("Dark", config.dark, cfg_h)
    .addDropDown("Game", ["Balls", "Move Balls", "Duck Hunt"])
    .addButton('Start', start_h)
    .addRange('Object Size', 0, 0.5, config.size, 0.01, cfg_h)
    .addRange('Object Speed', 0, 100, config.speed, 5, cfg_h)

    .setDraggable(false)
    .setWidth(150);
  // ui.saveInLocalStorage('cfg');
}

function draw() {
  if (game) game.tick();
}

// =================== MISC ===================
function randomInt(max, mmax = null) {
  if (mmax === null) return Math.floor(Math.random() * max);
  else return Math.random() * (mmax - max) + max;
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function ui_get(name) {
  return ui.getValue(name);
}
function ui_set(name, value) {
  return ui.setValue(name, value);
}

function connect_h() {
  ws = new WebSocket(`ws://${ui_get('IP')}:81/`, ['Arduino']);
  ws.onopen = () => {
    ui_set('Status', 'Connected');
  };
  ws.onclose = () => {
    ws = null;
    ui_set('Status', 'Not connected');
    setTimeout(connect_h, 1000);
  };
  ws.onmessage = (e) => {
    packet = e.data.split(',').map(v => Number(v));
    let shot = packet[3];
    let C = new Array(3);
    C[0] = Math.round(255 * packet[0] / calibrate.r);
    C[1] = Math.round(255 * packet[1] / calibrate.g);
    C[2] = Math.round(255 * packet[2] / calibrate.b);
    console.log(C);

    let M = [
      [0, 1, 0, 2, 1, 2],
      [1, 0, 1, 2, 0, 2],
      [2, 0, 2, 1, 0, 1],
      [0, 2, 1, 2, 0, 1],
      [1, 0, 2, 0, 1, 2],
      [0, 1, 2, 1, 0, 2],
    ];

    let t = ui_get('Treshold');
    let res = Colors.None;
    for (let i = 0; i < 6; i++) {
      if (C[M[i][0]] - C[M[i][1]] >= t && C[M[i][2]] - C[M[i][3]] >= t && Math.abs(C[M[i][4]] - C[M[i][5]]) <= t) {
        res = i;
        break;
      }
    }

    if (shot) data.shot = Colors.codes[res];

    try {
      document.getElementById('debug_raw').style.background = `rgb(${C[0]},${C[1]},${C[2]})`;
      document.getElementById('debug_col').style.background = '#' + Colors.codes[res];
    } catch (e) { }
  };
}
function ws_state() {
  return (ws && ws.readyState == 1);
}

function start_h() {
  // if (!ws_state()) return;
  ui.collapse();
  switch (ui_get('Game').index) {
    case 0: game = new GameBalls(data);
      break;
    case 1: game = new GameMoveBalls(data);
      break;
    case 2: game = new GameBirds(data);
      break;
  }
}

function calibrate_h() {
  calibrate.r = packet[0];
  calibrate.g = packet[1];
  calibrate.b = packet[2];
  localStorage.setItem("calibrate", JSON.stringify(calibrate));
}

function cfg_h() {
  config.size = Number(ui_get('Object Size'));
  config.tresh = Number(ui_get('Treshold'));
  config.speed = Number(ui_get('Object Speed'));
  config.ip = ui_get('IP');
  config.dark = ui_get('Dark');
  localStorage.setItem("config", JSON.stringify(config));
}