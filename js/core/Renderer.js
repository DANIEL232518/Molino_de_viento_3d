export class Renderer {

    constructor(canvas) {

        this.canvas = canvas;

        this.gl = canvas.getContext("webgl2");

        if (!this.gl) {
            throw new Error("WebGL2 no está disponible.");
        }

        const gl = this.gl;

        gl.viewport(0, 0, canvas.width, canvas.height);

        // Cielo azul uniforme (propuesta: fondo de ambiente).
        this.colorFondo = [0.47, 0.71, 0.92, 1.0];

        gl.clearColor(...this.colorFondo);

        gl.enable(gl.DEPTH_TEST);

        this.program = this.createProgram();
        this.locations = this.getLocations();

        // --------------------------------------------------------
        // ILUMINACIÓN
        // --------------------------------------------------------
        // Luz direccional tipo sol: dirección hacia el sol.
        this.lightDirection = [0.45, 0.8, 0.40];

        // Luz puntual (lámpara) cerca del molino: apagada por defecto.
        this.lampPosition = [2.2, 5.0, 3.0];
        this.lampColor = [1.0, 0.78, 0.45];
        this.lampIntensity = 0.0;

        // Componente ambiental: evita que las caras de espalda queden negras.
        this.ambient = 0.38;
    }

    setSize(width, height) {

        const pixelRatio = window.devicePixelRatio || 1;
        const drawingWidth = Math.max(1, Math.floor(width * pixelRatio));
        const drawingHeight = Math.max(1, Math.floor(height * pixelRatio));

        if (this.canvas.width !== drawingWidth ||
            this.canvas.height !== drawingHeight) {
            this.canvas.width = drawingWidth;
            this.canvas.height = drawingHeight;
        }

        this.gl.viewport(0, 0, drawingWidth, drawingHeight);
    }

    fijarColorFondo(r, g, b) {

        this.colorFondo = [r, g, b, 1.0];
        this.gl.clearColor(r, g, b, 1.0);
    }

    createShader(type, source) {

        const gl = this.gl;

        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    createProgram() {

        const gl = this.gl;

        // --------------------------------------------------------
        // SHADER DE VÉRTICES
        // --------------------------------------------------------
        const vertexSource = `#version 300 es

        in vec3 aPosition;
        in vec3 aNormal;
        in vec2 aTexCoord;

        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;

        out vec3 vNormal;
        out vec3 vWorldPosition;
        out vec2 vTexCoord;

        void main() {

            vec4 worldPosition =
                uModelMatrix * vec4(aPosition, 1.0);

            gl_Position =
                uProjectionMatrix *
                uViewMatrix *
                worldPosition;

            vWorldPosition = worldPosition.xyz;

            // Normal al espacio del mundo (mat3 de la matriz de modelo).
            vNormal = normalize(mat3(uModelMatrix) * aNormal);

            vTexCoord = aTexCoord;
        }
        `;

        // --------------------------------------------------------
        // SHADER DE FRAGMENTOS
        // --------------------------------------------------------
        // Modelo de iluminación: ambiente + difusa solar + puntual.
        const fragmentSource = `#version 300 es

        precision highp float;

        in vec3 vNormal;
        in vec3 vWorldPosition;
        in vec2 vTexCoord;

        uniform sampler2D uTexture;
        uniform vec3 uSunDirection;
        uniform vec3 uLampPosition;
        uniform vec3 uLampColor;
        uniform float uLampIntensity;
        uniform float uAmbient;
        uniform bool uEmissive;

        out vec4 outColor;

        void main() {

            vec3 colorTextura =
                texture(uTexture, vTexCoord).rgb;

            // Los cuerpos emisivos (sol, focos) ignoran la luz.
            if (uEmissive) {
                outColor = vec4(colorTextura, 1.0);
                return;
            }

            vec3 N = normalize(vNormal);

            // --- 1. Luz direccional tipo sol ---
            vec3 L = normalize(uSunDirection);
            float difusaSolar = max(dot(N, L), 0.0);

            // --- 2. Luz puntual (lámpara del molino) ---
            float difusaPuntual = 0.0;

            if (uLampIntensity > 0.0) {

                vec3 alLampara = uLampPosition - vWorldPosition;
                float distancia = length(alLampara);

                // Atenuación: la luz se debilita con la distancia al cuadrado.
                float atenuacion =
                    1.0 / (1.0 + 0.04 * distancia * distancia);

                float difusa = max(
                    dot(N, alLampara / max(distancia, 0.0001)),
                    0.0
                );

                difusaPuntual = difusa * atenuacion * uLampIntensity;
            }

            // --- 3. Composición final ---
            vec3 iluminacion =
                vec3(uAmbient) +
                vec3(1.0, 0.98, 0.92) * difusaSolar * 0.85 +
                uLampColor * difusaPuntual;

            outColor = vec4(colorTextura * iluminacion, 1.0);
        }
        `;

        const vs = this.createShader(gl.VERTEX_SHADER, vertexSource);
        const fs = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);

        const program = gl.createProgram();

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program));
        }

        return program;
    }

    getLocations() {

        const gl = this.gl;
        const p = this.program;

        return {
            position:    gl.getAttribLocation(p, "aPosition"),
            normal:      gl.getAttribLocation(p, "aNormal"),
            uv:          gl.getAttribLocation(p, "aTexCoord"),

            model:       gl.getUniformLocation(p, "uModelMatrix"),
            view:        gl.getUniformLocation(p, "uViewMatrix"),
            projection:  gl.getUniformLocation(p, "uProjectionMatrix"),

            texture:     gl.getUniformLocation(p, "uTexture"),
            sun:         gl.getUniformLocation(p, "uSunDirection"),
            lamp:        gl.getUniformLocation(p, "uLampPosition"),
            lampColor:   gl.getUniformLocation(p, "uLampColor"),
            lampIntensity: gl.getUniformLocation(p, "uLampIntensity"),
            ambient:     gl.getUniformLocation(p, "uAmbient"),
            emissive:    gl.getUniformLocation(p, "uEmissive")
        };
    }

    // Crea el VAO la primera vez que se dibuja una geometría.
    initGeometry(geometry) {

        if (geometry.initialized) {
            return;
        }

        const gl = this.gl;
        const loc = this.locations;

        geometry.vao = gl.createVertexArray();
        gl.bindVertexArray(geometry.vao);

        geometry.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);

        geometry.ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

        // Intercalado: posición(3) + normal(3) + UV(2) = 8 floats.
        const stride = 8 * Float32Array.BYTES_PER_ELEMENT;

        gl.enableVertexAttribArray(loc.position);
        gl.vertexAttribPointer(loc.position, 3, gl.FLOAT, false, stride, 0);

        gl.enableVertexAttribArray(loc.normal);
        gl.vertexAttribPointer(
            loc.normal, 3, gl.FLOAT, false, stride,
            3 * Float32Array.BYTES_PER_ELEMENT
        );

        gl.enableVertexAttribArray(loc.uv);
        gl.vertexAttribPointer(
            loc.uv, 2, gl.FLOAT, false, stride,
            6 * Float32Array.BYTES_PER_ELEMENT
        );

        gl.bindVertexArray(null);

        geometry.initialized = true;
    }

    render(scene, camera) {

        const gl = this.gl;
        const loc = this.locations;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        camera.updateViewMatrix();
        scene.updateMatrixWorld();

        gl.useProgram(this.program);

        gl.uniformMatrix4fv(loc.view, false, camera.viewMatrix);
        gl.uniformMatrix4fv(loc.projection, false, camera.projectionMatrix);

        gl.uniform3f(loc.sun,
            this.lightDirection[0],
            this.lightDirection[1],
            this.lightDirection[2]
        );

        gl.uniform3f(loc.lamp,
            this.lampPosition[0],
            this.lampPosition[1],
            this.lampPosition[2]
        );

        gl.uniform3f(loc.lampColor,
            this.lampColor[0],
            this.lampColor[1],
            this.lampColor[2]
        );

        gl.uniform1f(loc.lampIntensity, this.lampIntensity);
        gl.uniform1f(loc.ambient, this.ambient);

        gl.uniform1i(loc.texture, 0);

        this.renderObject(scene);
    }

    renderObject(object) {

        if (!object.visible) {
            return;
        }

        // El Renderer no sabe qué representa el objeto:
        // dibuja todo lo que tenga geometría + material.
        if (object.geometry && object.material) {
            this.drawMesh(object);
        }

        for (const child of object.children) {
            this.renderObject(child);
        }
    }

    drawMesh(mesh) {

        const gl = this.gl;
        const loc = this.locations;

        const geometry = mesh.geometry;
        const material = mesh.material;

        this.initGeometry(geometry);

        gl.bindVertexArray(geometry.vao);

        gl.uniformMatrix4fv(loc.model, false, mesh.matrixWorld);

        gl.uniform1i(loc.emissive, material.emissive ? 1 : 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, material.texture);

        gl.drawElements(
            gl.TRIANGLES,
            geometry.indexCount,
            gl.UNSIGNED_SHORT,
            0
        );
    }
}
