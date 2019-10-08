import GraphicEntity from "./graphics/graphicentity.js";
import { Collider } from "./collider.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import GameLoop from "./gameloop.js";

/**
 * Distancia mínima a la que debe encontrarse el punto de destino para que la entidad se mueva hacia él
 */
const MIN_WALKABLE_DISTANCE = 20;

export default class Entity{

    protected dest :{
        x :number,
        y :number
    } | null;

    protected canvas :HTMLCanvasElement;
    
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
    constructor(){
        this.canvas = GraphicsRenderer.instance.getCanvas();
        this.ctx = GraphicsRenderer.instance.getCanvasContext();
        this.speed = {x: 20, y: 20};
        this.dest = null;
        
        this.isColliding = {
            left: false,
            right: false,
            top: false,
            bottom: false
        }

        GameLoop.instance.suscribe(this, null, this.update, null, null);
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
    
    protected update(deltaTime :number) {
        this.syncCollider();
        this.syncImage();

        if(this.dest) {
            var length = Math.sqrt(Math.pow(this.dest.x-this.x,2)+Math.pow(this.dest.y-this.y,2));
            
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

            if(length > MIN_WALKABLE_DISTANCE) {
                this.x += (this.dest.x-this.x)/length * this.speed.x * deltaTime;
                this.y += (this.dest.y-this.y)/length * this.speed.y * deltaTime;
            } 
        }
    }

    //// public updateCollision(overlap :{x :number, y :number}){
    ////     this.isColliding.left = overlap.x < 0;
    ////     this.isColliding.right = overlap.x > 0;
    ////     this.isColliding.top = overlap.y < 0;
    ////     this.isColliding.bottom = overlap.y > 0;
    //// }
}