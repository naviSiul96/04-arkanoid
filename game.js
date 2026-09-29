const CANVAS = { width: 800, height: 600 };
const MAX_DT = 1 / 30;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  paddle: {
    x: (CANVAS.width - 100) / 2,
    y: CANVAS.height - 40,
    width: 100,
    height: 14,
    speed: 600,
  },
};

const input = { left: false, right: false, mouseX: null, last: 'keys' };

const KEY_MAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};

window.addEventListener('keydown', (e) => {
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
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

  const { paddle } = state;
  ctx.fillStyle = '#eee';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
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
