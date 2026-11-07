// ============================================================================
// SUPER MARIO VENEKO - MOTOR DE JUEGO (1 NIVEL / MUNDO UNICO)
// Sin musica ni sonidos (tal cual lo pedido)
// ============================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const TILE = 32; // Bloques de 32x32 px (sprites 16x16 escalados x2)
const VIEW_W = 800;
const VIEW_H = 480; // 15 filas de 32px

// ============================================================================
// CONTROL DE VELOCIDAD DEL JUEGO
// Cambia GAME_SPEED para hacer todo el juego mas lento o mas rapido:
//   1.0 = velocidad estandar (60 FPS)
//   0.75 = un 25% mas lento (valor actual mas comodo)
//   0.5 = mitad de velocidad
// ============================================================================
const GAME_SPEED = 1.0;

initSprites(2);

// Controles
const keys = {
  left: false,
  right: false,
  jump: false,
  run: false,
  jumpJustPressed: false
};

window.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = true;
  if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = true;
  if (['Space', 'ArrowUp', 'KeyW', 'KeyZ'].includes(e.code)) {
    if (!keys.jump) keys.jumpJustPressed = true;
    keys.jump = true;
    e.preventDefault();
  }
  if (['ShiftLeft', 'ShiftRight', 'KeyX'].includes(e.code)) keys.run = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = false;
  if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = false;
  if (['Space', 'ArrowUp', 'KeyW', 'KeyZ'].includes(e.code)) keys.jump = false;
  if (['ShiftLeft', 'ShiftRight', 'KeyX'].includes(e.code)) keys.run = false;
});

// ============================================================================
// DEFINICION DEL UNICO NIVEL (MUNDO 1-1: LLANO Y AREPAS)
// Ancho: 145 columnas x 15 filas
// ============================================================================
const LEVEL_WIDTH = 148;
const LEVEL_HEIGHT = 15;
const SOLIDS = new Set(['G', 'B', 'Q', 'E', 'S', 'P', 'p', 'L', 'l']);

let map = [];
let questionBlocks = {}; // key "x,y" -> { hitsLeft, bounceY }
let brickBounces = {};   // key "x,y" -> bounceY
let arepas = [];
let enemies = [];
let particles = [];
let floatingTexts = [];
let clouds = [];
let mountains = [];

// Estado general de la partida
const gameState = {
  score: 0,
  arepas: 0,
  time: 400,
  timeTick: 0,
  cameraX: 0,
  status: 'playing', // 'playing' | 'dying' | 'flagpole' | 'walking_castle' | 'closed'
  flagY: 4 * TILE,
  closeTimer: 0
};

// Jugador (Mario Veneko)
const player = {
  x: 3 * TILE,
  y: 11 * TILE,
  vx: 0,
  vy: 0,
  w: 26,
  h: 32,
  onGround: false,
  facing: 'right',
  animFrame: 0,
  animTimer: 0,
  coyoteTimer: 0,
  jumpHoldTimer: 0
};

