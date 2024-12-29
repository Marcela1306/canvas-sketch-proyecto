import CanvasSketch from 'https://cdn.skypack.dev/canvas-sketch';
import math from 'https://cdn.skypack.dev/canvas-sketch-util/math';
import random from 'https://cdn.skypack.dev/canvas-sketch-util/random';
import eases from 'https://cdn.skypack.dev/eases';

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let audio;
let audioContext, audioData, sourceNode, analyserNode;
let manager;
let minDb, maxDb;

const sketch = () => {
  const numCircles = 5;
  const numSlices = 1;
  const Slices = Math.PI * 2 / numSlices;
  const radius = 200;

  const bins = [];
  const lineWidths = [];
  const rotationOffisets = [];

  let lineWidth, bin, mapped, phi;

  for (let i = 0; i < numCircles * numSlices; i++) {
    bin = random.rangeFloor(4, 64);
    
    bins.push(bin);
  }

  for (let i = 0; i < numCircles; i++) {
    const t = i / (numCircles - 1);
    lineWidth = eases.quadIn(t) * 200 + 20;
    lineWidths.push(lineWidth);
  }

  for (let i = 0; i < numCircles; i++) {
    rotationOffisets.push(random.range(Math.PI * -0.25, Math.PI * 0.25) - Math.PI * 0.5);
  }

  return ({ context, width, height }) => {
    // Dibujar fondo en canvas
    context.fillStyle = '#EEEAE0';
    context.fillRect(0, 0, width, height);

    if (!audioContext) return;

    analyserNode.getFloatFrequencyData(audioData);
    context.save();
    context.translate(width * 0.5, height * 0.5);
    context.scale(1, -1)

    let cradius = radius;

    for (let i = 0; i < numCircles; i++) {
        context.save();
        context.rotate(rotationOffisets[i]);
        cradius += lineWidths[i] * 0.5 + 2;

      for (let j = 0; j < numSlices; j++) {
        context.rotate(Slices);
        context.lineWidth = lineWidths[i];

        bin = bins[i * numSlices + j];
      

        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);
        
        phi = Slices * mapped;

        context.beginPath();
        context.arc(0, 0, cradius, 0, phi);
        context.stroke();
      }
      cradius += lineWidths[i] * 0.5;
      context.restore();
    }
    context.restore();
  };
};

const createAudio = () => {
  // audio
  audio = document.createElement('audio');
  audio.src = '/audio/Aventura%20-%20Brindo%20Con%20Agua%20(Video%20Lyric%20Oficial).mp3'; // musica
  audio.crossOrigin = 'anonymous';
  audioContext = new AudioContext();
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 512;
  analyserNode.smoothingTimeConstant = 0.9;
  sourceNode.connect(analyserNode);

  minDb = analyserNode.minDecibels;
  maxDb = analyserNode.maxDecibels;

  audioData = new Float32Array(analyserNode.frequencyBinCount);
};

// Agregar listener para reproducir audio al hacer clic
const addListeners = () => {
  window.addEventListener('mouseup', () => {
    if (!audioContext) createAudio();
    if (audio.paused) {
      audio
        .play()
        .then(() => {
          manager.play();
          console.log('Reproduciendo audio');
        })
        .catch((error) => {
          console.error('Error al reproducir audio:', error);
        });
    } else {
      audio.pause();
      manager.pause();
      console.log('Audio pausado');
    }
  });
};
  
// Inicializar
const start = async () => {
  addListeners();
  manager = await CanvasSketch(sketch, settings);
  manager.pause();
};

start();
