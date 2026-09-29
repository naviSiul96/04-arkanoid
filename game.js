const CANVAS = { width: 800, height: 600 };
const MAX_DT = 1 / 30;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let lastTime = null;

function update(dt) {}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
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