// Construye el nivel 1-1
function buildLevel() {
  map = Array.from({ length: LEVEL_HEIGHT }, () => Array(LEVEL_WIDTH).fill('.'));
  questionBlocks = {};
  brickBounces = {};
  arepas = [];
  enemies = [];
  particles = [];
  floatingTexts = [];

  // Suelo base (filas 13 y 14) con un par de barrancos clasicos
  const pits = new Set([46, 47, 78, 79, 80]);
  for (let x = 0; x < LEVEL_WIDTH; x++) {
    if (!pits.has(x)) {
      map[13][x] = 'G';
      map[14][x] = 'G';
    }
  }

  // Helper para colocar bloques e interrogaciones
  const setBlock = (x, y, type) => {
    if (x >= 0 && x < LEVEL_WIDTH && y >= 0 && y < LEVEL_HEIGHT) {
      map[y][x] = type;
      if (type === 'Q') {
        questionBlocks[`${x},${y}`] = { bounceY: 0 };
      }
    }
  };

  // Helper para colocar tuberias
  const addPipe = (x, heightTiles) => {
    const topY = 13 - heightTiles;
    map[topY][x] = 'P';
    map[topY][x + 1] = 'p';
    for (let y = topY + 1; y < 13; y++) {
      map[y][x] = 'L';
      map[y][x + 1] = 'l';
    }
  };

  // Helper para colocar escaleras de bloques duros ('S')
  const addStairs = (startX, maxH, ascending = true) => {
    for (let col = 0; col < maxH; col++) {
      const h = ascending ? col + 1 : maxH - col;
      for (let row = 0; row < h; row++) {
        setBlock(startX + col, 12 - row, 'S');
      }
    }
  };

  // Helper para agregar Arepas flotantes
  const addArepaRow = (startX, y, count) => {
    for (let i = 0; i < count; i++) {
      arepas.push({
        x: (startX + i) * TILE + 2,
        y: y * TILE + 2,
        baseY: y * TILE + 2,
        collected: false,
        phase: i * 0.6
      });
    }
  };

  // --- SECCION 1: Inicio clasico a lo 1-1 ---
  setBlock(12, 9, 'Q');
  setBlock(16, 9, 'B');
  setBlock(17, 9, 'Q');
  setBlock(18, 9, 'B');
  setBlock(19, 9, 'Q');
  setBlock(20, 9, 'B');
  setBlock(18, 5, 'Q');

  addArepaRow(16, 7, 5);

  addPipe(24, 2);
  addPipe(32, 3);
  addPipe(40, 4);
  addArepaRow(35, 7, 3);

  // --- SECCION 2: Despues del primer barranco ---
  setBlock(52, 9, 'B');
  setBlock(53, 9, 'Q');
  setBlock(54, 9, 'B');
  for (let x = 55; x <= 61; x++) setBlock(x, 5, 'B');
  addArepaRow(55, 3, 7);

  setBlock(65, 5, 'B');
  setBlock(66, 5, 'B');
  setBlock(67, 5, 'Q');
  setBlock(67, 9, 'B');

  addPipe(72, 3);

  // --- SECCION 3: Plataformas y reto del Silbon ---
  for (let x = 84; x <= 88; x++) setBlock(x, 9, 'B');
  setBlock(86, 9, 'Q');
  addArepaRow(84, 7, 5);

  for (let x = 91; x <= 95; x++) setBlock(x, 5, 'B');
  addArepaRow(91, 3, 5);

  addStairs(100, 4, true);
  addArepaRow(105, 6, 3);
  addStairs(109, 4, false);

  addPipe(116, 2);
  setBlock(120, 9, 'B');
  setBlock(121, 9, 'Q');
  setBlock(122, 9, 'Q');
  setBlock(123, 9, 'B');

  // --- SECCION FINAL: Escalera al asta de la bandera de Venezuela ---
  addStairs(126, 8, true);
  // Tope plano de la escalera final
  for (let y = 0; y < 8; y++) {
    setBlock(134, 12 - y, 'S');
  }

  // Base del asta de bandera en x = 140
  setBlock(140, 12, 'S');

  // --- ENEMIGOS: Tortugas Esqueleto "El Silbon" ---
  const enemySpawns = [
    { x: 19, y: 11 },
    { x: 29, y: 11 },
    { x: 37, y: 11 },
    { x: 56, y: 11 },
    { x: 60, y: 11 },
    { x: 58, y: 3 },
    { x: 70, y: 11 },
    { x: 87, y: 11 },
    { x: 94, y: 11 },
    { x: 107, y: 11 },
    { x: 122, y: 11 }
  ];

  enemies = enemySpawns.map((s, idx) => ({
    x: s.x * TILE,
    y: s.y * TILE - 12,
    vx: -1.15,
    vy: 0,
    w: 28,
    h: 42,
    state: 'walk', // 'walk' | 'shell_idle' | 'shell_moving'
    shellTimer: 0,
    kickGrace: 0,
    facing: 'left',
    animTimer: idx * 7,
    whistleTimer: idx * 25
  }));

  // Decoracion de fondo (nubes y tepuyes/montañas)
  clouds = [];
  for (let i = 0; i < 18; i++) {
    clouds.push({
      x: i * 280 + 60,
      y: 36 + (i % 3) * 34,
      w: 64 + (i % 2) * 32
    });
  }

  mountains = [];
  for (let i = 0; i < 12; i++) {
    mountains.push({
      x: i * 380 + 20,
      w: 160 + (i % 2) * 60,
      h: 95 + (i % 2) * 35
    });
  }
}

// ============================================================================
// COLISIONES CON EL MAPA DE TILES
// ============================================================================
function isSolidAtTile(tx, ty) {
  if (tx < 0) return true; // Pared izquierda del mundo
  if (tx >= LEVEL_WIDTH || ty >= LEVEL_HEIGHT) return false;
  if (ty < 0) return false;
  return SOLIDS.has(map[ty][tx]);
}

