import CanvasSketch from 'https://cdn.skypack.dev/canvas-sketch';

const settings = {
  dimensions: [1080, 1080],
};

let audio;

const sketch = () => {
  // Crear elemento de audio
  audio = document.createElement('audio');
  audio.src = '/Sonido/Aventura%20-%20Brindo%20Con%20Agua%20(Video%20Lyric%20Oficial).mp3'; // Ruta relativa al servidor
  audio.crossOrigin = 'anonymous'; // Soluciona posibles problemas de CORS

  return ({ context, width, height }) => {
    // Dibujar fondo en canvas
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
  };
};

// Agregar listener para reproducir audio al hacer clic
const addListeners = () => {
  window.addEventListener('mouseup', () => {
    audio
      .play()
      .then(() => {
        console.log('Reproduciendo audio');
      })
      .catch((error) => {
        console.error('Error al reproducir audio:', error);
      });
  });
};

// Inicializar
addListeners();
CanvasSketch(sketch, settings);
