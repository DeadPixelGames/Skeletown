export class FarmlandManager {
    constructor() {
        this.farmlands = [null];
    }
    addFarmland(tile) {
        this.farmlands.push(tile);
    }
    activate() {
        for (let tile of this.farmlands) {
            if (tile) {
                tile.uiLayout.activate();
                tile.collider.active = true;
                tile.uiLayout.visible = false;
            }
        }
    }
    deactivate() {
        for (let tile of this.farmlands) {
            if (tile) {
                tile.uiLayout.deactivate();
                tile.collider.active = false;
                tile.uiLayout.visible = false;
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