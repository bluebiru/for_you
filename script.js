// MUSIK + IKON PLAY/PAUSE
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicToggle');
music.volume = 0.4;

music.pause();
musicBtn.classList.remove('visible');
musicBtn.innerHTML = 'Play';

musicBtn.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    musicBtn.innerHTML = 'Pause';
  } else {
    music.pause();
    musicBtn.innerHTML = 'Play';
  }
});

// SCREEN MANAGER
const screens = {
  start: document.getElementById('startScreen'),
  game: document.getElementById('gameScreen'),
  bintang: document.getElementById('bintangScreen'),
  envelope: document.getElementById('envelopeScreen'),
  letter: document.getElementById('finalLetter')
};

function show(id) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[id].classList.add('active');
}

// ==================== GAME – 100% STABIL & AMAN ====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth - 40;
canvas.height = 300;

let dino = { x:80, y:200, w:60, h:60, dy:0, gravity:0.8, jump:-16, grounded:true };
let obstacles = [];
let score = 0;
let gameRunning = false;
let animationId = null;

const scoreEl = document.getElementById('score');
const msg = document.getElementById('message');

// Hanya aktifkan kontrol saat game benar-benar jalan
function enableControls() {
  canvas.onclick = jump;
  canvas.ontouchstart = e => { e.preventDefault(); jump(); };
  document.onkeydown = e => e.code === 'Space' && e.preventDefault() && jump();
}

function disableControls() {
  canvas.onclick = null;
  canvas.ontouchstart = null;
  document.onkeydown = null;
}

function drawDino() {
  ctx.fillStyle = '#ff66cc';
  ctx.fillRect(dino.x, dino.y, dino.w, dino.h);
  ctx.fillStyle = '#fff'; ctx.fillRect(dino.x+40, dino.y+10, 15,15);
  ctx.fillStyle = '#ff3399'; ctx.fillRect(dino.x+44, dino.y+14, 7,7);
}

function spawnObstacle() {
  if (obstacles.length === 0 || obstacles[obstacles.length-1].x < canvas.width - 350) {
    obstacles.push({ x: canvas.width, passed: false });
  }
}

function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Dino
  if (!dino.grounded) {
    dino.dy += dino.gravity;
    dino.y += dino.dy;
  }
  if (dino.y > 200) {
    dino.y = 200;
    dino.grounded = true;
    dino.dy = 0;
  }
  drawDino();

  // Kaktus
  obstacles.forEach((o, i) => {
    o.x -= 7;
    ctx.fillStyle = '#d63384';
    ctx.fillRect(o.x, 240, 40, 60);

    if (!o.passed && o.x + 40 < dino.x) {
      o.passed = true;
      score += 10;
      scoreEl.textContent = score;
    }

    if (o.x < dino.x + dino.w && o.x + 40 > dino.x && dino.y + dino.h > 240) {
      gameOver();
      return;
    }

    if (o.x < -50) obstacles.splice(i, 1);
  });

  if (Math.random() < 0.015) spawnObstacle();

  if (score >= 200) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    setTimeout(() => show('bintang'), 800);
    return;
  }

  animationId = requestAnimationFrame(gameLoop);
}

function jump() {
  if (dino.grounded && gameRunning) {
    dino.grounded = false;
    dino.dy = dino.jump;
  }
}

function gameOver() {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  msg.style.display = 'block';
  msg.textContent = 'Aduh nabrak... ulang lagi yaaa';
  document.getElementById('restartBtn').style.display = 'block';
}

function startGame() {
  // Reset
  score = 0;
  obstacles = [];
  scoreEl.textContent = '0';
  msg.style.display = 'none';
  document.getElementById('restartBtn').style.display = 'none';
  dino.y = 200;
  dino.grounded = true;
  dino.dy = 0;

  gameRunning = true;
  cancelAnimationFrame(animationId);
  enableControls();        // ← baru aktifin kontrol
  gameLoop();
}

// TOMBOL UTAMA
document.getElementById('startBtn').onclick = () => {
  musicBtn.classList.add('visible');
  music.play();
  musicBtn.innerHTML = 'Pause';

  show('game');
  startGame();
};

document.getElementById('restartBtn').onclick = () => {
  startGame(); // kontrol otomatis aktif lagi
};

document.getElementById('nextBtn').onclick = () => show('envelope');

document.getElementById('openEnvelope').onclick = () => {
  document.querySelector('.flap').style.transform = 'rotateX(180deg)';
  setTimeout(() => show('letter'), 800);
};

// Matikan kontrol saat pindah screen (biar aman)
show = (id) => {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[id].classList.add('active');
  
  // Matikan kontrol kalau bukan di game
  if (id !== 'game') {
    disableControls();
  }
};

