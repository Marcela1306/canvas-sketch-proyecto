import CanvasSketch from 'https://cdn.skypack.dev/canvas-sketch';
import colormap from 'https://cdn.skypack.dev/colormap';
import math from 'https://cdn.skypack.dev/canvas-sketch-util/math';
import random from 'https://cdn.skypack.dev/canvas-sketch-util/random';

const settings = {
  dimensions: [window.innerWidth, window.innerHeight],
  animate: true,
  scaleToView: true,
};

let audio, audioContext, analyserNode, audioData, sourceNode;
const colors = colormap({
  colormap: 'cool',
  nshades: 128,
  format: 'hex',
  alpha: 1,
});

let particles = [];
let particleCount = 150;
let rings = 4;
const baseRadius = 150;

// Crear partículas iniciales
const createParticles = () => {
  particles.length = 0;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      angle: random.range(0, Math.PI * 2),
      radius: random.range(baseRadius, baseRadius + 200),
      speed: random.range(0.001, 0.01),
      size: random.range(3, 5),
      color: colors[random.rangeFloor(0, colors.length)],
      opacity: random.range(0.3, 1),
      x: 0,
      y: 0,
    });
  }
};
createParticles();

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

let isPlaying = false;
let volume = 0.5;

const sketch = () => {
  return ({ context, width, height, time }) => {
    if (!audioContext) return;

    analyserNode.getFloatFrequencyData(audioData);

    // Fondo dinámico con gradiente suave
    const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 600);
    const color1 = `hsl(${Math.sin(time * 0.5) * 180 + 180}, 70%, 50%)`;
    const color2 = `hsl(${Math.cos(time * 0.3) * 180 + 180}, 50%, 30%)`;
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    // Dibujar partículas con movimiento sencillo
    context.save();
    context.translate(width / 2, height / 2);

    particles.forEach((particle) => {
      particle.angle += particle.speed;
      const x = Math.cos(particle.angle) * particle.radius;
      const y = Math.sin(particle.angle) * particle.radius;

      // Hacer que las partículas se muevan con el mouse
      const distX = mouseX - width / 2;
      const distY = mouseY - height / 2;
      const distance = Math.sqrt(distX * distX + distY * distY);
      const mouseFactor = math.mapRange(distance, 0, width / 2, 1.5, 0.5, true);

      particle.size = 5 * mouseFactor;

      context.beginPath();
      context.arc(x, y, particle.size, 0, Math.PI * 2);
      context.fillStyle = particle.color;
      context.globalAlpha = particle.opacity;
      context.fill();
    });

    // Dibujar anillos dinámicos
    for (let i = 0; i < rings; i++) {
      const ringRadius = baseRadius + i * 50 + Math.sin(time * 0.1 + i) * 20;
      const audioFactor = math.mapRange(audioData[i], -100, -30, 1, 3, true);
      context.beginPath();
      context.arc(0, 0, ringRadius, 0, Math.PI * 2);
      context.strokeStyle = colors[(i * 20 + Math.floor(time * 50)) % colors.length];
      context.lineWidth = 3 + audioFactor;
      context.stroke();
    }

    context.restore();
  };
};

// Función para crear el contexto de audio
const createAudioContext = () => {
  audioContext = new AudioContext();
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 128;
  analyserNode.smoothingTimeConstant = 0.8;

  audio = document.createElement('audio');
  audio.src = '/audio/Palillos Chinos Banda Cumbia.mp3';
  audio.crossOrigin = 'anonymous';
  audio.volume = volume;

  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(analyserNode);
  analyserNode.connect(audioContext.destination);

  audioData = new Float32Array(analyserNode.frequencyBinCount);
};

// Función para manejar la interacción del usuario
const playAudioOnUserAction = () => {
  if (!audioContext) {
    createAudioContext();
  }

  // Reanudar el AudioContext si es necesario
  if (audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      if (!isPlaying) {
        audio.play();
        isPlaying = true;
      }
    });
  } else {
    // Reproducir el audio si el AudioContext está activo
    if (!isPlaying) {
      audio.play();
      isPlaying = true;
    }
  }
};

// Manejador de clic para reproducir el audio
document.getElementById('playPauseButton').addEventListener('click', playAudioOnUserAction);

CanvasSketch(sketch, settings);
