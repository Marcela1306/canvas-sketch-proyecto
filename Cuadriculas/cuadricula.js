import CanvasSketch from 'https://cdn.skypack.dev/canvas-sketch';
import random from 'https://cdn.skypack.dev/canvas-sketch-util/random';
import math from 'https://cdn.skypack.dev/canvas-sketch-util/math';
import colormap from 'https://cdn.skypack.dev/colormap';

const settings = {
    dimensions: [window.innerWidth, window.innerHeight], // Ajuste dinámico según el tamaño de la ventana
    animate: true,
    resizeCanvas: true, // Asegura que el canvas se redimensione
};

const sketch = ({ width, height }) => {
    const cols = 72;  // Número de columnas
    const rows = 8;   // Número de filas
    const numCells = cols * rows;

    const gw = width * 0.8; // Ancho de la cuadrícula, 80% del lienzo
    const gh = height * 0.8; // Alto de la cuadrícula, 80% del lienzo

    const cw = gw / cols; // Ancho de cada celda
    const ch = gh / rows; // Alto de cada celda

    const mx = (width - gw) * 0.5; // Margen horizontal
    const my = (height - gh) * 0.5; // Margen vertical

    const points = [];
    let x, y, n, lineWidth, color;
    const frequency = 0.002;
    const amplitude = 90;

    const colors = colormap({
        colormap: 'cubehelix',
        nshades: amplitude,
    });

    // Creación de puntos basados en las celdas
    for (let i = 0; i < numCells; i++) {
        x = (i % cols) * cw;
        y = Math.floor(i / cols) * ch;

        n = random.noise2D(x, y, frequency, amplitude);
        lineWidth = math.mapRange(n, amplitude, amplitude, 2, 10);
        color = colors[Math.floor(math.mapRange(n, -amplitude, amplitude, 0, amplitude))];

        points.push(new Point({ x, y, lineWidth, color }));
    }

    return ({ context, width, height, frame }) => {
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);

        context.save();
        context.translate(mx, my);
        context.translate(cw * 0.5, ch * 0.5);

        // Actualizar las posiciones de los puntos con ruido
        points.forEach(point => {
            n = random.noise2D(point.ix + frame * 3, point.iy, frequency, amplitude);
            point.x = point.ix + n;
            point.y = point.iy + n;
        });

        let lastx, lasty;

        // Dibujo de las líneas entre los puntos
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols - 1; c++) {
                const curr = points[r * cols + c];
                const next = points[r * cols + c + 1];

                const mx = curr.x + (next.x - curr.x) * 0.8;
                const my = curr.y + (next.y - curr.y) * 5.5;

                if (!c) {
                    lastx = curr.x;
                    lasty = curr.y;
                }

                context.beginPath();
                context.lineWidth = curr.lineWidth;
                context.strokeStyle = curr.color;

                context.moveTo(lastx, lasty);
                context.quadraticCurveTo(curr.x, curr.y, mx, my);

                context.stroke();

                lastx = mx - c / cols * 250;
                lasty = my - r / rows * 250;
            }
        }

        context.restore();
    };
};

CanvasSketch(sketch, settings);

class Point {
    constructor({ x, y, lineWidth, color }) {
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
        this.color = color;

        this.ix = x;  // Coordenada original
        this.iy = y;  // Coordenada original
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.fillStyle = 'red';

        context.beginPath();
        context.arc(0, 0, 10, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }
}
