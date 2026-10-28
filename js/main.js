import { Renderer } from "./core/Renderer.js";
import { Scene } from "./core/Scene.js";
import { Object3D } from "./core/Object3D.js";

import { PlaneGeometry } from "./geometries/PlaneGeometry.js";
import { CylinderGeometry } from "./geometries/CylinderGeometry.js";
import { ConeGeometry } from "./geometries/ConeGeometry.js";
import { BoxGeometry } from "./geometries/BoxGeometry.js";
import { SphereGeometry } from "./geometries/SphereGeometry.js";

import { BasicMaterial } from "./materials/BasicMaterial.js";
import { Mesh } from "./objects/Mesh.js";

import { PerspectiveCamera } from "./cameras/PerspectiveCamera.js";
import { OrbitControls } from "./controls/OrbitControls.js";

import { TextureLoader } from "./utils/TextureLoader.js";
import {
    crearTexturaCesped,
    crearTexturaPiedra,
    crearTexturaTecho,
    crearTexturaMadera,
    crearTexturaMuro
} from "./utils/Texturas.js";

// Medidas del molino
const LARGO_TERRENO = 200;
const REPETICION_CESPED = 40;
const ALTO_TORRE = 8;
const RADIO_TORRE_BASE = 1.4;
const RADIO_TORRE_TOPE = 0.9;
const SEGMENTOS = 40;
const ALTO_TECHO = 2.2;
const RADIO_TECHO = 1.25;
const ALTURA_ROTOR_LOCAL = 3.2;
const FRENTE_ROTOR_LOCAL = 1.3;
const RADIO_BUJE = 0.45;
const LARGO_BUJE = 0.8;
const LARGO_ASPA = 3.6;
const ANCHO_ASPA = 0.95;
const GROSOR_ASPA = 0.14;
const INCLINACION_ASPA = 0.30;
const VELOCIDAD_INICIAL = 1.25;
const VELOCIDAD_MAXIMA = 6;
const PASO_VELOCIDAD = 0.25;
const INTENSIDAD_LAMPARA = 2.5;

// Casa del molino
const ANCHO_MUROS = 5;
const ALTO_MUROS = 3.2;
const FONDO_MUROS = 4.6;
const ALTO_TEJADO = 2.2;
const RADIO_TEJADO = 3.8;

// Distribuciÿn del parque
const PARQUE = [
    { x: 0, z: 0, escala: 1.0, giro: 0.00, factor: 1.00 },
    { x: -20, z: -8, escala: 0.8, giro: 0.50, factor: 0.90 },
    { x: 20, z: -8, escala: 0.8, giro: -0.50, factor: 0.90 },
    { x: -15, z: -15, escala: 0.7, giro: -0.30, factor: 1.00 },
    { x: 15, z: -15, escala: 0.7, giro: 0.30, factor: 1.00 },
    { x: 0, z: -20, escala: 0.6, giro: 0.00, factor: 1.10 }
];

// Casa principal
const CASA_PRINCIPAL = { x: 15, z: -10, giro: 0.35 };

// Renderer
const canvas = document.getElementById("glCanvas");
canvas.width = Math.max(1, Math.floor(window.innerWidth * (window.devicePixelRatio || 1)));
canvas.height = Math.max(1, Math.floor(window.innerHeight * (window.devicePixelRatio || 1)));
const renderer = new Renderer(canvas);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.lightDirection = [0.45, 0.80, 0.40];
renderer.ambient = 0.38;
renderer.lampPosition = [2.5, 5.5, 3.5];
renderer.lampIntensity = 0.0;

// Texturas
const textureLoader = new TextureLoader(renderer.gl);
const texturaCesped = crearTexturaCesped(textureLoader);
const texturaPiedra = crearTexturaPiedra(textureLoader);
const texturaTecho = crearTexturaTecho(textureLoader);
const texturaMadera = crearTexturaMadera(textureLoader);
const texturaMuro = crearTexturaMuro(textureLoader);
const texturaNube = textureLoader.createColor(250, 251, 253);
const texturaVidrio = textureLoader.createColor(150, 205, 235);

// Geometrías
const geometriaTerreno = new PlaneGeometry(LARGO_TERRENO, LARGO_TERRENO, REPETICION_CESPED, REPETICION_CESPED);
const geometriaTorre = new CylinderGeometry(RADIO_TORRE_TOPE, RADIO_TORRE_BASE, ALTO_TORRE, SEGMENTOS, { tapaSuperior: false, tapaInferior: false });
const geometriaTecho = new ConeGeometry(RADIO_TECHO, ALTO_TECHO, SEGMENTOS);
const geometriaBuje = new CylinderGeometry(RADIO_BUJE, RADIO_BUJE, LARGO_BUJE, 24);
const geometriaAspa = new BoxGeometry(ANCHO_ASPA, LARGO_ASPA, GROSOR_ASPA);
const geometriaNube = new SphereGeometry(1.0, 20, 28);
const geometriaMuros = new BoxGeometry(ANCHO_MUROS, ALTO_MUROS, FONDO_MUROS);
const geometriaTejado = new ConeGeometry(RADIO_TEJADO, ALTO_TEJADO, 4);
const geometriaPuerta = new BoxGeometry(0.9, 2.1, 0.12);
const geometriaVentanaFrontal = new BoxGeometry(0.9, 0.8, 0.12);
const geometriaVentanaLateral = new BoxGeometry(0.12, 0.8, 0.9);
const geometriaChimenea = new BoxGeometry(0.55, 1.8, 0.55);

