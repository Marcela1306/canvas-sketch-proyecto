const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

// Inicializamos el sonido pero no lo reproducimos inmediatamente
const soundEffect = new Audio('./audio/Palillos%20Chinos%20Banda%20Cumbia.mp3');
soundEffect.loop = true;

// Definimos un número máximo de partículas
const maxParticles = 500;

// Detectamos cuando el usuario hace clic para empezar a reproducir el audio
canvas.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume(); // Resumir el AudioContext si está suspendido
    }
    soundEffect.play();
});

// Configuramos la Web Audio API para análisis de frecuencia
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(soundEffect);
source.connect(analyser);
analyser.connect(audioContext.destination);
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Clase para las partículas
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = Math.random() * 2 - 1;
        this.vy = Math.random() * 2 - 1;
        this.radius = Math.random() * 5 + 2;
        this.color = color;
        this.caught = false; // Indica si la partícula ha sido "agarrada"
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        if (!this.caught) {
            // Efecto de movimiento de partículas de acuerdo a la frecuencia
            const frequency = dataArray[Math.floor(Math.random() * bufferLength)] / 255; // Extraemos una frecuencia aleatoria
            this.vx += frequency * 0.5 - 0.25;
            this.vy += frequency * 0.5 - 0.25;

            // Movimiento hacia el mouse
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 50;

            if (dist < maxDist) {
                this.caught = true; // Marca la partícula como atrapada
            }

            // Mueve la partícula
            this.x += this.vx;
            this.y += this.vy;

            // Rebote de partículas en los bordes
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            this.draw();
        }
    }
}

let particles = [];
let totalParticles = 0;
let caughtParticles = 0;

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

function createParticles(img) {
    const imgCanvas = document.createElement('canvas');
    const imgCtx = imgCanvas.getContext('2d');
    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    imgCtx.drawImage(img, 0, 0);

    const imgData = imgCtx.getImageData(0, 0, img.width, img.height).data;

    particles = [];
    for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
            const i = (y * img.width + x) * 4;
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];

            if (a > 128 && particles.length < maxParticles) {
                const color = `rgb(${r},${g},${b})`;
                particles.push(new Particle(x, y, color));
                totalParticles++;
            }
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 198, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 114, 255, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    analyser.getByteFrequencyData(dataArray); // Obtiene los datos de la frecuencia de la música
    particles.forEach((particle) => particle.update());

    requestAnimationFrame(animate);
}

function showImageEffect() {
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.fillText("¡Objetivo Cumplido!", canvas.width / 2 - 150, canvas.height / 2);
}

// Manejador de eventos para actualizar la posición del ratón
canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

loadImage('./assets/prueba1.jpg')
    .then((img) => {
        createParticles(img);
        animate();
    })
    .catch((err) => {
        console.error('Error al cargar la imagen:', err);
    });
