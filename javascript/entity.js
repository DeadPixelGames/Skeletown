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
        this.speed = { x: 20, y: 20 };
        this.dest = null;
        this.isColliding = {
            left: false,
            right: false,
            top: false,
            bottom: false
        };
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
        this.collider.entity = this;
        if (offset) {
            this.colliderOffset = offset;
            this.syncCollider();
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
        this.syncImage();
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
    updateCollision(overlap) {
        this.isColliding.left = overlap.x < 0;
        this.isColliding.right = overlap.x > 0;
        this.isColliding.top = overlap.y < 0;
        this.isColliding.bottom = overlap.y > 0;
    }
}
//# sourceMappingURL=entity.js.map