import { ColliderLayer } from "../collider.js";
import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import { Inventory } from "../inventory.js";
import { Hud } from "./hud.js";
import { FarmlandManager } from "../farmland.js";
/**Controlador de los colliders de la interfaz gráfica en coordenadas del canvas*/
export default class Interface {
    constructor() {
        this.colliders = new ColliderLayer();
        var that = this;
        /**Añadir a los colliders un evento de escucha de clicks */
        var listenerCallback = (e) => {
            var scaleX = GraphicsRenderer.instance.scaleX;
            var scaleY = GraphicsRenderer.instance.scaleY;
            if (e instanceof MouseEvent) {
                that.colliders.sendUserClick(e.clientX / scaleX, e.clientY / scaleY);
            }
            else if (window.TouchEvent && e instanceof TouchEvent) {
                that.colliders.sendUserClick(e.touches[0].clientX / scaleX, e.touches[0].clientY / scaleY);
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
/**Instancia de la interfaz. SINGLETON */
Interface.instance = new Interface();
/**Controlador de los colliders de la interfaz gráfica en coordenadas del mundo */
export class InterfaceInWorld {
    constructor() {
        this.colliders = new ColliderLayer();
        var that = this;
        /**Añadir a los colliders un evento de escucha de clicks */
        var listenerCallback = (e) => {
            if (e instanceof MouseEvent) {
                that.colliders.sendUserClick(e.clientX / GraphicsRenderer.instance.scaleX + GraphicsRenderer.instance.scrollX, e.clientY / GraphicsRenderer.instance.scaleY + GraphicsRenderer.instance.scrollY);
            }
            else if (window.TouchEvent && e instanceof TouchEvent) {
                that.colliders.sendUserClick(e.touches[0].clientX / GraphicsRenderer.instance.scaleX + GraphicsRenderer.instance.scrollX, e.touches[0].clientY / GraphicsRenderer.instance.scaleY + GraphicsRenderer.instance.scrollY);
            }
        };
        document.addEventListener("mousedown", e => listenerCallback(e));
        document.addEventListener("touchstart", e => listenerCallback(e));
    }
    /**
     * Inicializa la instancia Singleton de `GraphicsRenderer` del programa y la asocia al contexto de canvas especificado.
     */
    static initInstance() {
        if (!GraphicsRenderer.instance) {
            throw new Error("GameLoop no se ha iniciado todavía. Por favor inicia GameLoop antes de instanciar GraphicsRenderer.");
        }
        this.instance = new InterfaceInWorld();
    }
    //#region GETTERS Y SETTERS
    getColliders() { return this.colliders; }
    //#endregion
    /**Añade un collider a la interfaz */
    addCollider(collider) {
        this.colliders.add(collider);
    }
}
//#region Inventario
export function enteringInventory() {
    Inventory.instance.activate();
    Inventory.instance.show();
    Hud.instance.deactivate();
    FarmlandManager.instance.deactivate();
}
export function exitingInventory() {
    Inventory.instance.deactivate();
    Inventory.instance.hide();
    Hud.instance.activate();
    FarmlandManager.instance.activate();
}
export function enteringInventoryFromCrops(tile) {
    Inventory.instance.togglePlanting(tile);
    Inventory.instance.show();
    Hud.instance.deactivate();
    FarmlandManager.instance.deactivate();
}
//#endregion
//# sourceMappingURL=interface.js.map