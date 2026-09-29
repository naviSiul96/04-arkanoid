const CANVAS = { width: 800, height: 600 };
const MAX_DT = 1 / 30;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const BRICK = { rows: 5, cols: 10, width: 70, height: 20, gap: 6, offsetTop: 60 };
const POINTS_PER_BRICK = 10;
const BRICK_COLORS = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db'];

function createBricks() {
  const totalWidth = BRICK.cols * BRICK.width + (BRICK.cols - 1) * BRICK.gap;
  const offsetLeft = (CANVAS.width - totalWidth) / 2;
  const bricks = [];
  for (let row = 0; row < BRICK.rows; row++) {
    for (let col = 0; col < BRICK.cols; col++) {
      bricks.push({
        x: offsetLeft + col * (BRICK.width + BRICK.gap),
        y: BRICK.offsetTop + row * (BRICK.height + BRICK.gap),
        width: BRICK.width,
        height: BRICK.height,
        row,
        alive: true,
      });
    }
  }
  return bricks;
}

const state = {
  phase: 'ready',
  score: 0,
  paddle: {
    x: (CANVAS.width - 100) / 2,
    y: CANVAS.height - 40,
    width: 100,
    height: 14,
    speed: 600,
  },
  ball: { x: 0, y: 0, radius: 8, vx: 0, vy: 0, speed: 350 },
  bricks: createBricks(),
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
    if (!e.repeat) launchBall();
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

canvas.addEventListener('mousedown', launchBall);

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

  for (const brick of state.bricks) {
    if (!brick.alive) continue;
    ctx.fillStyle = BRICK_COLORS[brick.row % BRICK_COLORS.length];
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
  }

  const { paddle } = state;
  ctx.fillStyle = '#eee';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  const { ball } = state;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function loop(time) {
  if (lastTime === null) lastTime = time;
  const dt = Math.min((time - lastTime) / 1000, MAX_DT);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
