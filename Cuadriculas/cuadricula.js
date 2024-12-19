import CanvasSketch from 'https://cdn.skypack.dev/canvas-sketch';
import random from 'https://cdn.skypack.dev/canvas-sketch-util/random';
import math from 'https://cdn.skypack.dev/canvas-sketch-util/math';
import colormap from 'colormap';

const settings = {
    dimensions: [1080, 1080],
};

const sketch = ({ width, height }) => {
    const cols = 12;
    const rows = 6;
    const numCells = cols * rows;

    const gw = width * 0.8;
    const gh = height * 0.8;

    const cw = gw / cols;
    const ch = gh / rows;

    const mx = (width - gw) * 0.5;
    const my = (height - gh) * 0.5;

    const points = [];
    let x, y, n, lineWidth;
    let frequency = 0.002;
    let amplitude = 90;

    for (let i = 0; i < numCells; i++) {
        x = (i % cols) * cw;
        y = Math.floor(i / cols) * ch;

        n = random.noise2D(x, y, frequency, amplitude);
        x += n;
        y += n;

        lineWidth = math.mapRange(n, amplitude, amplitude, 2, 20);

        points.push(new Point({ x, y, lineWidth }));
    }

    return ({ context, width, height }) => {
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);

        context.save();
        context.translate(mx, my);
        context.translate(cw * 0.5, ch * 0.5);
        context.strokeStyle = 'red';
        context.lineWidth = 4;

        let lastx, lasty;

        for (let r = 0; r < rows; r++) {
            

            for (let c = 0; c < cols - 1; c++) {
                const curr = points[r * cols + c + 0];
                const next = points[r * cols + c + 1];

                const mx = curr.x + (next.x - curr.x) * 0.5;
                const my = curr.y + (next.y - curr.y) * 0.5;

                if(!c) {
                    lastx = curr.x;
                    lasty = curr.y;
                }

                context.beginPath();
                context.lineWidth = curr.lineWidth;

               // if (c === 0) context.moveTo(curr.x, curr.y);
               // else if (c === cols - 2) context.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
              //  else context.quadraticCurveTo(curr.x, curr.y, mx, my);
              context.moveTo(lastx, lasty);
              context.quadraticCurveTo(curr.x, curr.y, mx, my);

                context.stroke();

                lastx = mx;
                lasty = my;
            }
             // Corregido el método.
        }

        points.forEach((point) => {
            point.draw(context);
        });

        context.restore();
    };
};

CanvasSketch(sketch, settings);

class Point {
    constructor({ x, y, lineWidth }) {
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
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
