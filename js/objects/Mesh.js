import { Object3D } from "../core/Object3D.js";

// Un objeto visible = Geometría + Material + transformación.
export class Mesh extends Object3D {

    constructor(geometry, material) {
        super();

        this.geometry = geometry;
        this.material = material;
    }
}
