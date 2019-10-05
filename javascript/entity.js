export default class Entity {
    /**
     * Constructor
     * @param canvas Elemento lienzo de HTML
     * @param ctx Contexto del lienzo del HTML
     */
    constructor(canvas, ctx) {
        this.dest = { "x": 0, "y": 0 };
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = 0;
        this.y = 0;
        this.speed = 5;
        this.dest.x = this.x;
        this.dest.y = this.y;
    }
    //#region GETTERS Y SETTERS
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getSpeed() {
        return this.speed;
    }
    getImage() {
        return this.image;
    }
    setX(x) {
        this.x = x;
    }
    setY(y) {
        this.y = y;
    }
    setSpeed(speed) {
        this.speed = speed;
    }
    setImage(image) {
        this.image = image;
    }
}
//# sourceMappingURL=entity.js.map