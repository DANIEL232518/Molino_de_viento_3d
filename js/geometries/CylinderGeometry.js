import { Geometry } from "../core/Geometry.js";

// Cilindro vertical centrado en el origen (eje = Y).
// Con radioSuperior < radioInferior produce un CONO TRUNCADO,
// que es lo que usa la torre del molino.
//
// La normal lateral se deriva de la pendiente del perfil:
//     pendiente = (radioInferior - radioSuperior) / altura
//     normal    = normalizar( cos(teta), pendiente, sin(teta) )
//
// Si pendiente = 0 la normal queda horizontal (cilindro normal).
// Si radioSuperior = 0 obtenemos un cono (ver ConeGeometry).
export class CylinderGeometry extends Geometry {

    constructor(
        radioSuperior = 1,
        radioInferior = 1,
        altura = 1,
        segmentos = 32,
        { tapaSuperior = true, tapaInferior = true } = {}
    ) {
        super();

        const vertices = [];
        const indices = [];

        const mediaAltura = altura / 2;
        const pendiente =
            (radioInferior - radioSuperior) / altura;

        const longitudNormal = Math.hypot(1, pendiente);

        // ---------------------------------------------------------
        // 1. LATERAL: dos anillos (inferior y superior)
        // ---------------------------------------------------------
        const anillos = [
            { y: -mediaAltura, r: radioInferior, v: 0 },
            { y:  mediaAltura, r: radioSuperior, v: 1 }
        ];

        for (const anillo of anillos) {

            for (let j = 0; j <= segmentos; j++) {

                const u = j / segmentos;
                const teta = u * Math.PI * 2;

                const c = Math.cos(teta);
                const s = Math.sin(teta);

                vertices.push(anillo.r * c, anillo.y, anillo.r * s); // posición
                vertices.push(c / longitudNormal,
                              pendiente / longitudNormal,
                              s / longitudNormal);                    // normal
                vertices.push(u, anillo.v);                           // UV
            }
        }

        const columnas = segmentos + 1;

        for (let j = 0; j < segmentos; j++) {

            const a = j;
            const b = j + columnas;

            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }

        // ---------------------------------------------------------
        // 2. TAPAS (círculos con normal vertical)
        // ---------------------------------------------------------
        const agregarTapa = (y, radio, normalY) => {

            if (radio <= 0.0001) {
                return; // cono: no hay disco que cerrar
            }

            const centro = vertices.length / 8;

            vertices.push(0, y, 0, 0, normalY, 0, 0.5, 0.5);

            const inicio = vertices.length / 8;

            for (let j = 0; j <= segmentos; j++) {

                const teta = (j / segmentos) * Math.PI * 2;
                const c = Math.cos(teta);
                const s = Math.sin(teta);

                vertices.push(radio * c, y, radio * s); // posición
                vertices.push(0, normalY, 0);           // normal
                vertices.push(0.5 + 0.5 * c,
                              0.5 + 0.5 * s);           // UV circular
            }

            for (let j = 0; j < segmentos; j++) {
                indices.push(centro, inicio + j, inicio + j + 1);
            }
        };

        if (tapaSuperior) {
            agregarTapa(mediaAltura, radioSuperior, 1);
        }

        if (tapaInferior) {
            agregarTapa(-mediaAltura, radioInferior, -1);
        }

        this.vertices = new Float32Array(vertices);
        this.indices = new Uint16Array(indices);
        this.indexCount = this.indices.length;
    }
}
