const CANVAS = { width: 800, height: 600 };
const MAX_DT = 1 / 30;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const BRICK = { rows: 5, cols: 10, width: 70, height: 20, gap: 6, offsetTop: 60 };
const POINTS_PER_BRICK = 10;
const INITIAL_LIVES = 3;
const BRICK_ROW_COLORS = ['red', 'yellow', 'green', 'cyan', 'magenta']; // de arriba hacia abajo

// '#' = ladrillo, '.' = vacío; 10 columnas por fila, hasta 5 filas
const LEVELS = [
  { ballSpeed: 350, layout: [
    '##########',
    '##########',
    '##########',
    '##########',
    '##########',
  ] },
  { ballSpeed: 400, layout: [
    '....##....',
    '...####...',
    '..######..',
    '.########.',
    '##########',
  ] },
  { ballSpeed: 450, layout: [
    '#.#.#.#.#.',
    '.#.#.#.#.#',
    '#.#.#.#.#.',
    '.#.#.#.#.#',
    '#.#.#.#.#.',
  ] },
];

function createBricks(levelIndex) {
  const { layout } = LEVELS[levelIndex];
  const totalWidth = BRICK.cols * BRICK.width + (BRICK.cols - 1) * BRICK.gap;
  const offsetLeft = (CANVAS.width - totalWidth) / 2;
  const bricks = [];
  for (let row = 0; row < layout.length; row++) {
    for (let col = 0; col < BRICK.cols; col++) {
      if (layout[row][col] !== '#') continue;
      bricks.push({
        x: offsetLeft + col * (BRICK.width + BRICK.gap),
        y: BRICK.offsetTop + row * (BRICK.height + BRICK.gap),
        width: BRICK.width,
        height: BRICK.height,
        color: BRICK_ROW_COLORS[row % BRICK_ROW_COLORS.length],
        alive: true,
      });
    }
  }
  return bricks;
}

const state = {
  phase: 'ready',
  level: 1, // 1..LEVELS.length
  score: 0,
  lives: INITIAL_LIVES,
  paddle: {
    x: (CANVAS.width - 100) / 2,
    y: CANVAS.height - 40,
    width: 100,
    height: 14,
    speed: 600,
  },
  ball: { x: 0, y: 0, radius: 8, vx: 0, vy: 0, speed: LEVELS[0].ballSpeed },
  bricks: createBricks(0),
  explosions: [],
};

function stickBallToPaddle() {
  const { paddle, ball } = state;
  ball.x = paddle.x + paddle.width / 2;
  ball.y = paddle.y - ball.radius;
}

function launchBall() {
  if (state.phase !== 'ready') return;
  state.phase = 'playing';
  state.ball.vx = 0;
  state.ball.vy = -state.ball.speed;
}

function restartGame() {
  state.score = 0;
  state.lives = INITIAL_LIVES;
  state.level = 1;
  state.bricks = createBricks(0);
  state.ball.speed = LEVELS[0].ballSpeed;
  state.explosions = [];
  state.ball.vx = 0;
  state.ball.vy = 0;
  state.phase = 'ready';
  stickBallToPaddle();
}

// Un solo gesto por evento: según la fase lanza o reinicia, nunca ambos
function handleAction() {
  if (state.phase === 'ready') launchBall();
  else if (state.phase === 'won' || state.phase === 'lost') restartGame();
}

const input = { left: false, right: false, mouseX: null, last: 'keys' };

const KEY_MAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!e.repeat) handleAction();
    return;
  }
  const dir = KEY_MAP[e.code];
  if (!dir) return;
  input[dir] = true;
  input.last = 'keys';
  e.preventDefault();
});

window.addEventListener('keyup', (e) => {
  const dir = KEY_MAP[e.code];
  if (!dir) return;
  input[dir] = false;
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  input.mouseX = (e.clientX - rect.left) * (CANVAS.width / rect.width);
  input.last = 'mouse';
});

canvas.addEventListener('mousedown', handleAction);

let lastTime = null;

function update(dt) {
  const { paddle } = state;
  if (input.last === 'mouse' && input.mouseX !== null) {
    paddle.x = input.mouseX - paddle.width / 2;
  } else {
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    paddle.x += dir * paddle.speed * dt;
  }
  paddle.x = Math.max(0, Math.min(CANVAS.width - paddle.width, paddle.x));

  for (const explosion of state.explosions) explosion.elapsed += dt;
  state.explosions = state.explosions.filter((e) => e.elapsed * 1000 < EXPLOSION_DURATION);

  if (state.phase === 'ready') stickBallToPaddle();
  if (state.phase === 'playing') moveBall(dt);
}

