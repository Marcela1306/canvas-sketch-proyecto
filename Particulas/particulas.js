import CanvasSketch from 'https://cdn.skypack.dev/canvas-sketch';
import random from 'https://cdn.skypack.dev/canvas-sketch-util/random';
import eases from 'https://cdn.skypack.dev/eases';
import math from 'https://cdn.skypack.dev/canvas-sketch-util/math';
import colormap from 'https://cdn.skypack.dev/colormap';

const settings = {
    dimensions: [1080, 1080],
    animate: true,
};

const particles = [];
const cursor = { x: 9999, y: 9999 };

const colors = colormap({
    colormap: 'viridis',
    nshades: 20,
});

let elCanvas;

const sketch = ({ context, width, height, canvas }) => {
    let x, y, particle, radius;
    let pos = [];

    const numCircles = 15;
    let dotRadius = 12;
    let cirRadius = 0;
    const gapCircle = 8;
    const gapDot = 4;
    const fitRadius = dotRadius;

    elCanvas = canvas;
    canvas.addEventListener('mousedown', onmousedown);

    for (let i = 0; i < numCircles; i++) {
        const circunference = Math.PI * 2 * cirRadius;
        const numFit = i ? Math.floor(circunference / (fitRadius * 2 + gapDot)) : 1;
        const fitSlice = Math.PI * 2 / numFit;

        for(let j = 0; j < numFit; j++) {
            const theta = fitSlice * j;

            x = Math.cos(theta) * cirRadius;
            y = Math.sin(theta) * cirRadius;

            x += width * 0.5;
            y += height * 0.5;

            radius = dotRadius;

            particle = new Particle({x, y, radius});
            particles.push(particle);
        }

        cirRadius += fitRadius * 2 + gapCircle;
        dotRadius = (1 - eases.quadOut( i / numCircles)) * fitRadius;
    }

  
    return ({ context, width, height }) => {
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);

        particles.forEach(particle => {
            particle.update();
            particle.draw(context);
        });
    };
};

const onmousedown = (e) => {
    window.addEventListener('mousemove', onmousemove);
    window.addEventListener('mouseup', onmouseup);

    onmousemove(e);
};

const onmousemove = (e) => {
    const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
    const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

    cursor.x = x;
    cursor.y = y;

    console.log(cursor);
};

const onmouseup = () => {
    window.removeEventListener('mousemove', onmousemove);
    window.removeEventListener('mouseup', onmouseup);

    cursor.x = 9999;
    cursor.y = 9999;
}

CanvasSketch(sketch, settings);

class Particle {
    constructor({ x, y, radius = 10 }) {
        // Posicion
        this.x = x;
        this.y = y;

        // Aceleracion
        this.ax = 0;
        this.ay = 0;

        // velocidad
        this.vx = 0;
        this.vy = 0;

        // Posicion Inicial
        this.ix = x;
        this.iy = y;

        this.radius = radius;
        this.scale = 1;
        this.color = colors[0];

        this.minDist = random.range(100, 200);
        this.pushFactor = random.range(0.01, 0.02);
        this.pullFactor = random.range(0.002, 0.006);
        this.dampFactor = random.range(0.90, 0.95);
    }

    update() {
        let dx, dy, dd, distDelta;
        let idxColor;

        // Reset acceleration
        this.ax = 0;
        this.ay = 0;

        // fuerza pull
        dx = this.ix - this.x;
        dy = this.iy - this.y;
        dd = Math.sqrt(dx * dx + dy * dy);

        this.ax = dx * this.pullFactor;
        this.ay = dy * this.pullFactor;

        this.scale = math.mapRange(dd, 0, 200, 1, 5);

        idxColor = Math.floor(math.mapRange(dd, 0, 200, 0, colors.length - 1, true));
        this.color = colors[idxColor];

        // fuerza empuje
        dx = this.x - cursor.x;
        dy = this.y - cursor.y;
        dd = Math.sqrt(dx * dx + dy * dy);

        distDelta = this.minDist - dd;

        if (dd < this.minDist) {
            this.ax += (dx / dd) * distDelta * this.pushFactor;
            this.ay += (dy / dd) * distDelta * this.pushFactor;
        }

        this.vx += this.ax;
        this.vy += this.ay;

        this.vx *= this.dampFactor;
        this.vy *= this.dampFactor;

        this.x += this.vx;
        this.y += this.vy;
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.fillStyle = this.color;

        context.beginPath();
        context.arc(0, 0, this.radius * this.scale, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }
}