// Golpear un bloque con la cabeza de Mario
function hitBlockFromBelow(tx, ty) {
  const tile = map[ty][tx];
  const key = `${tx},${ty}`;

  if (tile === 'Q') {
    map[ty][tx] = 'E'; // Pasa a bloque usado
    brickBounces[key] = -8;
    // Sale una Arepa calientita del bloque ?
    gameState.arepas++;
    gameState.score += 200;
    floatingTexts.push({
      x: tx * TILE + 4,
      y: ty * TILE - 10,
      text: '+1 AREPA',
      color: '#FFCC00',
      life: 45
    });
    particles.push({
      type: 'pop_arepa',
      x: tx * TILE + 2,
      y: (ty - 1) * TILE,
      vy: -6.5,
      life: 28
    });
    updateHUD();
  } else if (tile === 'B') {
    brickBounces[key] = -7;
    gameState.score += 50;
    // Rompe o sacude el ladrillo y suelta migas
    for (let i = 0; i < 4; i++) {
      particles.push({
        type: 'crumb',
        x: tx * TILE + 12,
        y: ty * TILE + 12,
        vx: (i % 2 === 0 ? -1 : 1) * (1.8 + Math.random() * 1.5),
        vy: -4 - Math.random() * 2,
        life: 35,
        color: '#E45C10'
      });
    }
    updateHUD();
  }

  // Si hay una Tortuga Silbon justo encima del bloque golpeado, se voltea al caparazon
  for (const en of enemies) {
    const enCenterX = en.x + en.w / 2;
    const enFootY = en.y + en.h;
    if (
      enCenterX >= tx * TILE - 8 &&
      enCenterX <= (tx + 1) * TILE + 8 &&
      Math.abs(enFootY - ty * TILE) <= 10 &&
      en.state === 'walk'
    ) {
      en.state = 'shell_idle';
      en.h = 30;
      en.vy = -5;
      en.shellTimer = 260;
      gameState.score += 100;
    }
  }
}

function moveAndCollideEntity(ent, isPlayer = false) {
  // --- Movimiento Horizontal ---
  ent.x += ent.vx;
  const topTile = Math.floor((ent.y + 2) / TILE);
  const bottomTile = Math.floor((ent.y + ent.h - 2) / TILE);

  if (ent.vx > 0) {
    const rightTile = Math.floor((ent.x + ent.w) / TILE);
    for (let ty = topTile; ty <= bottomTile; ty++) {
      if (isSolidAtTile(rightTile, ty)) {
        ent.x = rightTile * TILE - ent.w - 0.01;
        if (isPlayer) {
          ent.vx = 0;
        } else {
          ent.vx = -ent.vx;
          ent.facing = 'left';
        }
        break;
      }
    }
  } else if (ent.vx < 0) {
    const leftTile = Math.floor(ent.x / TILE);
    for (let ty = topTile; ty <= bottomTile; ty++) {
      if (isSolidAtTile(leftTile, ty)) {
        ent.x = (leftTile + 1) * TILE + 0.01;
        if (isPlayer) {
          ent.vx = 0;
        } else {
          ent.vx = -ent.vx;
          ent.facing = 'right';
        }
        break;
      }
    }
  }

  // --- Movimiento Vertical ---
  ent.y += ent.vy;
  ent.onGround = false;
  const leftTileV = Math.floor((ent.x + 3) / TILE);
  const rightTileV = Math.floor((ent.x + ent.w - 3) / TILE);

  if (ent.vy > 0) {
    const footTile = Math.floor((ent.y + ent.h) / TILE);
    for (let tx = leftTileV; tx <= rightTileV; tx++) {
      if (isSolidAtTile(tx, footTile)) {
        ent.y = footTile * TILE - ent.h;
        ent.vy = 0;
        ent.onGround = true;
        break;
      }
    }
  } else if (ent.vy < 0) {
    const headTile = Math.floor(ent.y / TILE);
    for (let tx = leftTileV; tx <= rightTileV; tx++) {
      if (isSolidAtTile(tx, headTile)) {
        ent.y = (headTile + 1) * TILE;
        ent.vy = 0;
        if (isPlayer) {
          hitBlockFromBelow(tx, headTile);
        }
        break;
      }
    }
  }
}

// ============================================================================
// ACTUALIZACION DEL JUEGO
// ============================================================================
function killPlayer() {
  if (gameState.status !== 'playing') return;
  gameState.status = 'dying';
  player.vy = -9.5;
  player.vx = 0;
}

function resetStageAfterDeath() {
  gameState.status = 'playing';
  gameState.score = 0;
  gameState.arepas = 0;
  gameState.time = 400;
  gameState.cameraX = 0;
  gameState.flagY = 4 * TILE;
  player.x = 3 * TILE;
  player.y = 11 * TILE;
  player.vx = 0;
  player.vy = 0;
  player.facing = 'right';
  buildLevel();
  updateHUD();
}

function finishAndCloseGame() {
  if (gameState.status === 'closed') return;
  gameState.status = 'closed';

  const overlay = document.getElementById('closeOverlay');
  if (overlay) {
    overlay.classList.remove('hidden');
  }

  // Cierra la ventana/pestaña tras completar el unico nivel
  setTimeout(() => {
    try {
      window.open('', '_self', '');
      window.close();
    } catch (_) { }
    // Si el navegador bloquea window.close() en una pestaña abierta manualmente,
    // apaga/cierra por completo el contenedor del juego:
    document.body.innerHTML = '';
    document.body.style.backgroundColor = '#000000';
  }, 900);
}

