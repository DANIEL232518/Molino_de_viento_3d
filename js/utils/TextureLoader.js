export class TextureLoader {

    constructor(gl) {
        this.gl = gl;
    }

    // Carga una imagen desde una URL (patrón de la clase).
    load(url) {

        const gl = this.gl;

        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Píxel blanco temporal mientras carga la imagen.
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
            gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([255, 255, 255, 255])
        );

        const image = new Image();

        image.onload = () => {

            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA,
                gl.RGBA, gl.UNSIGNED_BYTE, image
            );

            gl.generateMipmap(gl.TEXTURE_2D);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        };

        image.src = url;

        return texture;
    }

    // Textura de un solo color plano.
    createColor(r, g, b, a = 255) {

        const gl = this.gl;

        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
            gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([r, g, b, a])
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        return texture;
    }

    // ------------------------------------------------------------
    // Textura procedural: se dibuja en un canvas 2D y se sube a la GPU.
    // Esto permite crear césped, piedra, techo y madera sin depender
    // de archivos de imagen externos.
    //
    //   repetir = true  ->  WRAP REPEAT (para UV > 1, p. ej. el terreno)
    //   repetir = false ->  WRAP CLAMP_TO_EDGE
    // ------------------------------------------------------------
    createPattern(ancho, alto, dibujar, repetir = false) {

        const gl = this.gl;

        const lienzo = document.createElement("canvas");
        lienzo.width = ancho;
        lienzo.height = alto;

        const ctx = lienzo.getContext("2d");
        dibujar(ctx, ancho, alto);

        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA,
            gl.RGBA, gl.UNSIGNED_BYTE, lienzo
        );

        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        const modo = repetir ? gl.REPEAT : gl.CLAMP_TO_EDGE;

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, modo);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, modo);

        return texture;
    }
}
