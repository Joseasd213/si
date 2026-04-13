// Canvas i context
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const laneCount = 4;
const laneWidth = canvas.width / laneCount;
const tipoCarretera = 'interurbana';

// Llegir vehicle de localStorage
const selectedVehicle = localStorage.getItem('selectedVehicle') || 'Turismo';

if ((selectedVehicle === 'Ciclos' || selectedVehicle === 'Motocicleta') && tipoCarretera.includes('interurbana')) {
  const message = selectedVehicle === 'Ciclos'
    ? 'Els cicles no poden circular per carreteres interurbanes. Escull Urbana o Travessia.'
    : 'Les motocicletes no poden circular per carreteres interurbanes. Escull Urbana o Travessia.';
  alert(message);
  window.location.href = '../../menu.html';
}

const vehicleTypes = ['Turismo', 'Autobus', 'VMP', 'Motocicleta', 'Ciclos', 'Camiones'];
const speedLimits = {
  urbana: 50,
  interurbana: 90,
  travesia: 60,
  'turismo-interurbana': 90
};

// Velocitat ambiental (controlada per fletxes amunt/avall)
let minSpeed = 10;
let maxSpeed = 180;
let acceleration = 1;
let speed = 80; // Velocidad inicial bajo el límite de interurbana (90 km/h)

// Debuffs i estat
let intox = 0;
let distract = 0;
let penalties = 0;
const maxPenalties = 5; // Máximo de sanciones permitidas
let reactionDelay = 0;
let invert = false;
let gameOver = false;
let gameStartTime = Date.now();
let lastFrameTime = Date.now();
let distanceKm = 0;
const distanceGoalKm = 2;

// Seguiment dels canvis de carril per detectar infraccions
let lastCarLane = -1;
let lastSpeedCheckTime = 0;
let lastLaneChangeTime = 0;

// Cotxe - Apareix a la dreta o esquerra
const car = {
  x: (Math.random() < 0.5 ? 0 : 3) * laneWidth + (laneWidth - 30) / 2,
  y: canvas.height - 120,
  w: 30,
  h: 50,
  speedX: 0,
  speedY: 0
};

// Mur al mig dels quatre carrils
const wall = {
  x: laneWidth * 2 - 5,
  y: 0,
  w: 10,
  h: canvas.height
};

// Paràmetres de la velocitat del jugador
const playerBaseSpeed = 3.5;
const playerSpeedCap = 9;

// Obstacles
let obstacles = [];
let maxObstacles = 6;
let baseSpawnRate = 0.006;
let spawnRate = baseSpawnRate;
let spawnInterval = 50;
let spawnCooldown = 0;

// Esdeveniments R/Q
let baseEventRate = 0.0006;
let eventRate = baseEventRate;
let currentEvent = null;
let eventTimeout = null;
let eventStartTime = 0;
let resistCount = 0;

const events = [
  { text: "La cervesa freda et tempta 🍺", a: 20, d: 0 },
  { text: "Els teus amics fan un somni", a: 20, d: 0 },
  { text: "Et sents invencible", a: 60, d: 0 },
  { text: "Et crida la teva ex 📞", a: 0, d: 50 },
  { text: "Vols canviar la música 🎵", a: 0, d: 40 },
  { text: "Creus haver vist a Messi ⚽", a: 0, d: 80 },
  { text: "Notificació del mòbil 📱", a: 0, d: 20 },
  { text: "T'ofereixen un tabac 🚬", a: 20, d: 40 }
];

const roadRuleSets = {
  urbana: [
    "Respectar límits de velocitat i senyals en zona urbana.",
    "Mantenir distància amb vianants, ciclistes i transport públic.",
    "No canviar de carril de forma brusc; usar intermitents.",
    "Assegurar pas en semàfors i passos de vianants."
  ],
  interurbana: [
    "Manté la distància de seguretat en la carretera.",
    "Avança només quan sigui segur i senyalitza amb temps.",
    "Redueix velocitat en corbes i zones amb menor visibilitat.",
    "No uses el carril d'emergència a menys que sigui imprescindible."
  ],
  'turismo-interurbana': [
    "Viatges de turisme: descansa cada hora i no et apressuris.",
    "Planifica la ruta i revisa l'estat de la carretera abans de sortir.",
    "Condueixes sobri i evita distraccions en vies turístiques.",
    "Adapta la velocitat a l'entorn i a les condicions climàtiques."
  ]
};