function updatePlayer() {
  // Velocidad de Mario (caminando: 2.8 | corriendo con Shift/X: 4.0)
  const maxSpeed = keys.run ? 4.0 : 2.8;
  const accel = player.onGround ? 0.22 : 0.15;
  const friction = player.onGround ? 0.82 : 0.94;

  if (keys.left) {
    player.vx = Math.max(player.vx - accel, -maxSpeed);
    player.facing = 'left';
  } else if (keys.right) {
    player.vx = Math.min(player.vx + accel, maxSpeed);
    player.facing = 'right';
  } else {
    player.vx *= friction;
    if (Math.abs(player.vx) < 0.08) player.vx = 0;
  }

  if (player.onGround) {
    player.coyoteTimer = 6;
  } else if (player.coyoteTimer > 0) {
    player.coyoteTimer--;
  }

  // Salto con altura variable estilo Super Mario Bros
  if (keys.jumpJustPressed && player.coyoteTimer > 0) {
    player.vy = -8.8;
    player.onGround = false;
    player.coyoteTimer = 0;
    player.jumpHoldTimer = 14;
  }
  keys.jumpJustPressed = false;

  if (keys.jump && player.jumpHoldTimer > 0 && player.vy < 0) {
    player.vy -= 0.34;
    player.jumpHoldTimer--;
  } else {
    player.jumpHoldTimer = 0;
  }

  // Gravedad
  player.vy = Math.min(player.vy + 0.52, 11);

  // No salir por la izquierda de la camara
  if (player.x < gameState.cameraX) {
    player.x = gameState.cameraX;
    if (player.vx < 0) player.vx = 0;
  }

  moveAndCollideEntity(player, true);

  // Caida a un barranco
  if (player.y > VIEW_H + 32) {
    killPlayer();
    return;
  }

  // Animacion de pasos
  if (!player.onGround) {
    player.animFrame = 0;
  } else if (Math.abs(player.vx) > 0.2) {
    player.animTimer += Math.abs(player.vx) * 0.12;
    player.animFrame = Math.floor(player.animTimer) % 3;
  } else {
    player.animFrame = 0;
    player.animTimer = 0;
  }

  // Camara sigue a Mario hacia adelante
  const targetCam = player.x - VIEW_W * 0.35;
  if (targetCam > gameState.cameraX) {
    gameState.cameraX = Math.min(targetCam, LEVEL_WIDTH * TILE - VIEW_W);
  }

  // Recoger Arepas flotantes
  for (const ar of arepas) {
    if (ar.collected) continue;
    if (
      player.x < ar.x + 28 &&
      player.x + player.w > ar.x &&
      player.y < ar.y + 28 &&
      player.y + player.h > ar.y
    ) {
      ar.collected = true;
      gameState.arepas++;
      gameState.score += 200;
      floatingTexts.push({
        x: ar.x,
        y: ar.y - 6,
        text: '+200',
        color: '#FFE484',
        life: 32
      });
      updateHUD();
    }
  }

  // Llegar al asta de la bandera de Venezuela (x = 140 * TILE)
  const poleX = 140 * TILE + 12;
  if (player.x + player.w >= poleX) {
    gameState.status = 'flagpole';
    player.x = poleX - player.w / 2;
    player.y = Math.max(player.y, 3 * TILE);
    player.vx = 0;
    player.vy = 3.2;
    player.facing = 'right';
    gameState.score += 1000;
    floatingTexts.push({
      x: player.x - 10,
      y: player.y,
      text: '¡VIVA VENEZUELA! +1000',
      color: '#FFCC00',
      life: 75
    });
    updateHUD();
  }
}

function updateEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    const en = enemies[i];
    if (en.dead) continue;
    if (en.kickGrace > 0) en.kickGrace--;

    // Solo activar cuando entra cerca de la camara
    if (en.x > gameState.cameraX + VIEW_W + 96) continue;

    en.vy = Math.min(en.vy + 0.52, 10);

    if (en.state === 'walk') {
      en.animTimer++;
      en.whistleTimer++;

      // Emitir las notas del silbido maldito de "El Silbon" (do, re, mi, fa, sol, la, si)
      if (en.whistleTimer % 52 === 0) {
        const notes = ['♪', '♫',];
        floatingTexts.push({
          x: en.x + (en.facing === 'left' ? -4 : 18),
          y: en.y - 6,
          text: notes[Math.floor(Math.random() * notes.length)],
          color: '#E2E8F0',
          life: 42
        });
      }

      // Evitar caer en barrancos mientras patrulla (da la vuelta como Koopa rojo)
      const lookAheadX = en.vx < 0 ? en.x - 4 : en.x + en.w + 4;
      const aheadTileX = Math.floor(lookAheadX / TILE);
      const footTileY = Math.floor((en.y + en.h + 4) / TILE);
      if (en.onGround && !isSolidAtTile(aheadTileX, footTileY)) {
        en.vx = -en.vx;
        en.facing = en.vx < 0 ? 'left' : 'right';
      }
    } else if (en.state === 'shell_idle') {
      en.vx = 0;
      en.shellTimer--;
      // Como Dry Bones / El Silbon inmortal: si no lo pateas a tiempo, sus huesos se reensamblan
      if (en.shellTimer <= 0) {
        en.state = 'walk';
        en.y -= 12;
        en.h = 42;
        en.vx = en.facing === 'left' ? -1.15 : 1.15;
        floatingTexts.push({
          x: en.x - 8,
          y: en.y - 8,
          text: '♪ ¡REVIVE!',
          color: '#FF4D4D',
          life: 36
        });
      }
    }

    moveAndCollideEntity(en, false);

    if (en.y > VIEW_H + 64) {
      en.dead = true;
      continue;
    }

    // Si es un caparazon de huesos pateado ('shell_moving'), arrolla a otras Tortugas Silbon
    if (en.state === 'shell_moving') {
      for (let j = 0; j < enemies.length; j++) {
        if (i === j) continue;
        const other = enemies[j];
        if (other.dead) continue;
        if (
          en.x < other.x + other.w &&
          en.x + en.w > other.x &&
          en.y < other.y + other.h &&
          en.y + en.h > other.y
        ) {
          other.dead = true;
          gameState.score += 200;
          floatingTexts.push({
            x: other.x,
            y: other.y,
            text: '+200',
            color: '#FFCC00',
            life: 35
          });
          updateHUD();
        }
      }
    }

    // Colision con Mario Veneko
    if (
      gameState.status === 'playing' &&
      player.x < en.x + en.w - 3 &&
      player.x + player.w > en.x + 3 &&
      player.y < en.y + en.h &&
      player.y + player.h > en.y
    ) {
      const playerBottom = player.y + player.h;
      const stomp = player.vy > 0 && playerBottom - player.vy <= en.y + 18;

      if (stomp) {
        // Mario pisa a la Tortuga Esqueleto El Silbon
        player.y = en.y - player.h;
        player.vy = -7.6;

        if (en.state === 'walk') {
          en.state = 'shell_idle';
          en.y += 12;
          en.h = 30;
          en.vx = 0;
          en.shellTimer = 260;
          gameState.score += 150;
          floatingTexts.push({
            x: en.x,
            y: en.y - 10,
            text: '¡SACO DE HUESOS! +150',
            color: '#FFFFFF',
            life: 40
          });
        } else if (en.state === 'shell_idle') {
          // Patear el saco/caparazon desde arriba
          en.state = 'shell_moving';
          en.kickGrace = 12;
          en.vx = player.x + player.w / 2 < en.x + en.w / 2 ? 6.8 : -6.8;
          gameState.score += 100;
        } else if (en.state === 'shell_moving') {
          en.state = 'shell_idle';
          en.vx = 0;
          en.shellTimer = 260;
        }
        updateHUD();
      } else if (en.state === 'shell_idle') {
        // Patear el caparazon de huesos al tocarlo de lado
        en.state = 'shell_moving';
        en.kickGrace = 12;
        const kickRight = player.x + player.w / 2 < en.x + en.w / 2;
        en.vx = kickRight ? 6.8 : -6.8;
        en.x += kickRight ? 6 : -6;
        gameState.score += 100;
        updateHUD();
      } else if (en.kickGrace <= 0) {
        // La Tortuga Silbon toca a Mario
        killPlayer();
      }
    }
  }
}

function updateHUD() {
  document.getElementById('hudScore').textContent = String(gameState.score).padStart(6, '0');
  document.getElementById('hudArepas').textContent = 'x' + String(gameState.arepas).padStart(2, '0');
  document.getElementById('hudTime').textContent = String(gameState.time).padStart(3, '0');
}

