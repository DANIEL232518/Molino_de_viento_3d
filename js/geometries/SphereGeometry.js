import { Geometry } from "../core/Geometry.js";

// Esfera de la clase (Sistema Solar) reutilizada
// en este proyecto para construir las nubes.
export class SphereGeometry extends Geometry {

    constructor(radio = 1, latitudes = 32, longitudes = 48) {
        super();

        const vertices = [];
        const indices = [];

        for (let lat = 0; lat <= latitudes; lat++) {

            const v = lat / latitudes;
            const phi = v * Math.PI;

            for (let lon = 0; lon <= longitudes; lon++) {

                const u = lon / longitudes;
                const theta = u * Math.PI * 2;

                const nx = Math.sin(phi) * Math.cos(theta);
                const ny = Math.cos(phi);
                const nz = Math.sin(phi) * Math.sin(theta);

                vertices.push(radio * nx, radio * ny, radio * nz); // posición
                vertices.push(nx, ny, nz);                          // normal
                vertices.push(u, 1.0 - v);                          // UV
            }
        }

        const columnas = longitudes + 1;

        for (let lat = 0; lat < latitudes; lat++) {
            for (let lon = 0; lon < longitudes; lon++) {

                const a = lat * columnas + lon;
                const b = a + columnas;

                indices.push(a, b, a + 1);
                indices.push(b, b + 1, a + 1);
            }
        }

        this.vertices = new Float32Array(vertices);
        this.indices = new Uint16Array(indices);
        this.indexCount = this.indices.length;
    }
}
