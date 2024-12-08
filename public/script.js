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
let initialRopeHeight = 10;
let scale = 1;
const maxScale = 2;
const dilationSpeed = 0.02;

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
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    
    // Configuración del renderer y soporte VR
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    renderer.xr.enabled = true;

    // Skybox
    scene.background = skyboxTexture;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5).normalize();
    scene.add(light);

    // Configuración del edificio y el elevador
    setupBuilding();
    setupElevator();

    camera.position.set(2, 5, 14);
    camera.lookAt(0, 0, 0);

    window.addEventListener('keydown', (event) => {
        if (event.key === ' ') {
            human.visible = true;
            enterElevator();
        }
    });

    renderer.setAnimationLoop(animate);
}

function setupBuilding() {
    // Paredes y pisos
    const wallGeometry = new THREE.BoxGeometry(10, 6, 1);
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

    // Pisos
    for (let i = 0; i < 6; i++) {
        const floorGeometry = new THREE.BoxGeometry(5, 0.1, 5);
        const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(0, -floorHeight + i * floorHeight, 0);
        scene.add(floor);
    }
}

function setupElevator() {
    const elevatorGeometry = new THREE.BoxGeometry(1, 1, 1);
    const elevatorMaterial = new THREE.MeshStandardMaterial({ map: metalTexture });
    elevator = new THREE.Mesh(elevatorGeometry, elevatorMaterial);
    elevator.position.set(0, 0, 0);
    scene.add(elevator);

    const humanGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const humanMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
    human = new THREE.Mesh(humanGeometry, humanMaterial);
    human.position.set(0, 0.4, 0);
    elevator.add(human);
    human.visible = false;

    const ropeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 10, 8);
    const ropeMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C }); // Color de cuerda más claro
    rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
    rope.position.set(0, 3, 0);
    scene.add(rope);
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

    // Crear botones de selección de peso en el simulador
    const weightSelection = document.createElement('div');
    weightSelection.id = 'weightSelection';
    weightSelection.style.position = 'absolute';
    weightSelection.style.bottom = '40px';
    weightSelection.style.left = '50%';
    weightSelection.style.transform = 'translateX(-50%)';
    weightSelection.style.display = 'flex';
    weightSelection.style.gap = '20px';
    weightSelection.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    weightSelection.style.padding = '10px';
    weightSelection.style.borderRadius = '10px';

    // Botones de peso
    const weights = [
        { id: 'weightLight', label: 'Ligero', weight: 1 },
        { id: 'weightMedium', label: 'Medio', weight: 2 },
        { id: 'weightHeavy', label: 'Pesado', weight: 3 }
    ];
    weights.forEach(w => {
        const button = document.createElement('button');
        button.id = w.id;
        button.textContent = w.label;
        button.style.padding = '10px';
        button.style.fontSize = '1rem';
        button.style.cursor = 'pointer';
        button.onclick = () => setWeight(w.weight);
        weightSelection.appendChild(button);
    });

    document.body.appendChild(weightSelection);
    init();
}

document.getElementById('continueButton').addEventListener('click', startSimulation);

// Botones de selección de peso
document.getElementById('weightLight').addEventListener('click', () => setWeight(1));
document.getElementById('weightMedium').addEventListener('click', () => setWeight(2));
document.getElementById('weightHeavy').addEventListener('click', () => setWeight(3));

function setWeight(selectedWeight) {
    weight = selectedWeight;
    setHumanSize(weight);
}

document.getElementById('continueButton').addEventListener('click', startSimulation);

function fallSimulation() {
    timeInAir += 0.02;
    fallVelocity += 0.001 * weight;
    distanceFallen += fallVelocity;
    elevator.position.y -= fallVelocity;
    if (elevator.position.y < -5) {
        showFinalScene();
    }

    document.getElementById('dataDisplay').innerText = `Velocidad de caída: ${fallVelocity.toFixed(2)} m/s
          Distancia recorrida: ${distanceFallen.toFixed(2)} m
           Tiempo en el aire: ${timeInAir.toFixed(2)} s
           Peso: ${weight} kg`;

       if (human.position.y < -4) {
            showFinalScene();
        }
    }
   
