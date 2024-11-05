import { VRButton } from 'https://threejs.org/examples/jsm/webxr/VRButton.js';

let scene, camera, renderer;
let elevator, human, rope;
let isFalling = false;
let fallVelocity = 0;
let timeInAir = 0;
const floorHeight = 2;
let finalScene;
let weight = 1;
let distanceFallen = 0;

// Cargar sonidos
const doorOpenSound = new Audio('sounds/door_open.mp3');
const fallSound = new Audio('sounds/fall.mp3');
const ropeBreakSound = new Audio('sounds/rope_break.mp3');

// Texturas
const loader = new THREE.TextureLoader();
const metalTexture = loader.load('textures/metal.jpg');
const floorTexture = loader.load('textures/floor.jpg');
const wallTexture = loader.load('textures/wall.jpg');
const skyboxTexture = loader.load('textures/skybox.jpg');
const finalBackgroundTexture = loader.load('textures/final_background.jpg');

function init() {
    // Configuración de la escena
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Renderer con soporte VR
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    renderer.xr.enabled = true;

    // Skybox para el fondo
    scene.background = skyboxTexture;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5).normalize();
    scene.add(light);

    // Edificio
    const wallGeometry = new THREE.BoxGeometry(10, 6, 1); // Edificio frontal
    const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 3, -5);
    scene.add(wall);

    const sideWallGeometry = new THREE.BoxGeometry(1, 6, 10);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-5.5, 3, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(5.5, 3, 0);
    scene.add(rightWall);

    // Ascensor
    const elevatorGeometry = new THREE.BoxGeometry(1, 1, 1);
    const elevatorMaterial = new THREE.MeshStandardMaterial({ map: metalTexture });
    elevator = new THREE.Mesh(elevatorGeometry, elevatorMaterial);
    elevator.position.set(0, 0, 0);
    scene.add(elevator);

    // Humano
    setHumanSize(weight);

    // Cuerda
    const ropeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 10, 8);
    const ropeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
    rope.position.set(0, 3, 0);
    scene.add(rope);

    // Pisos
    for (let i = 0; i < 4; i++) {
        const floorGeometry = new THREE.BoxGeometry(5, 0.1, 5);
        const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(0, -floorHeight + i * floorHeight, 0);
        scene.add(floor);
    }

    // Escena final para mostrar al humano en el suelo
    finalScene = new THREE.Scene();
    const finalLight = new THREE.DirectionalLight(0xffffff, 1);
    finalLight.position.set(5, 10, 7.5).normalize();
    finalScene.add(finalLight);

    const finalGround = new THREE.PlaneGeometry(5, 5);
    const finalMaterial = new THREE.MeshBasicMaterial({ map: finalBackgroundTexture });
    const finalGroundMesh = new THREE.Mesh(finalGround, finalMaterial);
    finalGroundMesh.rotation.x = -Math.PI / 2;
    finalGroundMesh.position.y = -2.5;
    finalScene.add(finalGroundMesh);

    camera.position.set(2, 2, 6);
    camera.lookAt(0, 0, 0);

    // Eventos de teclado
    window.addEventListener('keydown', (event) => {
        if (event.key === ' ') {
            human.visible = true;
            enterElevator();
        } else if (event.key === 'c' || event.key === 'C') {
            cutRope();
        }
    });

    renderer.setAnimationLoop(animate);
}

function setHumanSize(weight) {
    const sizes = {
        1: { scale: 1, color: 0xffcc00 },
        2: { scale: 1.5, color: 0xff8800 },
        3: { scale: 2, color: 0xff4400 }
    };
    const humanGeometry = new THREE.BoxGeometry(0.3 * sizes[weight].scale, 0.8 * sizes[weight].scale, 0.3 * sizes[weight].scale);
    const humanMaterial = new THREE.MeshStandardMaterial({ color: sizes[weight].color });
    human = new THREE.Mesh(humanGeometry, humanMaterial);
    human.position.set(0, 0.4, 0);
    elevator.add(human);
    human.visible = false;
}

function startSimulation() {
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('container').style.display = 'block';
    init();
    askWeight();
}

function askWeight() {
    const weightOptions = prompt("Elige el peso del objeto: 1 para ligero, 2 para medio, 3 para pesado");
    weight = parseInt(weightOptions) || 1;
    setHumanSize(weight);
}

document.getElementById('continueButton').addEventListener('click', startSimulation);

function animate() {
    if (isFalling) {
        timeInAir += 0.02;
        fallVelocity += 0.01 * weight; // Velocidad de caída reducida
        distanceFallen += fallVelocity;
        elevator.position.y -= fallVelocity;
        human.position.y -= fallVelocity;
        rope.position.y -= fallVelocity;
        camera.position.y -= fallVelocity * 0.5;

        // Actualización en tiempo real de los datos
        document.getElementById('dataDisplay').innerText = `
            Velocidad de caída: ${fallVelocity.toFixed(2)} m/s
            Distancia recorrida: ${distanceFallen.toFixed(2)} m
            Tiempo en el aire: ${timeInAir.toFixed(2)} s
        `;

        if (human.position.y < -4) {
            showFinalScene();
        }
    }

    renderer.render(scene, camera);
}

function enterElevator() {
    doorOpenSound.play();
    setTimeout(() => {
        askFloor();
    }, 1000);
}

function moveToFloor(targetY) {
    const speed = 0.05; // Ajusta la velocidad del movimiento
    const interval = setInterval(() => {
        elevator.position.y += (targetY - elevator.position.y) * speed;
        if (Math.abs(targetY - elevator.position.y) < 0.01) {
            elevator.position.y = targetY; // Corrige la posición final
            clearInterval(interval);
        }
    }, 16);
}

function askFloor() {
    const floorInput = prompt("¿En qué piso quieres ir? (1-3)");
    if (floorInput) {
        const targetFloor = parseInt(floorInput);
        if (targetFloor >= 1 && targetFloor <= 3) {
            const targetY = (targetFloor - 1) * floorHeight;
            moveToFloor(targetY);
        } else {
            alert("Por favor, elige un piso válido (1-3).");
            askFloor();
        }
    }
}

function cutRope() {
    ropeBreakSound.play();
    isFalling = true;
    fallSound.play();
}

function showFinalScene() {
    isFalling = false;
    fallSound.pause();
    fallSound.currentTime = 0;
    human.position.y = -4;
    rope.visible = false;
    scene = finalScene;

    displayFinalData();
}

function displayFinalData() {
    const finalData = document.createElement('div');
    finalData.style.position = 'absolute';
    finalData.style.width = '100%';
    finalData.style.color = 'white';
    finalData.style.fontSize = '24px';
    finalData.style.textAlign = 'center';
    finalData.style.top = '50%';
    finalData.style.left = '50%';
    finalData.style.transform = 'translate(-50%, -50%)';
    finalData.innerText = `¡Has llegado al suelo!\n\n
        Peso del objeto: ${weight}kg\n
        Distancia recorrida: ${distanceFallen.toFixed(2)} m\n
        Tiempo en el aire: ${timeInAir.toFixed(2)} s\n
        Velocidad de caída: ${fallVelocity.toFixed(2)} m/s`;
    document.body.appendChild(finalData);
}

document.getElementById('startButton').addEventListener('click', startSimulation);

// me faltan los datos, mostrar a que velocidad caida y la distancia, el tiempo en el aire, el peso del objeto
// que vaya mostrando los datos en tiempo real en la animacion y al final quede una pantallita que muestre todo los datos finales