function update() {
  if (gameState.status === 'closed') return;

  // Animacion de rebote de bloques
  for (const k of Object.keys(brickBounces)) {
    brickBounces[k] += 1.4;
    if (brickBounces[k] >= 0) delete brickBounces[k];
  }

  // Particulas y textos flotantes
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life--;
    if (p.type === 'pop_arepa') {
      p.y += p.vy;
      p.vy += 0.45;
    } else {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
    }
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 0.7;
    ft.life--;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }

  if (gameState.status === 'playing') {
    gameState.timeTick++;
    if (gameState.timeTick >= 40) {
      gameState.timeTick = 0;
      gameState.time = Math.max(0, gameState.time - 1);
      updateHUD();
      if (gameState.time === 0) killPlayer();
    }

    updatePlayer();
    updateEnemies();
  } else if (gameState.status === 'dying') {
    player.y += player.vy;
    player.vy += 0.42;
    if (player.y > VIEW_H + 120) {
      resetStageAfterDeath();
    }
  } else if (gameState.status === 'flagpole') {
    // Mario baja por el asta mientras la bandera tricolor baja
    if (player.y < 11 * TILE) {
      player.y = Math.min(11 * TILE, player.y + 3.4);
    }
    if (gameState.flagY < 10 * TILE) {
      gameState.flagY = Math.min(10 * TILE, gameState.flagY + 3.2);
    }
    if (player.y >= 11 * TILE && gameState.flagY >= 10 * TILE) {
      gameState.status = 'walking_castle';
      player.facing = 'right';
    }
  } else if (gameState.status === 'walking_castle') {
    player.vx = 2.4;
    player.vy = Math.min(player.vy + 0.5, 8);
    moveAndCollideEntity(player, true);
    player.animTimer += 0.22;
    player.animFrame = Math.floor(player.animTimer) % 3;

    // Entra por la puerta del castillo final (x = 144.5 * TILE) y el juego se cierra
    if (player.x >= 144.4 * TILE) {
      finishAndCloseGame();
    }
  }
}

// ============================================================================
// RENDERIZADO
// ============================================================================
function drawBackground() {
  // Cielo azul clasico NES con toque calido
  ctx.fillStyle = '#5C94FC';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // Tepuyes / Montañas de fondo con parallax
  for (const m of mountains) {
    const sx = Math.floor(m.x - gameState.cameraX * 0.35);
    if (sx + m.w < -40 || sx > VIEW_W + 40) continue;
    const baseY = 13 * TILE;

    ctx.fillStyle = '#1E7A36';
    ctx.beginPath();
    ctx.moveTo(sx, baseY);
    ctx.lineTo(sx + m.w * 0.25, baseY - m.h);
    ctx.lineTo(sx + m.w * 0.75, baseY - m.h);
    ctx.lineTo(sx + m.w, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2EA048';
    ctx.fillRect(sx + m.w * 0.28, baseY - m.h, m.w * 0.44, 10);
  }

  // Nubes pixeladas
  for (const cl of clouds) {
    const sx = Math.floor(cl.x - gameState.cameraX * 0.5);
    if (sx + cl.w < -40 || sx > VIEW_W + 40) continue;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(sx + 8, cl.y, cl.w - 16, 20);
    ctx.fillRect(sx, cl.y + 6, cl.w, 14);
    ctx.fillStyle = '#DCE8FF';
    ctx.fillRect(sx + 4, cl.y + 18, cl.w - 8, 4);
  }
}

function drawTile(tx, ty, type) {
  const sx = Math.floor(tx * TILE - gameState.cameraX);
  const bounce = brickBounces[`${tx},${ty}`] || 0;
  const sy = Math.floor(ty * TILE + bounce);

  if (type === 'G') {
    // Suelo de ladrillo clasico
    ctx.fillStyle = '#C84C0C';
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = '#FCBCB0';
    ctx.fillRect(sx, sy, TILE - 2, 2);
    ctx.fillRect(sx, sy, 2, TILE - 2);
    ctx.fillStyle = '#501800';
    ctx.fillRect(sx, sy + 15, TILE, 2);
    ctx.fillRect(sx + 15, sy, 2, 16);
    ctx.fillRect(sx + 7, sy + 16, 2, 16);
  } else if (type === 'B') {
    // Ladrillo rompible/golpeable
    ctx.fillStyle = '#D84E09';
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = '#FCA044';
    ctx.fillRect(sx, sy, TILE, 2);
    ctx.fillStyle = '#381000';
    for (let row = 1; row <= 3; row++) {
      ctx.fillRect(sx, sy + row * 8, TILE, 2);
    }
    ctx.fillRect(sx + 14, sy, 2, 8);
    ctx.fillRect(sx + 6, sy + 8, 2, 8);
    ctx.fillRect(sx + 22, sy + 8, 2, 8);
    ctx.fillRect(sx + 14, sy + 16, 2, 8);
    ctx.fillRect(sx + 8, sy + 24, 2, 8);
  } else if (type === 'Q') {
    // Bloque ? de Arepas con destello animado
    const pulse = Math.floor(Date.now() / 180) % 3;
    ctx.fillStyle = pulse === 0 ? '#FC9838' : pulse === 1 ? '#FFCC00' : '#E47818';
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.strokeStyle = '#501800';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 1, sy + 1, TILE - 2, TILE - 2);
    // Clavos en las esquinas
    ctx.fillStyle = '#501800';
    ctx.fillRect(sx + 3, sy + 3, 2, 2);
    ctx.fillRect(sx + TILE - 5, sy + 3, 2, 2);
    ctx.fillRect(sx + 3, sy + TILE - 5, 2, 2);
    ctx.fillRect(sx + TILE - 5, sy + TILE - 5, 2, 2);
    // Signo ?
    ctx.fillStyle = '#501800';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('?', sx + 11, sy + 23);
    ctx.fillStyle = '#FFF';
    ctx.fillText('?', sx + 9, sy + 21);
  } else if (type === 'E') {
    // Bloque usado
    ctx.fillStyle = '#8C7853';
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.strokeStyle = '#2C221E';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 1, sy + 1, TILE - 2, TILE - 2);
  } else if (type === 'S') {
    // Bloque solido de escalera
    ctx.fillStyle = '#DC641C';
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = '#FCA868';
    ctx.fillRect(sx + 2, sy + 2, TILE - 6, 3);
    ctx.fillRect(sx + 2, sy + 2, 3, TILE - 6);
    ctx.fillStyle = '#601800';
    ctx.fillRect(sx + TILE - 4, sy + 2, 4, TILE - 2);
    ctx.fillRect(sx + 2, sy + TILE - 4, TILE - 2, 4);
  } else if (type === 'P' || type === 'p') {
    // Boca de tuberia (izquierda 'P', derecha 'p')
    ctx.fillStyle = '#00A800';
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = '#80F018';
    if (type === 'P') ctx.fillRect(sx + 4, sy + 2, 8, TILE - 2);
    ctx.fillStyle = '#005000';
    if (type === 'p') ctx.fillRect(sx + TILE - 8, sy + 2, 6, TILE - 2);
    ctx.strokeStyle = '#002800';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy + 1, TILE, TILE - 2);
  } else if (type === 'L' || type === 'l') {
    // Cuerpo de tuberia
    const offset = type === 'L' ? 3 : 0;
    const width = TILE - 3;
    ctx.fillStyle = '#00A800';
    ctx.fillRect(sx + offset, sy, width, TILE);
    ctx.fillStyle = '#80F018';
    if (type === 'L') ctx.fillRect(sx + 7, sy, 7, TILE);
    ctx.fillStyle = '#005000';
    if (type === 'l') ctx.fillRect(sx + TILE - 11, sy, 6, TILE);
    ctx.fillStyle = '#002800';
    if (type === 'L') ctx.fillRect(sx + 2, sy, 2, TILE);
    if (type === 'l') ctx.fillRect(sx + TILE - 4, sy, 2, TILE);
  }
}

