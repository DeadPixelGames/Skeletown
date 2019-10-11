import GraphicEntity from "./graphics/graphicentity.js";
import { Collider, ColliderLayer } from "./collider.js";

const STEP_COLLISION_FACTOR = 0.25;

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

    private colliderLayer? :ColliderLayer;
    
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

    public getColliderLayer() {
        return this.colliderLayer;
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

    public setColliderLayer(layer :ColliderLayer) {
        this.colliderLayer = layer;
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
            this.collider.centerX = this.x + this.colliderOffset.x;
            this.collider.centerY = this.y + this.colliderOffset.y;
        }
    }

    public syncImage() {
        this.image.x = this.x;
        this.image.y = this.y;
    }

    //#endregion

    
    public update() {
        if(this.dest){
            var length = Math.sqrt(Math.pow(this.dest.x-this.x,2)+Math.pow(this.dest.y-this.y,2));

            if(length > this.speed.x) {
                var nextStep = this.findNextStep((this.dest.x - this.x) / length * this.speed.x, (this.dest.y - this.y) / length * this.speed.y);
                this.x += nextStep.x;
                this.y += nextStep.y;
            } 
        }

        this.syncCollider();
        this.syncImage();
    }

    public updateCollision(overlap :{x :number, y :number}){
        this.isColliding.left = overlap.x < 0;
        this.isColliding.right = overlap.x > 0;
        this.isColliding.top = overlap.y < 0;
        this.isColliding.bottom = overlap.y > 0;   
    }

    /** 
     * Determina si puede mover sus coordenadas en la medida que indican los parámetros, o si por el contrario las
     * colisiones impiden que pueda llegar tan lejos. Devuelve un objeto `{x, y}` que indica el incremento que se
     * puede usar, basándose en `intendedX` e `intendedY`, pero reducido para evitar colisiones.
     */
    private findNextStep(intendedX :number, intendedY :number) {
        // Si no hay colisiones no hace falta evitarlas
        if(!this.collider || !this.colliderLayer) {
            return {x: intendedX, y: intendedY};
        }

        // La idea es asumir que, en principio, sí que se puede tomar el incremento indicado. Si detectamos una colisión
        // en el punto resultante del incremento, entonces retrocedemos lo indicado por STEP_COLLISION_FACTOR, y volvemos
        // a comprobar las colisiones. Repetiremos este proceso tres veces: Una para los dos ejes a la vez, y luego una
        // vez por cada eje. Esto último es para impedir que un obstáculo en un eje detenga el movimiento en ambos ejes

        var colliderOffsetX = this.colliderOffset ? this.colliderOffset.x : 0;
        var colliderOffsetY = this.colliderOffset ? this.colliderOffset.y : 0;
        // El incremento que estamos comprobando es, incialmente, el indicado por parámetros
        var currentX = intendedX;
        var currentY = intendedY;
        // Estas variables indican los ejes en los que está permitido calcular el incremento en cada momento
        var favoredX = 1;
        var favoredY = 1;
        // Este contador se asegura de que el siguiente bucle no pueda ser infinito. En cada iteración se le irá sumando
        // el valor de STEP_COLLISION_FACTOR y, al llegar a 1, el bucle se considera completo
        var counter = 0;
        
        for(let i = 0; i < 3; i++) {
            // Determinamos qué ejes usaremos para calcular el incremento en cada iteración. Si está desactivado
            // en una iteración (favored = 0), se quedará "congelado" y el valor determinado por iteraciones anteriores
            // no se modificará
            favoredX = i == 0 || i == 1 ? 1 : 0;
            favoredY = i == 0 || i == 2 ? 1 : 0;

            // Los ejes que estamos calculando en esta iteración pueden partir, de nuevo, del incremento indicado
            // en los parámetros del método
            if(favoredX) currentX = intendedX;
            if(favoredY) currentY = intendedY;

            // Iteramos hasta que la acumulación de STEP_COLLISION_FACTOR llegue a la unidad
            while(counter < 1) {
                // Si el incremento que hemos comprobado ya no tiene colisión, es suficiente para este eje
                if(!this.collider.wouldCollideAt(this.colliderLayer, this.x + colliderOffsetX + currentX, this.y + colliderOffsetY + currentY)) {
                    break;
                }

                // Reducimos en STEP_COLLISION_FACTOR los ejes que estemos usando en esta iteración
                currentX = Math.sign(currentX) * Math.max(0, Math.abs(currentX - intendedX * STEP_COLLISION_FACTOR * favoredX));
                currentY = Math.sign(currentY) * Math.max(0, Math.abs(currentY - intendedY * STEP_COLLISION_FACTOR * favoredY));
    
                // Añadimos lo reducido al contador
                counter += STEP_COLLISION_FACTOR;
            }

            // Reiniciamos el contador para la siguiente iteración
            counter = 0;
        }

        // Devolvemos el incremento determinado
        return {x: currentX, y: currentY};
    }
}