const vehicleRuleSets = {
  Turismo: [
    "Turisme: controla la velocitat i usa cinturó en tot moment.",
    "Evita maniobres bruscas en zones urbanes i carretera turística.",
    "Manté l'atenció en l'entorn i en la senyalització."
  ],
  Autobus: [
    "Autobús: més distància de seguretat i cura amb passatgers.",
    "Respecta les parades autoritzades i evita frenades bruscas.",
    "Si és necessari, redueix velocitat abans de fer una parada."
  ],
  VMP: [
    "VMP: velocitat limitada, usa casc i permaneix visible.",
    "Respecta els carrils ciclistes i la jerarquia de passos de vianants.",
    "No invadeixis trajectòries de vehicles més grans."
  ],
  Motocicleta: [
    "Motocicleta: protegeix el teu cap i usa roba visible.",
    "Augmenta la distància de frenada en condicions adverses.",
    "Evita punts cecs i no et desplacis entre vehicles."
  ],
  Ciclos: [
    "Cicles: usa carril bici sempre que estigui disponible.",
    "Respecta semàfors i no circules per voreres de vianants.",
    "Manté't estable i senyalitza els girs amb antelació."
  ],
  Camiones: [
    "Camió: funciona amb més inèrcia, frena amb anticipació.",
    "Coneix els teus punts cecs i senyalitza amb temps.",
    "Controla el pes i no excedeixis la velocitat permesa."
  ],
  default: [
    "Condueixes amb atenció, adapta la teva velocitat i respecta les regles."
  ]
};

let gameOverReason = null;
let redirectScheduled = false;

function setGameOverReason(reason) {
  if (gameOverReason === 'alcohol') return;
  gameOverReason = reason;
}

function renderRules() {
  const roadContainer = document.getElementById('roadRules');
  const vehicleContainer = document.getElementById('vehicleRules');
  const rules = roadRuleSets[tipoCarretera] || roadRuleSets.interurbana;
  const vehicleRules = vehicleRuleSets[selectedVehicle] || vehicleRuleSets.default;

  if (roadContainer) roadContainer.innerHTML = rules.map(rule => `<div class="rule-entry">${rule}</div>`).join('');
  if (vehicleContainer) vehicleContainer.innerHTML = vehicleRules.map(rule => `<div class="rule-entry">${rule}</div>`).join('');
}

function formatRoadName(road) {
  switch (road) {
    case 'urbana': return 'Urbana';
    case 'interurbana': return 'Interurbana';
    case 'travesia': return 'Travessia';
    case 'turismo-interurbana': return 'Turisme Interurbana';
    default: return 'Carretera';
  }
}

function getVehicleLabel(vehicle) {
  switch (vehicle.toLowerCase()) {
    case 'turismo': return 'Turismo';
    case 'autobus': return 'Autobús';
    case 'vmp': return 'VMP';
    case 'motocicleta': return 'Motocicleta';
    case 'ciclos': return 'Cicles';
    case 'camiones': return 'Camió';
    default: return vehicle;
  }
}

function renderPageHeader() {
  const title = document.querySelector('.game-title');
  const subtitle = document.querySelector('.game-subtitle');
  const description = document.querySelector('.game-description');
  const pageTitle = `${getVehicleLabel(selectedVehicle)} - ${formatRoadName(tipoCarretera)}`;

  if (title) title.textContent = 'PIXEL DRIVER: CIUTAT SEGURA';
  if (subtitle) subtitle.textContent = pageTitle;
  if (description) description.textContent = `Condueix amb ${getVehicleLabel(selectedVehicle)} en una via ${formatRoadName(tipoCarretera)}.`;
  document.title = `PIXEL DRIVER | ${pageTitle}`;
}

function navigateOnCrash() {
  if (redirectScheduled) return;
  redirectScheduled = true;
  let target = '../../choque.html';
  if (gameOverReason === 'alcohol') target = '../../alchol.html';
  else if (gameOverReason === 'infraccion') target = '../../infraccion.html';
  setTimeout(() => { window.location.href = target; }, 1400);
}