function drawFlagAndCastle() {
  // Asta de la bandera en x = 140
  const poleX = Math.floor(140 * TILE + 14 - gameState.cameraX);
  ctx.fillStyle = '#D8F878';
  ctx.fillRect(poleX, 3 * TILE, 4, 9 * TILE);
  // Esfera dorada en la punta
  ctx.fillStyle = '#FFCC00';
  ctx.fillRect(poleX - 4, 3 * TILE - 8, 12, 10);

  // Bandera de Venezuela (Amarillo, Azul con 8 estrellas en arco, Rojo)
  const fx = poleX - 44;
  const fy = Math.floor(gameState.flagY);
  ctx.fillStyle = '#FFCC00';
  ctx.fillRect(fx, fy, 44, 10);
  ctx.fillStyle = '#0038A8';
  ctx.fillRect(fx, fy + 10, 44, 10);
  ctx.fillStyle = '#CF142B';
  ctx.fillRect(fx, fy + 20, 44, 10);
  // Arco de estrellas blancas
  ctx.fillStyle = '#FFFFFF';
  for (let s = 0; s < 7; s++) {
    const starX = fx + 10 + s * 4;
    const starY = fy + 15 - Math.round(Math.sin((s / 6) * Math.PI) * 4);
    ctx.fillRect(starX, starY, 2, 2);
  }

  // Castillo final en x = 143..147
  const cx = Math.floor(143 * TILE - gameState.cameraX);
  const cy = 8 * TILE;
  ctx.fillStyle = '#C84C0C';
  ctx.fillRect(cx, cy + 32, 4 * TILE, 4 * TILE);
  ctx.fillRect(cx + 20, cy, 4 * TILE - 40, 32);

  // Almenas del castillo
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(cx + i * 34, cy + 22, 22, 12);
  }

  // Puerta oscura donde entra Mario para terminar y cerrar el juego
  ctx.fillStyle = '#000000';
  ctx.fillRect(cx + 46, cy + 84, 36, 44);
  ctx.beginPath();
  ctx.arc(cx + 64, cy + 84, 18, Math.PI, 0);
  ctx.fill();
}

