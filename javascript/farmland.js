import Interface from "./ui/interface.js";
export default class Farmland {
    constructor(collider) {
        this.collider = collider;
        this.collider.addUserInteraction(this, this.onclick, null, null);
        Interface.instance.addCollider(this.collider);
    }
    onclick(x, y) {
    }
    initLayout() {
        //var plant = new UICircleEntity(this.collider.centerX, this.collider.centerY, this.collider.)
        //var harvest = new UICircleEntity();
        //var inventory = new UICircleEntity();
        //var layout = new UILayout();
        //layout.addUIEntity(plant)
        //layout.addUIEntity(harvest)
        //layout.addUIEntity(inventory)
    }
}
export class FarmlandManager {
    constructor() {
    }
    addFarmland(collider) {
        this.farmlands.push(new Farmland(collider));
    }
}
//# sourceMappingURL=farmland.js.map