function animateFall() {
        if (isFalling) {
            // Aumenta el tamaño hasta llegar al máximo
            if (scale < maxScale) {
                scale += dilationSpeed;
            }
    
            // Aplica el cambio de escala al objeto
            object.style.transform = `scale(${scale})`;
    
            // Lógica adicional de caída aquí (ajustar la posición de caída)
            object.y += 5;  // Velocidad de caída
        }
        
        // Solicita el siguiente cuadro de animación
        requestAnimationFrame(animateFall);
    }
    
function animate() {
    if (isFalling) {
        fallSimulation();
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
    const speed = 0.05;
    const interval = setInterval(() => {
        elevator.position.y += (targetY - elevator.position.y) * speed;
        if (Math.abs(targetY - elevator.position.y) < 0.01) {
            elevator.position.y = targetY;
            clearInterval(interval);
            cutRope();
        }
    }, 10);
}

function askFloor() {
    const floorInput = prompt("¿En qué piso quieres ir? (1-6)");
    if (floorInput) {
        const targetFloor = parseInt(floorInput);
        if (targetFloor >= 1 && targetFloor <= 6) {
            const targetY = (targetFloor - 1) * floorHeight;
            moveToFloor(targetY);
        } else {
            alert("Por favor, elige un piso válido (1-6).");
            askFloor();
        }
    }
}

function cutRope() {
    if (!isFalling) {
        console.log("Cuerda cortada.");
        isFalling = true;
        ropeBreakSound.play();

        let angle = 0; // Ángulo de la oscilación
        let angularVelocity = 0; // Velocidad angular
        let gravity = 0.1; // Gravedad que afecta el movimiento de la cuerda
        let ropeLength = 10; // Longitud de la cuerda
        let swingAmplitude = 0.5; // Amplitud de oscilación horizontal
        let swingSpeed = 0.05; // Velocidad de oscilación

        // Efecto de caída con oscilación
        const ropeFallInterval = setInterval(() => {
            // Actualizar ángulo y velocidad angular para simular oscilación
            angularVelocity += gravity * Math.sin(angle); // Fuerza que causa el movimiento oscilante
            angle += angularVelocity;

            // Movimiento oscilante de la cuerda
            rope.position.y -= 0.1; // Cae con una velocidad vertical constante
            rope.position.x = swingAmplitude * Math.sin(angle); // Movimiento oscilante horizontal

            // Detener la animación cuando la cuerda haya caído
            if (rope.position.y < -6) { 
                clearInterval(ropeFallInterval);
                rope.visible = false; // Desaparece después de caer
            }
        }, 10);

        animateFall();
    }
}

//window.addEventListener('keydown', (event) => {
  //  if (event.key === 'c' || event.key === 'C') {
   //     cutRope();
   // }
//});

function displayFinalData() {
    const finalData = document.createElement('div');
    finalData.style.position = 'absolute';
    finalData.style.width = '40%';
    finalData.style.height = 'auto';
    finalData.style.padding = '20px';
    finalData.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    finalData.style.color = 'white';
    finalData.style.fontSize = '20px';
    finalData.style.textAlign = 'center';
    finalData.style.borderRadius = '10px';
    finalData.style.top = '20%';
    finalData.style.left = '5%';

    finalData.innerHTML = `
        <h2>¡Has llegado al suelo!</h2>
        <p><strong>Peso del objeto:</strong> ${weight} kg</p>
        <p><strong>Distancia recorrida:</strong> ${distanceFallen.toFixed(2)} m</p>
        <p><strong>Tiempo en el aire:</strong> ${timeInAir.toFixed(2)} s</p>
        <p><strong>Velocidad de caída:</strong> ${fallVelocity.toFixed(2)} m/s</p>
        <button id="restartButton">Reiniciar</button>
    `;

    document.body.appendChild(finalData);

    document.getElementById('restartButton').onclick = () => {
        location.reload();
    };
}

function showFinalScene() {
    isFalling = false;
    fallSound.pause();
    fallSound.currentTime = 0;

    const destructionInterval = setInterval(() => {
        elevator.scale.x *= 0.9;
        elevator.scale.y *= 0.9;
        elevator.scale.z *= 0.9;
        if (elevator.scale.x < 0.1) {
            clearInterval(destructionInterval);
            elevator.visible = false;
        }
    }, 100);

    displayFinalData();

    camera.position.set(-5, 5, 10);
    camera.lookAt(0, 0, 0);
}

document.getElementById('startButton').addEventListener('click', startSimulation);