function draw() {
  if (gameState.status === 'closed') return;

  drawBackground();

  // Dibujar tiles visibles
  const startCol = Math.max(0, Math.floor(gameState.cameraX / TILE) - 1);
  const endCol = Math.min(LEVEL_WIDTH - 1, Math.ceil((gameState.cameraX + VIEW_W) / TILE) + 1);

  for (let y = 0; y < LEVEL_HEIGHT; y++) {
    for (let x = startCol; x <= endCol; x++) {
      const t = map[y][x];
      if (t !== '.') drawTile(x, y, t);
    }
  }

  drawFlagAndCastle();

  // Dibujar Arepas coleccionables
  const arepaFrame = Math.floor(Date.now() / 150) % 4;
  for (const ar of arepas) {
    if (ar.collected) continue;
    const sx = Math.floor(ar.x - gameState.cameraX);
    if (sx < -32 || sx > VIEW_W + 32) continue;
    const bob = Math.sin(Date.now() / 220 + ar.phase) * 3;
    ctx.drawImage(SPRITE_CACHE.arepa[arepaFrame], sx, Math.floor(ar.y + bob));
  }

  // Dibujar Tortugas Esqueleto "El Silbon"
  for (const en of enemies) {
    if (en.dead) continue;
    const sx = Math.floor(en.x - gameState.cameraX);
    if (sx < -48 || sx > VIEW_W + 48) continue;

    const dir = en.facing === 'right' ? 'right' : 'left';
    let sprite;
    let shakeX = 0;

    if (en.state === 'walk') {
      const f = Math.floor(en.animTimer / 10) % 2 === 0 ? 'walk1' : 'walk2';
      sprite = SPRITE_CACHE.silbon[dir][f];
    } else {
      sprite = SPRITE_CACHE.silbon[dir].shell;
      // Si esta por revivir, tiembla el saco de huesos
      if (en.state === 'shell_idle' && en.shellTimer < 70) {
        shakeX = (en.shellTimer % 4 < 2) ? -2 : 2;
      }
    }

    ctx.drawImage(sprite, sx + shakeX, Math.floor(en.y));
  }

  // Dibujar a Mario Veneko (si no entro ya al castillo)
  if (gameState.status !== 'closed') {
    const dir = player.facing;
    let pose = 'idle';
    if (gameState.status === 'dying') {
      pose = 'dead';
    } else if (gameState.status === 'flagpole') {
      pose = 'climb';
    } else if (!player.onGround && gameState.status === 'playing') {
      pose = 'jump';
    } else if (
      gameState.status === 'playing' &&
      ((keys.left && player.vx > 0.6) || (keys.right && player.vx < -0.6))
    ) {
      pose = 'skid';
    } else if (Math.abs(player.vx) > 0.2 || gameState.status === 'walking_castle') {
      pose = ['run1', 'run2', 'run3'][player.animFrame];
    }

    const marioSprite = SPRITE_CACHE.mario[dir][pose];
    ctx.drawImage(
      marioSprite,
      Math.floor(player.x - gameState.cameraX - 3),
      Math.floor(player.y)
    );
  }

  // Dibujar particulas (arepas saliendo de bloques y migas de ladrillo)
  for (const p of particles) {
    const sx = Math.floor(p.x - gameState.cameraX);
    if (p.type === 'pop_arepa') {
      ctx.drawImage(SPRITE_CACHE.arepa[arepaFrame], sx, Math.floor(p.y));
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(sx, Math.floor(p.y), 6, 6);
    }
  }

  // Textos flotantes (notas de El Silbon y puntos de Arepas)
  ctx.font = 'bold 13px monospace';
  for (const ft of floatingTexts) {
    const sx = Math.floor(ft.x - gameState.cameraX);
    ctx.fillStyle = '#000000';
    ctx.fillText(ft.text, sx + 1, Math.floor(ft.y) + 1);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, sx, Math.floor(ft.y));
  }
}

// Bucle principal con control de FPS / velocidad (evita que vaya rapido en monitores de 120Hz/144Hz+)
let lastTime = performance.now();
let accumulator = 0;

function gameLoop(now) {
  if (gameState.status === 'closed') return;

  const deltaMs = Math.min(now - lastTime, 100);
  lastTime = now;

  const stepMs = (1000 / 60) / GAME_SPEED;
  accumulator += deltaMs;

  while (accumulator >= stepMs) {
    update();
    accumulator -= stepMs;
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// Inicializar mini-icono de Arepa en el HUD superior
function drawHudArepaIcon() {
  const iconCanvas = document.getElementById('hudArepaIcon');
  if (!iconCanvas) return;
  const ictx = iconCanvas.getContext('2d');
  ictx.imageSmoothingEnabled = false;
  ictx.drawImage(SPRITE_CACHE.arepa[0], 0, 0, 22, 22);
}

buildLevel();
updateHUD();
drawHudArepaIcon();
requestAnimationFrame(gameLoop);
