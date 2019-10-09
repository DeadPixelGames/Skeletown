import GraphicEntity from "./graphics/graphicentity.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import GameLoop from "./gameloop.js";
/**
 * Distancia mínima a la que debe encontrarse el punto de destino para que la entidad se mueva hacia él
 */
const MIN_WALKABLE_DISTANCE = 20;
export default class Entity {
    /**
     * Constructor
     * @param canvas Elemento lienzo de HTML
     * @param ctx Contexto del lienzo del HTML
     */
    constructor() {
        this.canvas = GraphicsRenderer.instance.getCanvas();
        this.ctx = GraphicsRenderer.instance.getCanvasContext();
        this.speed = { x: 20, y: 20 };
        this.dest = null;
        this.isColliding = {
            left: false,
            right: false,
            top: false,
            bottom: false
        };
        GameLoop.instance.suscribe(this, null, this.update, null, null);
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
            this.collider.centerX = this.x + this.colliderOffset.x;
            this.collider.centerY = this.y + this.colliderOffset.y;
        }
    }
    syncImage() {
        this.image.x = this.x;
        this.image.y = this.y;
    }
    //#endregion
    update(deltaTime) {
        if (this.dest) {
            var length = Math.sqrt(Math.pow(this.dest.x - this.x, 2) + Math.pow(this.dest.y - this.y, 2));
            // He quitado esto temporalmente porque estas variables no se actualizan y eso interfiere con el movimiento
            //// if(this.isColliding.left || this.isColliding.right){
            ////     this.speed.x = 0;
            //// }else{
            ////     this.speed.x = PLAYER_SPEED;
            //// }
            //// if(this.isColliding.top || this.isColliding.bottom){
            ////     this.speed.y = 0;
            //// }else{
            ////     this.speed.y = PLAYER_SPEED;
            //// }
            if (length > MIN_WALKABLE_DISTANCE) {
                this.x += (this.dest.x - this.x) / length * this.speed.x * deltaTime;
                this.y += (this.dest.y - this.y) / length * this.speed.y * deltaTime;
            }
        }
        this.syncCollider();
        this.syncImage();
    }
    /**
     * Elimina las suscripciones a eventos y otras referencias que puedan impedir que la entidad, al
     * descartarse, pueda ser recogida por el recolector de basura.
     */
    dispose() {
        GameLoop.instance.unsuscribe(this, null, this.update, null, null);
    }
    /**
     * Dibuja información adicional sobre la entidad, útil para depurar el programa.
     */
    renderDebug(context, scrollX, scrollY) {
        /** Tamaño de la cruz que representa el punto de destino. */
        const DEST_CROSS_SIZE = 5;
        if (this.dest) {
            context.beginPath();
            context.strokeStyle = "#FFFFFF";
            context.moveTo(this.dest.x - scrollX, this.dest.y - scrollY - DEST_CROSS_SIZE);
            context.lineTo(this.dest.x - scrollX, this.dest.y - scrollY + DEST_CROSS_SIZE);
            context.moveTo(this.dest.x - scrollX - DEST_CROSS_SIZE, this.dest.y - scrollY);
            context.lineTo(this.dest.x - scrollX + DEST_CROSS_SIZE, this.dest.y - scrollY);
            context.stroke();
        }
    }
}
//# sourceMappingURL=entity.js.map