// --- Dibuix ---
function drawRoad() {
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibuixar carrils amb regles de trànsit
  if (tipoCarretera === 'urbana') {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
  } else {
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
  }

  for (let i = 1; i < laneCount; i++) {
    const x = i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  ctx.setLineDash([]);

  // Dibuixar mur
  ctx.fillStyle = "#888";
  ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

  // Regles de trànsit
  let regla = "";
  if (tipoCarretera === 'urbana') regla = "Zona urbana: Línies sòlides, no canviar de carril";
  else if (tipoCarretera === 'interurbana') regla = "Carretera interurbana: Avançar amb precaució";
  else if (tipoCarretera === 'travesia') regla = "Travessia: Atenció a vianants";
  else regla = "Turisme interurbana: Respecta senyals";

  ctx.fillStyle = "#fff";
  ctx.font = "16px Arial";
  ctx.fillText(regla, 10, 30);
}

function drawCar() {
  const vehicleType = selectedVehicle.toLowerCase();
  let color, text;
  switch(vehicleType) {
    case 'turismo':
      color = "lightblue";
      text = "Turismo";
      break;
    case 'autobus':
      color = "lightyellow";
      text = "Autobús";
      break;
    case 'vmp':
      color = "lightgoldenrodyellow";
      text = "VMP";
      break;
    case 'motocicleta':
      color = "lightcoral";
      text = "Motocicleta";
      break;
    case 'ciclos':
      color = "lightgreen";
      text = "Ciclos";
      break;
    case 'camiones':
      color = "#D2B48C";
      text = "Camiones";
      break;
    default:
      color = "lightblue";
      text = "Turismo";
  }
  ctx.fillStyle = color;
  ctx.fillRect(car.x, car.y, car.w, car.h);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.strokeRect(car.x, car.y, car.w, car.h);
  ctx.fillStyle = "black";
  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, car.x + car.w/2, car.y + car.h/2);
}

function spawnObstacle() {
  const ow = 30;
  const oh = 50;

  // Elegir carril (0 a 3), con chance de aparecer en el carril del jugador
  let lane = Math.floor(Math.random() * laneCount);
  const playerLane = Math.floor(car.x / laneWidth);
  if (Math.random() < 0.2) { // 20% de chance
    lane = playerLane;
  }

  // Centrar obstacle en el carril
  const x = lane * laneWidth + (laneWidth - ow) / 2;

  // Velocitat individual de l'obstacle
  const speedVariation = Math.random() * 2 + 0.5; // entre 0.5 i 2.5

  obstacles.push({
    x: x,
    y: -oh - Math.random() * 200,
    w: ow,
    h: oh,
    lane: lane,
    speed: speedVariation,
    type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]
  });
}

function updateObstacles() {
  obstacles.forEach(o => {
    // Determinar qué lado del muro está el obstáculo
    const isLeftSide = o.lane < 2; // Carriles 0-1 a la izquierda
    
    if (isLeftSide) {
      // En el lado izquierdo, los vehículos avanzan hacia arriba (sentido contrario)
      o.y -= (speed / 30 + 1) * o.speed;
    } else {
      // En el lado derecho, los vehículos avanzan hacia abajo (sentido normal)
      o.y += (speed / 30 + 1) * o.speed;
    }
  });

  obstacles = obstacles.filter(o => o.y < canvas.height + 100 && o.y > -200);
}

function drawObstacles() {
  obstacles.forEach(o => {
    let color;
    switch(o.type.toLowerCase()) {
      case 'turismo':
        color = "lightblue";
        break;
      case 'autobus':
        color = "lightyellow";
        break;
      case 'vmp':
        color = "lightgoldenrodyellow";
        break;
      case 'motocicleta':
        color = "lightcoral";
        break;
      case 'ciclos':
        color = "lightgreen";
        break;
      case 'camiones':
        color = "#D2B48C";
        break;
      default:
        color = "lightgray";
    }
    ctx.fillStyle = color;
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeRect(o.x, o.y, o.w, o.h);
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(getVehicleLabel(o.type), o.x + o.w/2, o.y + o.h/2);
  });
}

