// Geometry guarda los datos del modelo:
// vértices (posición + normal + UV) e índices.
// El VAO/GPU se crea perezosamente en el Renderer.
export class Geometry {

    constructor() {
        this.vertices = null;
        this.indices = null;

        this.vao = null;
        this.vbo = null;
        this.ebo = null;

        this.indexCount = 0;
        this.initialized = false;
    }
}
