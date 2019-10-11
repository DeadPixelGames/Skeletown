import { ColliderLayer } from "../collider.js";
export default class Interface {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.colliders = new ColliderLayer();
        var that = this;
        var listenerCallback = (e) => {
            if (e instanceof MouseEvent) {
                console.log("CLICK");
                that.colliders.sendUserClick(e.clientX, e.clientY);
            }
            else if (e instanceof TouchEvent) {
                that.colliders.sendUserClick(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        document.addEventListener("mousedown", e => listenerCallback(e));
        document.addEventListener("touchstart", e => listenerCallback(e));
    }
    //#region GETTERS Y SETTERS
    getWidth() { return this.width; }
    getHeight() { return this.height; }
    getColliders() { return this.colliders; }
    setWidth(width) { this.width = width; }
    setHeight(height) { this.height = height; }
    //#endregion
    addCollider(collider) {
        this.colliders.add(collider);
    }
}
//# sourceMappingURL=interface.js.map