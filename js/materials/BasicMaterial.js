// BasicMaterial agrupa la apariencia del objeto:
// su textura y si debe ignorar la iluminación.
export class BasicMaterial {

    constructor({ texture = null, emissive = false } = {}) {
        this.texture = texture;
        this.emissive = emissive;
    }
}