function moveBall(dt) {
  const { ball } = state;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x + ball.radius > CANVAS.width) {
    ball.x = CANVAS.width - ball.radius;
    ball.vx = -Math.abs(ball.vx);
  }

  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy);
  }

  bounceOnPaddle();
  bounceOnBricks();

  if (state.bricks.every((b) => !b.alive)) {
    ball.vx = 0;
    ball.vy = 0;
    state.phase = 'won';
    return;
  }

  if (ball.y - ball.radius > CANVAS.height) loseLife();
}

function loseLife() {
  const { ball } = state;
  state.lives -= 1;
  ball.vx = 0;
  ball.vy = 0;
  state.phase = state.lives > 0 ? 'ready' : 'lost';
  if (state.phase === 'ready') stickBallToPaddle();
}

function bounceOnBricks() {
  const { ball } = state;
  for (const brick of state.bricks) {
    if (!brick.alive) continue;

    const nearestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
    const nearestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
    const dx = ball.x - nearestX;
    const dy = ball.y - nearestY;
    if (dx * dx + dy * dy >= ball.radius * ball.radius) continue;

    brick.alive = false;
    state.score += POINTS_PER_BRICK;
    state.explosions.push({
      x: brick.x,
      y: brick.y,
      width: brick.width,
      height: brick.height,
      color: brick.color,
      elapsed: 0,
    });

    // Rebota por el eje con menor penetración
    const overlapX = Math.min(ball.x + ball.radius - brick.x, brick.x + brick.width - (ball.x - ball.radius));
    const overlapY = Math.min(ball.y + ball.radius - brick.y, brick.y + brick.height - (ball.y - ball.radius));
    if (overlapX < overlapY) {
      ball.vx = -ball.vx;
    } else {
      ball.vy = -ball.vy;
    }
    break;
  }
}

const MAX_BOUNCE_ANGLE = (60 * Math.PI) / 180;

function bounceOnPaddle() {
  const { ball, paddle } = state;
  if (ball.vy <= 0) return;

  const hits =
    ball.x + ball.radius > paddle.x &&
    ball.x - ball.radius < paddle.x + paddle.width &&
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height;
  if (!hits) return;

  const center = paddle.x + paddle.width / 2;
  const offset = Math.max(-1, Math.min(1, (ball.x - center) / (paddle.width / 2)));
  const angle = offset * MAX_BOUNCE_ANGLE;
  ball.vx = ball.speed * Math.sin(angle);
  ball.vy = -ball.speed * Math.cos(angle);
  ball.y = paddle.y - ball.radius;
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

  ctx.imageSmoothingEnabled = false;
  for (const brick of state.bricks) {
    if (!brick.alive) continue;
    drawSprite(ctx, `block_${brick.color}`, brick.x, brick.y, brick.width, brick.height);
  }

  for (const explosion of state.explosions) {
    const frame = Math.min(3, Math.floor(((explosion.elapsed * 1000) / EXPLOSION_DURATION) * 4));
    drawFrame(ctx, EXPLOSION_FRAMES[explosion.color][frame], explosion.x, explosion.y, explosion.width, explosion.height);
  }

  const { paddle } = state;
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.width, paddle.height);

  const { ball } = state;
  drawSprite(ctx, 'ball', ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);

  drawHud();
  if (state.phase === 'won' || state.phase === 'lost') drawOverlay();
}

function drawOverlay() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

  ctx.fillStyle = '#eee';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(state.phase === 'won' ? 'Ganaste' : 'Game Over', CANVAS.width / 2, CANVAS.height / 2 - 40);
  ctx.font = '24px sans-serif';
  ctx.fillText(`Puntaje final: ${state.score}`, CANVAS.width / 2, CANVAS.height / 2 + 10);
  ctx.font = '18px sans-serif';
  ctx.fillText('Espacio o click para reiniciar', CANVAS.width / 2, CANVAS.height / 2 + 50);
}

function drawHud() {
  ctx.fillStyle = '#eee';
  ctx.font = '20px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(`Puntaje: ${state.score}`, 20, 30);
  ctx.textAlign = 'right';
  ctx.fillText(`Vidas: ${state.lives}`, CANVAS.width - 20, 30);
}

function loop(time) {
  if (lastTime === null) lastTime = time;
  const dt = Math.min((time - lastTime) / 1000, MAX_DT);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

loadSpritesheet(() => requestAnimationFrame(loop));
