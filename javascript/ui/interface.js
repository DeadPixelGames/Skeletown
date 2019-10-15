import { ColliderLayer } from "../collider.js";
import GraphicsRenderer from "../graphics/graphicsrenderer.js";
/**Controlador de los colliders de la interfaz gráfica */
export default class Interface {
    constructor() {
        this.colliders = new ColliderLayer();
        var that = this;
        /**Añadir a los colliders un evento de escucha de clicks */
        var listenerCallback = (e) => {
            if (e instanceof MouseEvent) {
                that.colliders.sendUserClick(e.clientX, e.clientY);
            }
            else if (window.TouchEvent && e instanceof TouchEvent) {
                that.colliders.sendUserClick(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        document.addEventListener("mousedown", e => listenerCallback(e));
        document.addEventListener("touchstart", e => listenerCallback(e));
    }
    //#region GETTERS Y SETTERS
    getColliders() { return this.colliders; }
    //#endregion
    /**Añade un collider a la interfaz */
    addCollider(collider) {
        this.colliders.add(collider);
    }
}
Interface.instance = new Interface();
export class InterfaceInWorld {
    constructor() {
        this.colliders = new ColliderLayer();
        var that = this;
        /**Añadir a los colliders un evento de escucha de clicks */
        var listenerCallback = (e) => {
            if (e instanceof MouseEvent) {
                that.colliders.sendUserClick(e.clientX + GraphicsRenderer.instance.scrollX, e.clientY + GraphicsRenderer.instance.scrollY);
            }
            else if (window.TouchEvent && e instanceof TouchEvent) {
                that.colliders.sendUserClick(e.touches[0].clientX + GraphicsRenderer.instance.scrollX, e.touches[0].clientY + GraphicsRenderer.instance.scrollY);
            }
        };
        document.addEventListener("mousedown", e => listenerCallback(e));
        document.addEventListener("touchstart", e => listenerCallback(e));
    }
    //#region GETTERS Y SETTERS
    getColliders() { return this.colliders; }
    //#endregion
    /**Añade un collider a la interfaz */
    addCollider(collider) {
        this.colliders.add(collider);
    }
}
InterfaceInWorld.instance = new InterfaceInWorld();
//# sourceMappingURL=interface.js.map