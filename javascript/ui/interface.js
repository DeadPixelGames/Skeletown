import { ColliderLayer } from "../collider.js";
import GameLoop from "../gameloop.js";
import GraphicsRenderer from "../graphics/graphicsrenderer.js";
/**Controlador de los colliders de la interfaz gráfica */
export default class Interface {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.colliders = new ColliderLayer();
        var that = this;
        /**Añadir a los colliders un evento de escucha de clicks */
        var listenerCallback = (e) => {
            if (e instanceof MouseEvent) {
                that.colliders.sendUserClick(e.clientX, e.clientY);
            }
            else if (e instanceof TouchEvent) {
                that.colliders.sendUserClick(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        document.addEventListener("mousedown", e => listenerCallback(e));
        document.addEventListener("touchstart", e => listenerCallback(e));
        GameLoop.instance.suscribe(this, null, this.update, null, null);
    }
    //#region GETTERS Y SETTERS
    getWidth() { return this.width; }
    getHeight() { return this.height; }
    getColliders() { return this.colliders; }
    setWidth(width) { this.width = width; }
    setHeight(height) { this.height = height; }
    //#endregion
    /**Añade un collider a la interfaz */
    addCollider(collider) {
        this.colliders.add(collider);
    }
    update(deltaTime) {
        this.colliders.render(GraphicsRenderer.instance.getCanvasContext());
    }
}
//# sourceMappingURL=interface.js.map