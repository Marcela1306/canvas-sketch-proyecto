import CanvasSketch from 'https://cdn.skypack.dev/canvas-sketch';
import colormap from 'https://cdn.skypack.dev/colormap';
import math from 'https://cdn.skypack.dev/canvas-sketch-util/math';
import random from 'https://cdn.skypack.dev/canvas-sketch-util/random';
import * as dat from 'https://cdn.skypack.dev/dat.gui';

const settings = {
  dimensions: [window.innerWidth, window.innerHeight],
  animate: true,
};

let audio, audioContext, analyserNode, audioData, sourceNode, mouse;
const colors = colormap({
  colormap: 'cool',
  nshades: 128,
  format: 'hex',
  alpha: 1,
});

let particles = [];
let particleCount = 300;

// Configuración inicial de controles
const gui = new dat.GUI();
const params = {
  particleCount: 300,
  baseRadius: 200,
  speedMultiplier: 1,
  sizeMultiplier: 1,
  colorMap: 'plasma',
};

// Generar partículas
const createParticles = () => {
  particles.length = 0;
  for (let i = 0; i < params.particleCount; i++) {
    particles.push({
      angle: random.range(0, Math.PI * 2),
      radius: random.range(params.baseRadius, params.baseRadius + 300),
      speed: random.range(0.001, 0.02) * params.speedMultiplier,
      size: random.range(3, 6) * params.sizeMultiplier,
      color: colors[random.rangeFloor(0, colors.length)],
      opacity: random.range(0.5, 1),
      x: 0,
      y: 0,
    });
  }
};
createParticles();

// Configurar mouse
mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX / window.innerWidth - 0.5;
  mouse.y = e.clientY / window.innerHeight - 0.5;
});

// Esquema de visualización
const sketch = () => {
  return ({ context, width, height, time }) => {
    if (!audioContext) return;

    analyserNode.getFloatFrequencyData(audioData);

    // Fondo dinámico con fractales
    const gradient = context.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      600
    );
    const color1 = `hsl(${Math.sin(time * 0.5) * 180 + 180}, 70%, 50%)`;
    const color2 = `hsl(${Math.cos(time * 0.3) * 180 + 180}, 50%, 30%)`;
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    // Ondas reactivas
    context.beginPath();
    for (let i = 0; i < audioData.length; i++) {
      const x = math.mapRange(i, 0, audioData.length - 1, 0, width);
      const y = math.mapRange(audioData[i], -100, 0, height, height / 2);
      context.lineTo(x, y);
    }
    context.strokeStyle = `rgba(255, 255, 255, 0.3)`;
    context.lineWidth = 2;
    context.stroke();

    // Dibujar partículas
    context.save();
    context.translate(width / 2, height / 2);

    particles.forEach((particle, i) => {
      const freq = audioData[i % audioData.length];
      const scale = math.mapRange(freq, -100, 0, 0.8, 2);

      particle.angle += particle.speed * scale;
      particle.radius += Math.sin(time * 0.01) * 0.5;

      const x =
        Math.cos(particle.angle + mouse.x * 2) * particle.radius +
        Math.sin(time * 0.5) * 50;
      const y =
        Math.sin(particle.angle + mouse.y * 2) * particle.radius +
        Math.cos(time * 0.5) * 50;

      context.beginPath();
      context.arc(x, y, particle.size * scale, 0, Math.PI * 2);
      context.fillStyle = particle.color;
      context.globalAlpha = particle.opacity * scale;
      context.fill();
    });

    context.restore();
  };
};

// Crear contexto de audio
const createAudioContext = () => {
  audioContext = new AudioContext();
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 256;

  audio = document.createElement('audio');
  audio.src = './audio/Palillos Chinos Banda Cumbia.mp3';
  audio.crossOrigin = 'anonymous';
  audio.volume = 0.5;

  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(analyserNode);
  analyserNode.connect(audioContext.destination);

  audioData = new Float32Array(analyserNode.frequencyBinCount);
};

// Controlar audio y contexto
const playAudioOnUserAction = () => {
  if (!audioContext) {
    createAudioContext();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  audio.play();
};

// Agregar controles interactivos con dat.GUI
gui.add(params, 'particleCount', 50, 1000, 1).onChange(createParticles);
gui.add(params, 'baseRadius', 100, 500, 10).onChange(createParticles);
gui.add(params, 'speedMultiplier', 0.1, 3, 0.1).onChange(createParticles);
gui.add(params, 'sizeMultiplier', 0.5, 5, 0.1).onChange(createParticles);

document.getElementById('playPauseButton').addEventListener('click', playAudioOnUserAction);

CanvasSketch(sketch, settings);
