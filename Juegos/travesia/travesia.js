// Canvas y contexto
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const laneCount = 4;
const laneWidth = canvas.width / laneCount;

// Leer vehículo desde localStorage
const selectedVehicle = localStorage.getItem('selectedVehicle') || 'Turismo';

// Velocidad ambiental (controlada por flechas arriba/abajo)
let minSpeed = 10;
let maxSpeed = 180;
let acceleration = 1;
let speed = 60;

// Debuffs y estado
let intox = 0;
let distract = 0;
let reactionDelay = 0;
let invert = false;
let gameOver = false;
let gameStartTime = Date.now();

// Coche - Centrado en la pantalla
const car = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 120,
  w: 30,
  h: 50,
  speedX: 0,
  speedY: 0
};

// Parámetros de la velocidad del jugador
const playerBaseSpeed = 3.5;
const playerSpeedCap = 9;

// Obstáculos
let obstacles = [];
let maxObstacles = 6;
let baseSpawnRate = 0.006;
let spawnRate = baseSpawnRate;
let spawnInterval = 50;
let spawnCooldown = 0;

// Eventos R/Q
let baseEventRate = 0.0006;
let eventRate = baseEventRate;
let currentEvent = null;
let eventTimeout = null;
let eventStartTime = 0;
let resistCount = 0;

const events = [
  { text: "La cerveza fría te tienta 🍺", a: 20, d: 0 },
  { text: "Tus amigos hacen un brindis", a: 20, d: 0 },
  { text: "Te sientes invencible", a: 60, d: 0 },
  { text: "Te llama tu ex 📞", a: 0, d: 50 },
  { text: "Quieres cambiar la música 🎵", a: 0, d: 40 },
  { text: "Crees haber visto a Messi ⚽", a: 0, d: 80 },
  { text: "Notificación del móvil 📱", a: 0, d: 20 },
  { text: "Te ofrecen un tabaco 🚬", a: 20, d: 40 }
];

// --- Dibujo ---
function drawRoad() {
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibujar carriles
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);

  for (let i = 1; i < laneCount; i++) {
    const x = i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  ctx.setLineDash([]);
}

function drawCar() {
  const vehicleType = selectedVehicle.toLowerCase();
  
  // El coche está fijado en el centro inferior de la pantalla
  switch(vehicleType) {
    case 'turismo':
      // Turismo - Coche pequeño azul
      ctx.fillStyle = "blue";
      ctx.fillRect(car.x, car.y, car.w, car.h);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(car.x + 6, car.y + 8, car.w - 12, 14);
      break;
      
    case 'autobus':
    case 'vmp':
      // Autobús/VMP - Coche más grande y amarillo
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(car.x - 5, car.y, car.w + 10, car.h);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(car.x + 2, car.y + 10, car.w - 4, 10);
      ctx.fillRect(car.x + 2, car.y + 25, car.w - 4, 10);
      break;
      
    case 'motocicleta':
      // Motocicleta - Coche muy pequeño y rojo
      ctx.fillStyle = "red";
      ctx.fillRect(car.x + 8, car.y, car.w - 16, car.h);
      ctx.fillRect(car.x + 5, car.y + 20, car.w - 10, 5);
      ctx.fillRect(car.x + 5, car.y + 35, car.w - 10, 5);
      break;
      
    case 'ciclos':
      // Bicicleta - Pequeña y verde
      ctx.fillStyle = "green";
      ctx.fillRect(car.x + 10, car.y + 10, car.w - 20, car.h - 20);
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(car.x + 8, car.y + 30, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(car.x + car.w - 8, car.y + 30, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'camiones':
      // Camión - Muy grande y marrón
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(car.x - 10, car.y, car.w + 20, car.h);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      for(let i = 0; i < 3; i++) {
        ctx.fillRect(car.x - 8, car.y + 8 + i * 12, car.w + 16, 8);
      }
      break;
      
    default:
      // Por defecto turismo
      ctx.fillStyle = "blue";
      ctx.fillRect(car.x, car.y, car.w, car.h);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(car.x + 6, car.y + 8, car.w - 12, 14);
  }
}

function spawnObstacle() {
  const ow = 30;
  const oh = 50;

  // Elegir carril (0 a 3)
  const lane = Math.floor(Math.random() * laneCount);

  // Centrar obstáculo en el carril
  const x = lane * laneWidth + (laneWidth - ow) / 2;

  // Velocidad individual del obstáculo
  const speedVariation = Math.random() * 2 + 0.5; // entre 0.5 y 2.5

  obstacles.push({
    x: x,
    y: -oh - Math.random() * 200,
    w: ow,
    h: oh,
    lane: lane,
    speed: speedVariation
  });
}

function updateObstacles() {
  obstacles.forEach(o => {
    // cada coche tiene su propia velocidad + influencia global
    o.y += (speed / 30 + 1) * o.speed;
  });

  obstacles = obstacles.filter(o => o.y < canvas.height + 100);
}

function drawObstacles() {
  ctx.fillStyle = "red";
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
}

function collision() {
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
}

function updateBars() {
  document.getElementById("alcohol").style.width = intox + "%";
  document.getElementById("distract").style.width = distract + "%";
}

function applyDebuffs() {
  reactionDelay = intox >= 40 ? 300 : 0;
  invert = intox >= 80;
  if (intox >= 100 || distract >= 100) gameOver = true;
}

function randomEvent() {
  const e = events[Math.floor(Math.random() * events.length)];
  document.getElementById("event").textContent = e.text;
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
      document.getElementById("eventPrompt").textContent = "";
    }
  }, 5000);

  updateEventPromptDisplay();
}