// Materiales
const materialCesped = new BasicMaterial({ texture: texturaCesped });
const materialPiedra = new BasicMaterial({ texture: texturaPiedra });
const materialTecho = new BasicMaterial({ texture: texturaTecho });
const materialMadera = new BasicMaterial({ texture: texturaMadera });
const materialMuro = new BasicMaterial({ texture: texturaMuro });
const materialVidrio = new BasicMaterial({ texture: texturaVidrio });
const materialNube = new BasicMaterial({ texture: texturaNube });

// Escena
const scene = new Scene();

// Terreno
const terreno = new Mesh(geometriaTerreno, materialCesped);
scene.add(terreno);

// Funciones de casa
function crearCasa(posicionX = 0, posicionZ = 0, giro = 0) {
    const casa = new Object3D();
    casa.position.x = posicionX;
    casa.position.z = posicionZ;
    casa.rotation.y = giro;
    const muros = new Mesh(geometriaMuros, materialMuro);
    muros.position.y = ALTO_MUROS / 2;
    casa.add(muros);
    const tejado = new Mesh(geometriaTejado, materialTecho);
    tejado.position.y = ALTO_MUROS + ALTO_TEJADO / 2;
    tejado.rotation.y = Math.PI / 4;
    casa.add(tejado);
    const puerta = new Mesh(geometriaPuerta, materialMadera);
    puerta.position.x = -0.9;
    puerta.position.y = 2.1 / 2;
    puerta.position.z = FONDO_MUROS / 2 + 0.07;
    casa.add(puerta);
    const ventanaFrontal = new Mesh(geometriaVentanaFrontal, materialVidrio);
    ventanaFrontal.position.x = 1.35;
    ventanaFrontal.position.y = 1.9;
    ventanaFrontal.position.z = FONDO_MUROS / 2 + 0.06;
    casa.add(ventanaFrontal);
    const ventanaLateral = new Mesh(geometriaVentanaLateral, materialVidrio);
    ventanaLateral.position.x = ANCHO_MUROS / 2 + 0.06;
    ventanaLateral.position.y = 1.9;
    ventanaLateral.position.z = 0.4;
    casa.add(ventanaLateral);
    const chimenea = new Mesh(geometriaChimenea, materialPiedra);
    chimenea.position.x = 1.5;
    chimenea.position.y = 4.35;
    chimenea.position.z = -1.0;
    casa.add(chimenea);
    return casa;
}

function crearCasaParaMolino() {
    return crearCasa(5.5, 0, 0);
}

// Fabricar molinos con casas
function crearMolino() {
    const grupo = new Object3D();
    const torre = new Mesh(geometriaTorre, materialPiedra);
    torre.position.y = ALTO_TORRE / 2;
    grupo.add(torre);
    const techo = new Mesh(geometriaTecho, materialTecho);
    techo.position.y = ALTO_TORRE / 2 + ALTO_TECHO / 2;
    torre.add(techo);
    const rotor = new Object3D();
    rotor.position.y = ALTURA_ROTOR_LOCAL;
    rotor.position.z = FRENTE_ROTOR_LOCAL;
    torre.add(rotor);
    const buje = new Mesh(geometriaBuje, materialMadera);
    buje.rotation.x = Math.PI / 2;
    rotor.add(buje);
    for (let i = 0; i < 4; i++) {
        const pivoteAspa = new Object3D();
        pivoteAspa.rotation.z = i * Math.PI / 2;
        rotor.add(pivoteAspa);
        const aspa = new Mesh(geometriaAspa, materialMadera);
        aspa.position.y = RADIO_BUJE + LARGO_ASPA / 2;
        aspa.rotation.y = INCLINACION_ASPA;
        pivoteAspa.add(aspa);
    }
    const casa = crearCasaParaMolino();
    return { grupo, torre, rotor, casa };
}

const molinos = PARQUE.map((dato) => {
    const molino = crearMolino();
    molino.grupo.position.x = dato.x;
    molino.grupo.position.z = dato.z;
    molino.grupo.scale.x = molino.grupo.scale.y = molino.grupo.scale.z = dato.escala;
    molino.grupo.rotation.y = dato.giro;
    molino.factor = dato.factor;
    molino.casa.position.x += dato.x;
    molino.casa.position.z += dato.z;
    molino.casa.rotation.y += dato.giro;
    scene.add(molino.grupo);
    scene.add(molino.casa);
    return molino;
});

const torre = molinos[0].torre;
const rotor = molinos[0].rotor;

// Casa principal
function crearCasaPrincipal() {
    return crearCasa(CASA_PRINCIPAL.x, CASA_PRINCIPAL.z, CASA_PRINCIPAL.giro);
}
const casaPrincipal = crearCasaPrincipal();
scene.add(casaPrincipal);

