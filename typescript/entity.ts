import GraphicEntity from "./graphics/graphicentity.js";
import { Collider } from "./collider.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";

export default class Entity{

    protected dest :{
        x :number,
        y :number
    } | null;

    public canvas :HTMLCanvasElement;
    
    protected ctx :CanvasRenderingContext2D;

    public x :number;

    public y :number;

    protected speed :number;

    protected image :GraphicEntity;

    private collider? :Collider;
    
    private colliderOffset? :{
        x :number,
        y :number,
    }

    /**
     * Constructor
     * @param canvas Elemento lienzo de HTML
     * @param ctx Contexto del lienzo del HTML
     */
    constructor(canvas :HTMLCanvasElement, ctx :CanvasRenderingContext2D){
        this.canvas = canvas;
        this.ctx = ctx;
        this.speed = 20;
        this.dest = null;
        
    }
    
    //#region GETTERS Y SETTERS
    public getSpeed(){
        return this.speed;
    }

    public getCollider() {
        return this.collider;
    }

    public getImage() {
        return this.image;
    }

    public setCollider(collider :Collider, offset? :{x :number, y :number}) {
        this.collider = collider;
        if(offset) {
            this.colliderOffset = offset;
        } else {
            this.colliderOffset = {
                x: 0,
                y: 0
            };
        }
    }

    public setSpeed(speed :number){
        this.speed = speed;
    }

    public setImage(layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number) {
        this.image = new GraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
    }
    //#endregion

    //#region Sincronizar componentes
    public syncCollider() {
        if(this.collider && this.colliderOffset) {
            this.collider.centerX = this.image.x + this.colliderOffset.x;
            this.collider.centerY = this.image.y + this.colliderOffset.y;
        }
    }

    public syncImage() {
        this.image.x = this.x;
        this.image.y = this.y;
    }

    //#endregion

    
    public update() {
        this.syncCollider();
        this.syncImage();
    }
}