function updateEventPromptDisplay() {
  if (!currentEvent) return;
  const elapsed = (Date.now() - eventStartTime) / 1000;
  const remaining = Math.max(0, 5 - elapsed);
  document.getElementById("eventPrompt").textContent =
    `Pulsa R para resistir (${resistCount}/10), Q para aceptar (${remaining.toFixed(1)}s)`;
}

// --- Input ---
const keysDown = {};
let lastInputChangeTime = 0;

document.addEventListener('keydown', (e) => {
  const key = e.key;

  if (currentEvent) {
    if (key.toLowerCase() === 'r') {
      resistCount++;
      if (resistCount >= 10) {
        if (eventTimeout) clearTimeout(eventTimeout);
        currentEvent = null;
        resistCount = 0;
        document.getElementById("eventPrompt").textContent = "";
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
      document.getElementById("eventPrompt").textContent = "";
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
    ctx.fillText("💥 ACCIDENTE 💥", canvas.width / 2 - 88, canvas.height / 2 - 10);
    ctx.font = "14px Arial";
    ctx.fillText("F5 para reiniciar", canvas.width / 2 - 48, canvas.height / 2 + 20);
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

  // Mantener el coche dentro de los límites (fijado)
  if (car.x < 0) car.x = 0;
  if (car.x + car.w > canvas.width) car.x = canvas.width - car.w;
  if (car.y < 0) car.y = 0;
  if (car.y + car.h > canvas.height) car.y = canvas.height - car.h;

  drawRoad();
  drawCar();
  drawObstacles();

  updateObstacles();
  collision();

  if (spawnCooldown > 0) spawnCooldown--;
  if (spawnCooldown <= 0 && Math.random() < spawnRate && obstacles.length < maxObstacles) {
    spawnObstacle();
    spawnCooldown = spawnInterval;
  }

  if (Math.random() < eventRate) randomEvent();
  if (currentEvent) updateEventPromptDisplay();

  const elapsedSeconds = (Date.now() - gameStartTime) / 1000;
  const difficultyMultiplier = 1 + (elapsedSeconds / 60);
  spawnRate = Math.min(0.003, baseSpawnRate * difficultyMultiplier);
  eventRate = Math.min(0.001, baseEventRate * difficultyMultiplier);

  applyDebuffs();
  updateBars();

  document.getElementById('speed').textContent = Math.round(speed);

  requestAnimationFrame(loop);
}

loop();
