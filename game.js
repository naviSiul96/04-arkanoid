const CANVAS = { width: 800, height: 600 };
const MAX_DT = 1 / 30;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  phase: 'ready',
  paddle: {
    x: (CANVAS.width - 100) / 2,
    y: CANVAS.height - 40,
    width: 100,
    height: 14,
    speed: 600,
  },
  ball: { x: 0, y: 0, radius: 8, vx: 0, vy: 0, speed: 350 },
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
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

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
