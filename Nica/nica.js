import CanvasSketch from 'https://cdn.skypack.dev/canvas-sketch';
import colormap from 'https://cdn.skypack.dev/colormap';
import math from 'https://cdn.skypack.dev/canvas-sketch-util/math';
import random from 'https://cdn.skypack.dev/canvas-sketch-util/random';

const settings = {
    dimensions: [window.innerWidth, window.innerHeight], // Tamaño dinámico
    animate: true,
    scaleToView: true,
};

let audio, audioContext, analyserNode, audioData, sourceNode;

const colors = colormap({
  colormap: 'plasma',
  nshades: 256,
  format: 'hex',
  alpha: 1,
});

const sketch = () => {
  const particles = [];
  const particleCount = 500; // partículas dinámicas
  const rings = 6; // Capas de anillos
  const baseRadius = 200;

  // Crear partículas iniciales
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      angle: random.range(0, Math.PI * 2),
      radius: random.range(baseRadius, baseRadius + 300),
      speed: random.range(0.001, 0.01),
      size: random.range(2, 6),
      color: colors[random.rangeFloor(0, colors.length)],
    });
  }

  return ({ context, width, height, time }) => {
    if (!audioContext) return;

    analyserNode.getFloatFrequencyData(audioData);

    // Fondo dinámico con transiciones
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

    context.save();
    context.translate(width / 2, height / 2);

    // Dibujar partículas dinámicas
    particles.forEach((particle, index) => {
      const audioIndex = math.clamp(index % audioData.length, 0, audioData.length - 1);
      const audioValue = audioData[audioIndex];
      const audioFactor = math.mapRange(audioValue, -100, -30, 0.5, 2, true);

      particle.angle += particle.speed;
      const x = Math.cos(particle.angle) * particle.radius * audioFactor;
      const y = Math.sin(particle.angle) * particle.radius * audioFactor;

      context.beginPath();
      context.arc(x, y, particle.size * audioFactor, 0, Math.PI * 2);
      context.fillStyle = particle.color;
      context.shadowColor = particle.color;
      context.shadowBlur = 20; // Efecto de resplandor
      context.fill();
    });

    // Dibujar anillos dinámicos
    for (let i = 0; i < rings; i++) {
      const ringRadius = baseRadius + i * 50;
      context.beginPath();
      context.arc(0, 0, ringRadius, 0, Math.PI * 2);
      context.strokeStyle = colors[(i * 20 + Math.floor(time * 50)) % colors.length];
      context.lineWidth = 3 + Math.sin(time + i) * 2;
      context.shadowColor = context.strokeStyle;
      context.shadowBlur = 15;
      context.stroke();
    }

    context.restore();
  };
};

const createAudio = () => {
  audio = document.createElement('audio');
  audio.src = '/audio/Palillos Chinos Banda Cumbia.mp3'; // Cambiar al archivo que prefieras
  audio.crossOrigin = 'anonymous';

  audioContext = new AudioContext();
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 256;
  analyserNode.smoothingTimeConstant = 0.8;

  sourceNode.connect(analyserNode);
  audioData = new Float32Array(analyserNode.frequencyBinCount);
};

const addListeners = () => {
  window.addEventListener('mouseup', () => {
    if (!audioContext) createAudio();
    if (audio.paused) {
      audio.play();
      console.log('Reproduciendo');
    } else {
      audio.pause();
      console.log('Pausado');
    }
  });
};

const start = async () => {
  addListeners();
  await CanvasSketch(sketch, settings);
};

start();
