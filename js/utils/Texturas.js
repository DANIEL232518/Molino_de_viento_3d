// ============================================================
// TEXTURAS PROCEDURALES
//
// Cada función dibuja en un canvas 2D y devuelve una textura
// lista para usar. No se necesita ningún archivo de imagen:
// el césped, la piedra, el techo y la madera se generan con
// código (patrón y colores decididos por el programa).
// ============================================================

// Dibuja una figura repetida en los 9 vecinos de la retícula
// para que la textura quede "sin costuras" al repetirse (WRAP REPEAT).
function conEnvoltura(ctx, w, h, dibujar) {
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            ctx.save();
            ctx.translate(dx * w, dy * h);
            dibujar();
            ctx.restore();
        }
    }
}

// ------------------------------------------------------------
// CÉSPED del terreno (se repite sobre el plano)
// ------------------------------------------------------------
export function crearTexturaCesped(loader) {

    return loader.createPattern(512, 512, (ctx, w, h) => {

        ctx.fillStyle = "#4f8b3c";
        ctx.fillRect(0, 0, w, h);

        // Manchas de hierba más clara y más oscura.
        for (let i = 0; i < 160; i++) {

            const x = Math.random() * w;
            const y = Math.random() * h;
            const r = 10 + Math.random() * 40;
            const claro = Math.random() > 0.5;

            conEnvoltura(ctx, w, h, () => {
                ctx.fillStyle = claro
                    ? "rgba(126, 176, 86, 0.22)"
                    : "rgba(45, 104, 46, 0.24)";

                ctx.beginPath();
                ctx.ellipse(x, y, r, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Briznas de hierba: trazos cortos y finos.
        for (let i = 0; i < 4500; i++) {

            const x = Math.random() * w;
            const y = Math.random() * h;
            const largo = 4 + Math.random() * 7;
            const inclina = (Math.random() - 0.5) * 4;

            const tono = 90 + Math.floor(Math.random() * 90);

            conEnvoltura(ctx, w, h, () => {
                ctx.strokeStyle = `rgba(${Math.floor(tono * 0.55)}, ${tono}, ${Math.floor(tono * 0.42)}, 0.5)`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + inclina, y - largo);
                ctx.stroke();
            });
        }

    }, true); // repetir = true
}

// ------------------------------------------------------------
// PIEDRA de la torre
// ------------------------------------------------------------
export function crearTexturaPiedra(loader) {

    return loader.createPattern(256, 256, (ctx, w, h) => {

        ctx.fillStyle = "#8d8271";
        ctx.fillRect(0, 0, w, h);

        const filas = 7;
        const columnas = 5;
        const altoBloque = h / filas;
        const anchoBloque = w / columnas;
        const junta = 3;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.clip();

        for (let fila = 0; fila < filas; fila++) {

            // Filas alternadas, como un muro de sillería.
            const desfase = (fila % 2) * (anchoBloque / 2);

            for (let j = -1; j <= columnas; j++) {

                const x = j * anchoBloque + desfase;
                const y = fila * altoBloque;

                const base = 165 + Math.floor(Math.random() * 40);

                ctx.fillStyle =
                    `rgb(${base}, ${base - 14}, ${base - 38})`;

                ctx.fillRect(
                    x + junta / 2,
                    y + junta / 2,
                    anchoBloque - junta,
                    altoBloque - junta
                );

                // Sombra suave en el borde inferior de cada bloque.
                ctx.fillStyle = "rgba(0, 0, 0, 0.13)";
                ctx.fillRect(
                    x + junta / 2,
                    y + altoBloque - junta,
                    anchoBloque - junta,
                    3
                );
            }
        }

        ctx.restore();

        // Grano fino de la piedra.
        for (let i = 0; i < 900; i++) {

            const x = Math.random() * w;
            const y = Math.random() * h;
            const oscuro = Math.random() > 0.5;

            ctx.fillStyle = oscuro
                ? "rgba(60, 52, 42, 0.18)"
                : "rgba(255, 250, 235, 0.16)";

            ctx.fillRect(x, y, 2, 2);
        }

    }, true);
}

// ------------------------------------------------------------
// TECHO (tejas oscuras)
// ------------------------------------------------------------
export function crearTexturaTecho(loader) {

    return loader.createPattern(256, 256, (ctx, w, h) => {

        ctx.fillStyle = "#3c414a";
        ctx.fillRect(0, 0, w, h);

        const filas = 9;
        const columnas = 7;
        const altoTeja = h / filas;
        const anchoTeja = w / columnas;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.clip();

        for (let fila = 0; fila < filas; fila++) {

            const desfase = (fila % 2) * (anchoTeja / 2);
            const y = fila * altoTeja;

            for (let j = -1; j <= columnas; j++) {

                const x = j * anchoTeja + desfase;

                const base = 66 + Math.floor(Math.random() * 26);

                ctx.fillStyle =
                    `rgb(${base}, ${base + 5}, ${base + 12})`;

                ctx.beginPath();
                ctx.moveTo(x + 2, y);
                ctx.lineTo(x + anchoTeja - 2, y);
                ctx.lineTo(x + anchoTeja - 2, y + altoTeja - 4);
                ctx.quadraticCurveTo(
                    x + anchoTeja / 2,
                    y + altoTeja + 3,
                    x + 2,
                    y + altoTeja - 4
                );
                ctx.closePath();
                ctx.fill();

                // Brillito superior de la teja.
                ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
                ctx.fillRect(x + 3, y + 2, anchoTeja - 6, 3);
            }
        }

        ctx.restore();

    }, true);
}

// ------------------------------------------------------------
// MADERA de las aspas y del buje
// ------------------------------------------------------------
export function crearTexturaMadera(loader) {

    return loader.createPattern(256, 256, (ctx, w, h) => {

        ctx.fillStyle = "#a9713c";
        ctx.fillRect(0, 0, w, h);

        const columnas = 12;
        const paso = w / columnas;

        // Vetas: líneas onduladas paralelas al eje de la pieza (V).
        for (let j = 0; j <= columnas; j++) {

            const x0 = j * paso;
            const ondulacion = 2 + Math.random() * 4;
            const fase = Math.random() * Math.PI * 2;

            ctx.strokeStyle = `rgba(92, 54, 24, ${0.16 + Math.random() * 0.22})`;
            ctx.lineWidth = 1 + Math.random() * 2;

            ctx.beginPath();

            for (let y = 0; y <= h; y += 8) {
                const x = x0 + Math.sin(y * 0.05 + fase) * ondulacion;
                if (y === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();
        }

        // Nudos ocasionales.
        for (let i = 0; i < 4; i++) {

            const x = Math.random() * w;
            const y = Math.random() * h;

            const gradiente = ctx.createRadialGradient(x, y, 1, x, y, 9);
            gradiente.addColorStop(0, "rgba(74, 42, 18, 0.75)");
            gradiente.addColorStop(1, "rgba(74, 42, 18, 0)");

            ctx.fillStyle = gradiente;
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sombreado lateral para dar volumen a la tabla.
        const lateral = ctx.createLinearGradient(0, 0, w, 0);
        lateral.addColorStop(0, "rgba(0, 0, 0, 0.22)");
        lateral.addColorStop(0.5, "rgba(255, 255, 255, 0.06)");
        lateral.addColorStop(1, "rgba(0, 0, 0, 0.22)");

        ctx.fillStyle = lateral;
        ctx.fillRect(0, 0, w, h);

    }, true);
}

// ------------------------------------------------------------
// MURO de la casa (estuco cálido + zócalo de piedra)
//
// El lienzo se dibuja con la base hacia abajo: las UV de la cara
// frontal de una caja van de v = 0 (abajo) a v = 1 (arriba), así
// que el tercio inferior del dibujo queda a los pies del muro.
// ------------------------------------------------------------
export function crearTexturaMuro(loader) {

    return loader.createPattern(256, 256, (ctx, w, h) => {

        // Estuco crema.
        ctx.fillStyle = "#e8dcc4";
        ctx.fillRect(0, 0, w, h);

        // Manchas de humedad y desgaste.
        for (let i = 0; i < 130; i++) {

            const x = Math.random() * w;
            const y = Math.random() * h;
            const r = 6 + Math.random() * 26;

            ctx.fillStyle = Math.random() > 0.5
                ? "rgba(190, 172, 140, 0.20)"
                : "rgba(255, 252, 244, 0.28)";

            ctx.beginPath();
            ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // Grano fino del estuco.
        for (let i = 0; i < 1400; i++) {

            const oscuro = Math.random() > 0.5;

            ctx.fillStyle = oscuro
                ? "rgba(120, 104, 78, 0.14)"
                : "rgba(255, 255, 250, 0.22)";

            ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
        }

        // --- Zócalo de piedra en el tercio inferior ---
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, h * 0.66, w, h * 0.34);
        ctx.clip();

        ctx.fillStyle = "#8f8579";
        ctx.fillRect(0, h * 0.66, w, h * 0.34);

        const filas = 3;
        const columnas = 6;
        const altoBloque = (h * 0.34) / filas;
        const anchoBloque = w / columnas;

        for (let fila = 0; fila < filas; fila++) {

            const desfase = (fila % 2) * (anchoBloque / 2);
            const y = h * 0.66 + fila * altoBloque;

            for (let j = -1; j <= columnas; j++) {

                const base = 150 + Math.floor(Math.random() * 45);

                ctx.fillStyle = `rgb(${base}, ${base - 8}, ${base - 20})`;
                ctx.fillRect(
                    j * anchoBloque + desfase + 2,
                    y + 2,
                    anchoBloque - 4,
                    altoBloque - 4
                );
            }
        }

        // Sombra de contacto entre zócalo y estuco.
        const borde = ctx.createLinearGradient(0, h * 0.66, 0, h * 0.66 + 14);
        borde.addColorStop(0, "rgba(0, 0, 0, 0.42)");
        borde.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = borde;
        ctx.fillRect(0, h * 0.66, w, 14);

        ctx.restore();

    }, true);
}
