import Entity from "./entity.js";
import { BoxCollider } from "./collider.js";
export default class Farmland extends Entity {
    constructor(canvas, ctx, x, y, w, h) {
        super();
        this.setCollider(new BoxCollider(x, y, w, h, false));
        var col = this.getCollider();
        if (col) {
            col.addUserInteraction(this, this.onclick, null, null);
        }
    }
    onclick(x, y) {
    }
}
//# sourceMappingURL=farmland.js.map