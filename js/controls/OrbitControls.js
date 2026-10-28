// ============================================================
// OrbitControls
//
// Cámara orbital inspirada en la interacción del Paso 15:
//
//   - arrastrar con el mouse -> orbitar (azimut / elevación)
//   - rueda del mouse        -> acercar / alejar (distancia)
//   - flechas del teclado    -> orbitar por pasos
//   - R (en main.js)         -> reiniciar
//
// La cámara se coloca siempre sobre una esfera imaginaria
// centrada en "objetivo", usando azimut, elevación y distancia.
// ============================================================

function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(maximo, valor));
}

export class OrbitControls {

    constructor(canvas, camera, opciones = {}) {

        this.canvas = canvas;
        this.camera = camera;

        this.objetivo = {
            x: opciones.x ?? 0,
            y: opciones.y ?? 4.5,
            z: opciones.z ?? 0
        };

        this.distancia = opciones.distancia ?? 20;
        this.azimut = opciones.azimut ?? 0.75;
        this.elevacion = opciones.elevacion ?? 0.32;

        this.distanciaMin = opciones.distanciaMin ?? 6;
        this.distanciaMax = opciones.distanciaMax ?? 60;

        this.sensibilidadMouse = 0.0075;
        this.sensibilidadZoom = 0.0022;

        // Valores de partida para poder restablecer la cámara.
        this.inicial = {
            objetivo: { ...this.objetivo },
            distancia: this.distancia,
            azimut: this.azimut,
            elevacion: this.elevacion
        };

        this.arrastrando = false;
        this.anteriorX = 0;
        this.anteriorY = 0;

        this.conectar();
        this.actualizar();
    }

    conectar() {

        const canvas = this.canvas;

        canvas.addEventListener("mousedown", (evento) => {
            this.arrastrando = true;
            this.anteriorX = evento.clientX;
            this.anteriorY = evento.clientY;
            canvas.classList.add("arrastrando");
        });

        window.addEventListener("mouseup", () => {
            this.arrastrando = false;
            canvas.classList.remove("arrastrando");
        });

        window.addEventListener("mousemove", (evento) => {

            if (!this.arrastrando) {
                return;
            }

            const dx = evento.clientX - this.anteriorX;
            const dy = evento.clientY - this.anteriorY;

            this.anteriorX = evento.clientX;
            this.anteriorY = evento.clientY;

            this.azimut -= dx * this.sensibilidadMouse;
            this.elevacion += dy * this.sensibilidadMouse;

            this.limitarElevacion();
        });

        canvas.addEventListener("wheel", (evento) => {

            evento.preventDefault();

            this.distancia += evento.deltaY * this.sensibilidadZoom;
            this.distancia = limitar(
                this.distancia,
                this.distanciaMin,
                this.distanciaMax
            );

        }, { passive: false });

        window.addEventListener("keydown", (evento) => {

            const paso = 0.08;
            let movimiento = true;

            switch (evento.key) {
                case "ArrowLeft":  this.azimut += paso; break;
                case "ArrowRight": this.azimut -= paso; break;
                case "ArrowUp":    this.elevacion += paso; break;
                case "ArrowDown":  this.elevacion -= paso; break;
                case "w":          this.elevacion += paso; break; // mirar arriba
                case "s":          this.elevacion -= paso; break; // mirar abajo
                case "a":          this.azimut += paso; break;  // pan izquierdo
                case "d":          this.azimut -= paso; break;  // pan derecho
                default: movimiento = false;
            }

            if (movimiento) {
                evento.preventDefault();
                this.limitarElevacion();
            }
        });
    }

    limitarElevacion() {

        // Evitamos los polos: allí el vector "up" de la vista se inestabiliza.
        const limite = Math.PI / 2 - 0.08;

        this.elevacion = limitar(this.elevacion, -limite, limite);
    }

    reiniciar() {

        this.objetivo = { ...this.inicial.objetivo };
        this.distancia = this.inicial.distancia;
        this.azimut = this.inicial.azimut;
        this.elevacion = this.inicial.elevacion;

        this.actualizar();
    }

    // Convierte esfera (azimut, elevación, distancia) en posición cartesiana.
    actualizar() {

        const cosElevacion = Math.cos(this.elevacion);

        this.camera.position.x =
            this.objetivo.x +
            this.distancia * cosElevacion * Math.sin(this.azimut);

        this.camera.position.y =
            this.objetivo.y +
            this.distancia * Math.sin(this.elevacion);

        this.camera.position.z =
            this.objetivo.z +
            this.distancia * cosElevacion * Math.cos(this.azimut);

        this.camera.target.x = this.objetivo.x;
        this.camera.target.y = this.objetivo.y;
        this.camera.target.z = this.objetivo.z;
    }
}