function checkRuleViolations() {
  const currentLane = Math.floor(car.x / laneWidth);

  if (tipoCarretera === 'urbana' && lastCarLane !== -1 && lastCarLane !== currentLane) {
    const now = Date.now();
    if (now - lastLaneChangeTime > 500) {
      penalties += 1; // Sanción por cambiar carril
      console.log(`🚨 Sanción #${penalties}: Cambio de carril brusco en zona urbana`);
      lastLaneChangeTime = now;
    }
  }

  lastCarLane = currentLane;

  const now = Date.now();
  if (now - lastSpeedCheckTime > 1000) {
    const speedLimit = speedLimits[tipoCarretera] || 90;
    if (speed > speedLimit) {
      penalties += 1; // Sanción por exceder velocidad
      console.log(`🚨 Sanción #${penalties}: Exceso de velocidad (${Math.round(speed)} km/h > ${speedLimit} km/h)`);
    }
    lastSpeedCheckTime = now;
  }
}

function collision() {
  // Colisió amb obstacles
  for (let o of obstacles) {
    if (
      car.x < o.x + o.w &&
      car.x + car.w > o.x &&
      car.y < o.y + o.h &&
      car.y + car.h > o.y
    ) {
      gameOver = true;
      break;
    }
  }

  // Colisió amb mur
  if (
    car.x < wall.x + wall.w &&
    car.x + car.w > wall.x &&
    car.y < wall.y + wall.h &&
    car.y + car.h > wall.y
  ) {
    gameOver = true;
    setGameOverReason('choque');
  }
}

function updateBars() {
  document.getElementById("alcohol").style.width = intox + "%";
  document.getElementById("alcohol-value").textContent = intox + "%";
  document.getElementById("distract").style.width = distract + "%";
  document.getElementById("distract-value").textContent = distract + "%";
  document.getElementById("penalties-value").textContent = penalties; // Mostrar número de sanciones
}

function applyDebuffs() {
  reactionDelay = intox >= 40 ? 300 : 0;
  invert = intox >= 80;

  if (intox >= 100) {
    gameOver = true;
    setGameOverReason('alcohol');
  }

  if (distract >= 100 && gameOverReason !== 'alcohol') {
    gameOver = true;
    setGameOverReason('choque');
  }
}


function randomEvent() {
  const e = events[Math.floor(Math.random() * events.length)];
  const eventElement = document.getElementById("event");
  if (eventElement) {
    eventElement.textContent = e.text;
  }
  currentEvent = e;
  eventStartTime = Date.now();
  resistCount = 0;

  if (eventTimeout) clearTimeout(eventTimeout);

  eventTimeout = setTimeout(() => {
    if (currentEvent === e) {
      intox = Math.min(100, intox + currentEvent.a);
      distract = Math.min(100, distract + currentEvent.d);
      applyDebuffs();
      updateBars();
      currentEvent = null;
      const promptElement = document.getElementById("eventPrompt");
      if (promptElement) {
        promptElement.textContent = "";
      }
    }
  }, 5000);

  updateEventPromptDisplay();
}

function updateEventPromptDisplay() {
  if (!currentEvent) return;
  const elapsed = (Date.now() - eventStartTime) / 1000;
  const remaining = Math.max(0, 5 - elapsed);
  const promptElement = document.getElementById("eventPrompt");
  if (promptElement) {
    promptElement.textContent =
      `Prem R per resistir (${resistCount}/10), Q per acceptar (${remaining.toFixed(1)}s)`;
  }
}

// --- Input ---
const keysDown = {};
let lastInputChangeTime = 0;

document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(key)) {
    e.preventDefault();
  }

  if (currentEvent) {
    if (key.toLowerCase() === 'r') {
      resistCount++;
      if (resistCount >= 10) {
        if (eventTimeout) clearTimeout(eventTimeout);
        currentEvent = null;
        resistCount = 0;
        const promptElement = document.getElementById("eventPrompt");
        if (promptElement) {
          promptElement.textContent = "";
        }
      } else {
        updateEventPromptDisplay();
      }
      return;
    }

    if (key.toLowerCase() === 'q') {
      if (eventTimeout) clearTimeout(eventTimeout);
      intox = Math.min(100, intox + currentEvent.a);
      distract = Math.min(100, distract + currentEvent.d);
      applyDebuffs();
      updateBars();
      currentEvent = null;
      resistCount = 0;
      const promptElement = document.getElementById("eventPrompt");
      if (promptElement) {
        promptElement.textContent = "";
      }
      return;
    }
  }

  keysDown[key] = true;
  lastInputChangeTime = Date.now();
});