// Nubes
function crearNube(escala) {
    const nube = new Object3D();
    const bultos = [
        { x: 0.0, y: 0.0, z: 0.0, r: 1.6 },
        { x: 1.7, y: -0.2, z: 0.3, r: 1.2 },
        { x: -1.6, y: -0.15, z: -0.3, r: 1.15 },
        { x: 0.7, y: 0.5, z: -0.4, r: 1.0 }
    ];
    for (const bulto of bultos) {
        const puffs = new Mesh(geometriaNube, materialNube);
        puffs.position.x = bulto.x;
        puffs.position.y = bulto.y;
        puffs.position.z = bulto.z;
        puffs.scale.x = bulto.r;
        puffs.scale.y = bulto.r * 0.7;
        puffs.scale.z = bulto.r;
        nube.add(puffs);
    }
    nube.scale.x = nube.scale.y = nube.scale.z = escala;
    return nube;
}

const nubes = [
    { objeto: crearNube(3.0), velocidad: 0.55 },
    { objeto: crearNube(4.2), velocidad: 0.32 },
    { objeto: crearNube(2.4), velocidad: 0.80 }
];
nubes[0].objeto.position.x = -35; nubes[0].objeto.position.y = 17; nubes[0].objeto.position.z = -45;
nubes[1].objeto.position.x = 10; nubes[1].objeto.position.y = 21; nubes[1].objeto.position.z = -65;
nubes[2].objeto.position.x = -5; nubes[2].objeto.position.y = 15; nubes[2].objeto.position.z = -30;
for (const nube of nubes) scene.add(nube.objeto);

// Càmara y controles
const camera = new PerspectiveCamera(60, canvas.width / canvas.height, 0.5, 500);
const controles = new OrbitControls(canvas, camera, {
    x: 0, y: 8, z: -8, distancia: Math.max(45, 48 / camera.aspect), azimut: 0.75, elevacion: 0.30
});
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
});

// Estado de animaciÿn
let anguloRotor = 0;
let velocidadAngular = VELOCIDAD_INICIAL;
let pausa = false;
let lamparaEncendida = false;

// Dìa/Night
let sunTime = 0.25;
let isDaytime = true;
const hud = document.getElementById("estado");

function actualizarHUD() {
    if (!hud) return;
    const rpm = (velocidadAngular * 60) / (2 * Math.PI);
    hud.innerHTML = `Rotor: <b>${pausa ? "en pausa" : "girando"}</b><br>Velocidad: <b>${velocidadAngular.toFixed(2)} rad/s</b> (${rpm.toFixed(1)} RPM)<br>Lámpara: <b>${lamparaEncendida ? "encendida" : "apagada"}</b><br>Día/Noche: <b>${isDaytime ? "Día" : "Noche"}</b><br>Molinos: <b>${molinos.length}</b>`;
}

function reiniciarTodo() {
    controles.reiniciar();
    velocidadAngular = VELOCIDAD_INICIAL;
    anguloRotor = 0;
    pausa = false;
    actualizarHUD();
}

window.addEventListener("keydown", (evento) => {
    switch (true) {
        case evento.code === "Space": pausa = !pausa; evento.preventDefault(); break;
        case evento.key === "+" || evento.key === "=": velocidadAngular = Math.min(VELOCIDAD_MAXIMA, velocidadAngular + PASO_VELOCIDAD); break;
        case evento.key === "-" || evento.key === "_": velocidadAngular = Math.max(0, velocidadAngular - PASO_VELOCIDAD); break;
        case evento.key === "l" || evento.key === "L": lamparaEncendida = !lamparaEncendida; renderer.lampIntensity = lamparaEncendida ? INTENSIDAD_LAMPARA : 0.0; break;
        case evento.key === "r" || evento.key === "R": reiniciarTodo(); break;
        case evento.key === "n" || evento.key === "N": isDaytime = !isDaytime; sunTime = isDaytime ? 0.25 : 0.75; break;
    }
    actualizarHUD();
});
actualizarHUD();

// Render loop
let tiempoAnterior = 0;
function animate(ms) {
    const tiempo = ms * 0.001;
    const dt = Math.min(Math.max(tiempo - tiempoAnterior, 0), 0.1);
    tiempoAnterior = tiempo;
    if (!pausa) {
        anguloRotor += velocidadAngular * dt;
        for (const molino of molinos) {
            molino.rotor.rotation.z = anguloRotor * molino.factor;
        }
    }
    for (const nube of nubes) {
        nube.objeto.position.x += nube.velocidad * dt;
        if (nube.objeto.position.x > 80) nube.objeto.position.x = -80;
    }
    sunTime += 0.05 * dt;
    if (sunTime > 1.0) sunTime -= 1.0;
    isDaytime = Math.sin(sunTime * Math.PI * 2) > 0;
    renderer.lightDirection = [Math.cos(sunTime * Math.PI * 2) * 0.8, Math.sin(sunTime * Math.PI * 2) * 0.8, -0.5];
    renderer.ambient = isDaytime ? 0.38 : 0.32;
    controles.actualizar();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);