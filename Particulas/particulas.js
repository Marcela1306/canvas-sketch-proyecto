import CanvasSketch from 'https://cdn.skypack.dev/canvas-sketch';
import random from 'https://cdn.skypack.dev/canvas-sketch-util/random';
import eases from 'https://cdn.skypack.dev/eases';
import math from 'https://cdn.skypack.dev/canvas-sketch-util/math';
import colormap from 'https://cdn.skypack.dev/colormap';
import interpolate from 'https://cdn.skypack.dev/color-interpolate';

const settings = {
    dimensions: [1680, 1680],
    animate: true,
};

const particles = [];
const cursor = { x: 9999, y: 9999 };

const colors = colormap({
    colormap: 'viridis',
    nshades: 20,
});

let elCanvas;
let imgA, imgB;

const sketch = ({ context, width, height, canvas }) => {
    let x, y, particle, radius;

    const imgACanvas = document.createElement('canvas');
    const imgAContext = imgACanvas.getContext('2d');

    const imgBCanvas = document.createElement('canvas');
    const imgBContext = imgBCanvas.getContext('2d');

    imgACanvas.width = imgA.width;
    imgACanvas.height = imgA.height;

    imgBCanvas.width = imgB.width;
    imgBCanvas.height = imgB.height;

    imgAContext.drawImage(imgA, 0, 0);
    imgBContext.drawImage(imgB, 0, 0);

    const imgAData = imgAContext.getImageData(0, 0, imgA.width, imgA.height).data;
    const imgBData = imgBContext.getImageData(0, 0, imgB.width, imgB.height).data;

    const numCircles = 30;
    let dotRadius = 12;
    let cirRadius = 0;
    const gapCircle = 2;
    const gapDot = 2;
    const fitRadius = dotRadius;

    elCanvas = canvas;
    canvas.addEventListener('mousedown', onmousedown);

    for (let i = 0; i < numCircles; i++) {
        const circumference = Math.PI * 2 * cirRadius;
        const numFit = i ? Math.floor(circumference / (fitRadius * 2 + gapDot)) : 1;
        const fitSlice = Math.PI * 2 / numFit;

        for (let j = 0; j < numFit; j++) {
            const theta = fitSlice * j;

            x = Math.cos(theta) * cirRadius;
            y = Math.sin(theta) * cirRadius;

            x += width * 0.5;
            y += height * 0.5;

            const ix = Math.floor((x / width) * imgA.width);
            const iy = Math.floor((y / height) * imgA.height);
            const idx = (iy * imgA.width + ix) * 4;

            const rA = imgAData[idx + 0];
            const gA = imgAData[idx + 1];
            const bA = imgAData[idx + 2];
            const colA = `rgb(${rA}, ${gA}, ${bA})`;

            radius = math.mapRange(rA, 0, 255, 1, 12);

            const rB = imgBData[idx + 0];
            const gB = imgBData[idx + 1];
            const bB = imgBData[idx + 2];
            const colB = `rgb(${rB}, ${gB}, ${bB})`;

            const colMap = interpolate([colA, colB]);

            particle = new Particle({ x, y, radius, colMap });
            particles.push(particle);
        }

        cirRadius += fitRadius * 2 + gapCircle;
        dotRadius = (1 - eases.quadOut(i / numCircles)) * fitRadius;
    }

    return ({ context, width, height }) => {
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);

        particles.sort((a, b) => a.scale - b.scale);

        particles.forEach((particle) => {
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
};

const onmouseup = () => {
    window.removeEventListener('mousemove', onmousemove);
    window.removeEventListener('mouseup', onmouseup);
    cursor.x = 9999;
    cursor.y = 9999;
};

const loadImage = async (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(`Failed to load image: ${url}`);
        img.crossOrigin = 'anonymous';
        img.src = url;
    });
};

const start = async () => {
    imgA = await loadImage('images/prueba1.jpg');
    imgB = await loadImage('images/globo.jpg');
    CanvasSketch(sketch, settings);
};

start();

class Particle {
    constructor({ x, y, radius = 10, colMap }) {
        this.x = x;
        this.y = y;

        this.ax = 0;
        this.ay = 0;

        this.vx = 0;
        this.vy = 0;

        this.ix = x;
        this.iy = y;

        this.radius = radius;
        this.scale = 1;
        this.colMap = colMap;
        this.color = colMap(0);

        this.minDist = random.range(100, 200);
        this.pushFactor = random.range(0.01, 0.02);
        this.pullFactor = random.range(0.002, 0.006);
        this.dampFactor = random.range(0.9, 0.95);
    }

    update() {
        let dx, dy, dd, distDelta;

        this.ax = 0;
        this.ay = 0;

        dx = this.ix - this.x;
        dy = this.iy - this.y;
        dd = Math.sqrt(dx * dx + dy * dy);

        this.ax = dx * this.pullFactor;
        this.ay = dy * this.pullFactor;

        this.scale = math.mapRange(dd, 0, 200, 1, 5);
        this.color = this.colMap(math.mapRange(dd, 0, 200, 0, 1, true));

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
