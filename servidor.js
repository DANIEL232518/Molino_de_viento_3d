/*
 * servidor.js — servidor HTTP local mínimo (solo Node, sin dependencias)
 *
 * Los módulos ES (import/export) NO se cargan desde file:// por seguridad
 * del navegador, así que el proyecto debe abrirse por HTTP.
 *
 * Uso:   node servidor.js
 * Abre:  http://127.0.0.1:8000
 *
 * Detener: Ctrl + C en la terminal.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = __dirname;
const PUERTO = process.env.PUERTO || 8000;

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

const servidor = http.createServer((req, res) => {

    // Se desecha la consulta (?...) y se decodifican los espacios (%20).
    const relativa = decodeURIComponent(req.url.split("?")[0]);
    let archivo = path.join(RAIZ, relativa === "/" ? "index.html" : relativa);

    // Defensa básica: nunca salir de la carpeta del proyecto.
    if (!archivo.startsWith(RAIZ)) {
        res.writeHead(403);
        res.end("prohibido");
        return;
    }

    if (fs.existsSync(archivo) && fs.statSync(archivo).isDirectory()) {
        archivo = path.join(archivo, "index.html");
    }

    if (!fs.existsSync(archivo)) {
        res.writeHead(404);
        res.end("404 — no encontrado: " + relativa);
        return;
    }

    res.writeHead(200, {
        "Content-Type": MIME[path.extname(archivo).toLowerCase()] || "application/octet-stream"
    });

    fs.createReadStream(archivo).pipe(res);
});

servidor.listen(PUERTO, "127.0.0.1", () => {
    console.log("Molino de viento 3D servido en  http://127.0.0.1:" + PUERTO);
    console.log("Detener con Ctrl + C");
});