document.addEventListener('keyup', (e) => {
  delete keysDown[e.key];
  lastInputChangeTime = Date.now();
});

// --- Loop principal ---
function loop() {
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    let message = "";
    if (gameOverReason === 'alcohol') message = "🚫 CONDUCCIÓ EBRIA";
    else if (gameOverReason === 'infraccion') message = "🚫 DEMASIADAS INFRACCIONES";
    else if (gameOverReason === 'goal') message = "🎉 OBJECTIU ASSOLIT";
    else message = "💥 ACCIDENT 💥";
    ctx.fillText(message, canvas.width / 2 - 108, canvas.height / 2 - 10);
    ctx.font = "14px Arial";
    if (gameOverReason === 'goal') {
      ctx.fillText("Partida finalitzada", canvas.width / 2 - 70, canvas.height / 2 + 20);
      return;
    }
    ctx.fillText("Redirigint...", canvas.width / 2 - 56, canvas.height / 2 + 20);
    navigateOnCrash();
    return;
  }

  if (keysDown["ArrowUp"]) {
    speed = Math.min(maxSpeed, speed + acceleration);
  }
  if (keysDown["ArrowDown"]) {
    speed = Math.max(minSpeed, speed - acceleration);
  }

  const now = Date.now();
  if (now - lastInputChangeTime >= reactionDelay) {
    const w = keysDown["w"] || keysDown["W"];
    const a = keysDown["a"] || keysDown["A"];
    const s = keysDown["s"] || keysDown["S"];
    const d = keysDown["d"] || keysDown["D"];

    const multiplier = speed / 60;
    const scaled = playerBaseSpeed * multiplier;
    const playerSpeed = Math.min(playerSpeedCap, Math.max(1, scaled));

    if (a && !d) {
      car.speedX = invert ? playerSpeed : -playerSpeed;
    } else if (d && !a) {
      car.speedX = invert ? -playerSpeed : playerSpeed;
    } else {
      car.speedX = 0;
    }

    if (w && !s) {
      car.speedY = -playerSpeed;
    } else if (s && !w) {
      car.speedY = playerSpeed;
    } else {
      car.speedY = 0;
    }
  }

  car.x += car.speedX;
  car.y += car.speedY;

  // Mantenir el cotxe dins dels límits (fixat)
  if (car.x < 0) car.x = 0;
  if (car.x + car.w > canvas.width) car.x = canvas.width - car.w;
  if (car.y < 0) car.y = 0;
  if (car.y + car.h > canvas.height) car.y = canvas.height - car.h;

  drawRoad();
  drawCar();
  drawObstacles();

  updateObstacles();
  collision();
  checkRuleViolations();

  if (spawnCooldown > 0) spawnCooldown--;
  if (spawnCooldown <= 0 && Math.random() < spawnRate && obstacles.length < maxObstacles) {
    spawnObstacle();
    spawnCooldown = spawnInterval;
  }

  if (Math.random() < eventRate) randomEvent();
  if (currentEvent) updateEventPromptDisplay();

  const elapsedSeconds = (Date.now() - gameStartTime) / 1000;
  const difficultyMultiplier = 1 + (elapsedSeconds / 60);
  eventRate = Math.min(0.001, baseEventRate * difficultyMultiplier);

  applyDebuffs();
  updateBars();

  document.getElementById('speed').textContent = Math.round(speed);
  const currentTime = Date.now();
  const deltaSeconds = (currentTime - lastFrameTime) / 1000;
  lastFrameTime = currentTime;
  distanceKm += (speed / 3600) * deltaSeconds;
  document.getElementById('distance').textContent = distanceKm.toFixed(2);
  const remainingMeters = Math.max(0, Math.round((distanceGoalKm - distanceKm) * 1000));
  document.getElementById('distance-left').textContent = remainingMeters;

  // Aumentar spawnRate cuanto menos distancia al final
  const progress = 1 - remainingMeters / (distanceGoalKm * 1000);
  spawnRate = baseSpawnRate + progress * (0.02 - baseSpawnRate);

  if (distanceKm >= distanceGoalKm && !gameOver) {
    gameOver = true;
    if (penalties > 0) {
      setGameOverReason('infraccion');
    } else {
      setGameOverReason('goal');
    }
  }

  requestAnimationFrame(loop);
}

renderRules();
renderPageHeader();

loop();
