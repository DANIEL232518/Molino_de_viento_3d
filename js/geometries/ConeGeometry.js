import { CylinderGeometry } from "./CylinderGeometry.js";

// Cono = cilindro cuyo radio superior es cero.
// Reutiliza toda la idea de anillos, pendiente y normales
// del cilindro; solo cambia la relación de radios.
export class ConeGeometry extends CylinderGeometry {

    constructor(radio = 1, altura = 1, segmentos = 32) {
        super(
            0,              // radio superior: ápice
            radio,          // radio inferior: base
            altura,
            segmentos,
            {
                tapaSuperior: false,
                tapaInferior: true
            }
        );
    }
}
