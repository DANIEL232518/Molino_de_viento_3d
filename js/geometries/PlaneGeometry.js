import { Geometry } from "../core/Geometry.js";

// Plano horizontal (XZ) centrado en el origen y con normal hacia +Y.
// Es la geometría más simple del proyecto: 4 vértices = 2 triángulos.
//
//   (-a/2,0,-p/2) ---- (a/2,0,-p/2)
//          |    \           |
//          |       \        |
//   (-a/2,0, p/2) ---- (a/2,0, p/2)
//
// repU / repV permiten que las UV superen 1.0 para repetir la
// textura (WRAP REPEAT). Así el césped no se estira demasiado.
export class PlaneGeometry extends Geometry {

    constructor(ancho = 1, profundidad = 1, repU = 1, repV = 1) {
        super();

        const hx = ancho / 2;
        const hz = profundidad / 2;

        const vertices = [
            // x     y    z     nx ny nz   u    v
            -hx, 0, -hz,   0, 1, 0,   0,   0,
             hx, 0, -hz,   0, 1, 0,   repU, 0,
            -hx, 0,  hz,   0, 1, 0,   0,   repV,
             hx, 0,  hz,   0, 1, 0,   repU, repV
        ];

        const indices = [
            0, 2, 1,
            1, 2, 3
        ];

        this.vertices = new Float32Array(vertices);
        this.indices = new Uint16Array(indices);
        this.indexCount = this.indices.length;
    }
}
