const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Cuadrícula Animada
function drawGrid() {
  const cols = 20;
  const rows = 20;
  const cellWidth = canvas.width / cols;
  const cellHeight = canvas.height / rows;

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const posX = x * cellWidth + cellWidth / 2;
      const posY = y * cellHeight + cellHeight / 2;

      const noise = Math.sin((x + y + performance.now() / 1000) * 0.5) * 5;
      ctx.beginPath();
      ctx.arc(posX + noise, posY + noise, 5, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(x + y) * 10}, 50%, 50%)`;
      ctx.fill();
    }
  }
}

// Curvas Bézier Interactivas
let points = [
  { x: 100, y: 300 },
  { x: 300, y: 200 },
  { x: 500, y: 400 }
];

function drawBezier() {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    const cp = points[i - 1];
    const ep = points[i];
    ctx.quadraticCurveTo(cp.x, cp.y, ep.x, ep.y);
  }
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Sistema de Partículas
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = Math.random() * 2 - 1;
    this.vy = Math.random() * 2 - 1;
    this.radius = 3;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    this.draw();
  }
}

const particles = [];
for (let i = 0; i < 100; i++) {
  particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
}

// Visualización de Audio
const audio = new Audio('./assets/Palillos Chinos Banda Cumbia.mp3');
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);

source.connect(analyser);
analyser.connect(audioContext.destination);

function visualizeAudio() {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const barWidth = canvas.width / bufferLength;

  dataArray.forEach((value, index) => {
    const barHeight = (value / 255) * canvas.height;
    const x = index * barWidth;
    const y = canvas.height - barHeight;

    ctx.fillStyle = `rgb(${value}, 50, 150)`;
    ctx.fillRect(x, y, barWidth, barHeight);
  });

  requestAnimationFrame(visualizeAudio);
}

// Animación Principal
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawBezier();
  particles.forEach(particle => particle.update());
  requestAnimationFrame(animate);
}

audio.addEventListener('play', () => {
  audioContext.resume();
  visualizeAudio();
});

animate();
audio.play();
