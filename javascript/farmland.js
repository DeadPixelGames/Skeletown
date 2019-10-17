export class FarmlandManager {
    constructor() {
        this.farmlands = [null];
    }
    addFarmland(tile) {
        this.farmlands.push(tile);
    }
    toggleActive() {
        for (let tile of this.farmlands) {
            if (tile) {
                tile.uiLayout.toggleActive();
                tile.uiLayout.visible = false;
                tile.collider.active = !tile.collider.active;
            }
        }
    }
    activateThis(tile) {
        tile.uiLayout.visible = true;
        tile.uiLayout.activate();
        for (let t of this.farmlands) {
            if (t == tile)
                continue;
            if (t) {
                t.uiLayout.visible = false;
                t.uiLayout.deactivate();
            }
        }
    }
}
FarmlandManager.instance = new FarmlandManager;
//# sourceMappingURL=farmland.js.map