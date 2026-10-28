import { Geometry } from "../core/Geometry.js";

// Prisma rectangular (caja) centrada en el origen.
// Se usa para las cuatro aspas del molino.
// 6 caras × 4 vértices = 24 vértices, porque cada cara
// necesita su propia normal y sus propias UV.
export class BoxGeometry extends Geometry {

    constructor(ancho = 1, alto = 1, fondo = 1) {
        super();

        const hx = ancho / 2;
        const hy = alto / 2;
        const hz = fondo / 2;

        // Cada cara: normal + 4 esquinas en sentido antihorario.
        const caras = [
            { n: [ 1, 0, 0], v: [[ hx,-hy, hz], [ hx,-hy,-hz], [ hx, hy,-hz], [ hx, hy, hz]] },
            { n: [-1, 0, 0], v: [[-hx,-hy,-hz], [-hx,-hy, hz], [-hx, hy, hz], [-hx, hy,-hz]] },
            { n: [ 0, 1, 0], v: [[-hx, hy, hz], [ hx, hy, hz], [ hx, hy,-hz], [-hx, hy,-hz]] },
            { n: [ 0,-1, 0], v: [[-hx,-hy,-hz], [ hx,-hy,-hz], [ hx,-hy, hz], [-hx,-hy, hz]] },
            { n: [ 0, 0, 1], v: [[-hx,-hy, hz], [ hx,-hy, hz], [ hx, hy, hz], [-hx, hy, hz]] },
            { n: [ 0, 0,-1], v: [[ hx,-hy,-hz], [-hx,-hy,-hz], [-hx, hy,-hz], [ hx, hy,-hz]] }
        ];

        const uvs = [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1]
        ];

        const vertices = [];
        const indices = [];

        for (const cara of caras) {

            const base = vertices.length / 8;

            for (let i = 0; i < 4; i++) {
                vertices.push(
                    cara.v[i][0], cara.v[i][1], cara.v[i][2], // posición
                    cara.n[0], cara.n[1], cara.n[2],           // normal
                    uvs[i][0], uvs[i][1]                       // UV
                );
            }

            indices.push(base, base + 1, base + 2);
            indices.push(base, base + 2, base + 3);
        }

        this.vertices = new Float32Array(vertices);
        this.indices = new Uint16Array(indices);
        this.indexCount = this.indices.length;
    }
}
