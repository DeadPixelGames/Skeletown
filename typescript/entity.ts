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

    protected speed :{
        x :number,
        y :number
    };

    protected image :GraphicEntity;

    private collider? :Collider;
    
    private colliderOffset? :{
        x :number,
        y :number,
    }

    public isColliding :{
        left :boolean,
        right :boolean,
        top :boolean,
        bottom :boolean};

    /**
     * Constructor
     * @param canvas Elemento lienzo de HTML
     * @param ctx Contexto del lienzo del HTML
     */
    constructor(canvas :HTMLCanvasElement, ctx :CanvasRenderingContext2D){
        this.canvas = canvas;
        this.ctx = ctx;
        this.speed = {x: 20, y: 20};
        this.dest = null;
        
        this.isColliding = {
            left: false,
            right: false,
            top: false,
            bottom: false
        }
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
        this.collider.entity = this;
        if(offset) {
            this.colliderOffset = offset;
            this.syncCollider();
        } else {
            this.colliderOffset = {
                x: 0,
                y: 0
            };
        }
    }

    public setSpeed(speed :{x :number, y :number}){
        this.speed = speed;
    }

    public setImage(layer :number, source :HTMLImageElement, sX? :number, sY? :number, sWidth? :number, sHeight? :number, pivotX? :number, pivotY? :number) {
        this.image = new GraphicEntity(layer, source, sX, sY, sWidth, sHeight, pivotX, pivotY);
        this.syncImage();
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

    public updateCollision(overlap :{x :number, y :number}){
        this.isColliding.left = overlap.x < 0;
        this.isColliding.right = overlap.x > 0;
        this.isColliding.top = overlap.y < 0;
        this.isColliding.bottom = overlap.y > 0;
        
    }
}