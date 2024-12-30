import CanvasSketch from 'https://cdn.skypack.dev/canvas-sketch';
import random from 'https://cdn.skypack.dev/canvas-sketch-util/random';

const settings = {
    dimensions: [1080, 1080],
    animate: true,
};

const particles = [];
const cursor = { x: 9999, y: 9999 };

let elCanvas;

const sketch = ({ context, width, height, canvas }) => {
    let x, y, particle;

    elCanvas = canvas;
    canvas.addEventListener('mousedown', onmousedown);

    for (let i = 0; i < 1; i++) {
        x = width * 0.5;
        y = height * 0.5;

        particle = new Particle({ x, y });

        particles.push(particle);
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

        this.minDist = 100;
        this.pushFactor = 0.02;
        this.pullFactor = 0.004;
        this.dampFactor = 0.95;
    }

    update() {
        let dx, dy, dd, distDelta;

        // Reset acceleration
        this.ax = 0;
        this.ay = 0;
        // fuerza pull
        dx = this.ix - this.x;
        dy = this.iy - this.y;

        this.ax = dx * this.pullFactor;
        this.ay = dy * this.pullFactor;

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
        context.fillStyle = 'white';

        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }
}
