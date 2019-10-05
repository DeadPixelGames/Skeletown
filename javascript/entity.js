import GraphicEntity from "./graphics/graphicentity.js";
export default class Entity {
    /**
     * Constructor
     * @param canvas Elemento lienzo de HTML
     * @param ctx Contexto del lienzo del HTML
     */
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.speed = 20;
        this.dest = null;
    }
    //#region GETTERS Y SETTERS
    getSpeed() {
        return this.speed;
    }
    getCollider() {
        return this.collider;
    }
    getImage() {
        return this.image;
    }
    setCollider(collider, offset) {
        this.collider = collider;
        if (offset) {
            this.colliderOffset = offset;
        }
        else {
            this.colliderOffset = {
                x: 0,
                y: 0
            };
        }
    }
    setSpeed(speed) {
        this.speed = speed;
    }
    setImage(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY) {
        this.image = new GraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
    }
    //#endregion
    //#region Sincronizar componentes
    syncCollider() {
        if (this.collider && this.colliderOffset) {
            this.collider.centerX = this.image.x + this.colliderOffset.x;
            this.collider.centerY = this.image.y + this.colliderOffset.y;
        }
    }
    syncImage() {
        this.image.x = this.x;
        this.image.y = this.y;
    }
    //#endregion
    update() {
        this.syncCollider();
        this.syncImage();
    }
}
//# sourceMappingURL=entity.js.map