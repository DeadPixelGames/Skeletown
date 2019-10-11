import Entity from "./entity.js";
import GraphicEntity from "./graphics/graphicentity.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";

const PLAYER_SPEED = 20;

/**
 * Clase que representa al jugador
 */
export default class Player extends Entity{
    /** true si está activo el movimiento del personaje */
    private mouse :boolean = false;
    /**Evento actual del ratón */
    private mouseEvent :MouseEvent;
    /** Evento actual de la pulsación */
    private touchEvent :TouchEvent;


    /**
     * Constructor
     * @param canvas Elemento Lienzo de HTML
     * @param ctx Contexto del Lienzo de HTML
     * @param width Anchura del sprite del jugador
     * @param height Altura del sprite del jugador
     */
    constructor(canvas :HTMLCanvasElement, ctx :CanvasRenderingContext2D){
        /**
         * Llamada al constructor del padre (Entity)
         */
        super(canvas, ctx);
        var that = this;

        /**
         * Evento de clicar. Recibe el evento (del que se puede sacar luego la posición)
         * Se establece el estado de: "mouse" que significa que el jugador se tiene que mover
         * Se guarda el evento
         * Se llama al cálculo del destino según la posición del ratón
         */
        canvas.addEventListener('mousedown', function(e :MouseEvent) {
            that.mouse = true;
            that.mouseEvent = e;
            that.move();
            
        })
        //#region Eventos de ratón y pulsación
        /**
         * Evento de pulsar la pantalla. Recibe el evento (del que se puede sacar luego la posición)
         * Se establece el estado de: "mouse" que significa que el jugador se tiene que mover
         * Se guarda el evento
         * Se llama al cálculo del destino según la posición del ratón
         */
        canvas.addEventListener('touchstart', (e :TouchEvent)=>{
            that.mouse = true;
            that.touchEvent = e;
            that.touchMove();
        })
        /**
         * Evento de dejar de clicar. Recibe el evento (del que se puede sacar luego la posición)
         * Se establece el estado de: "mouse" a false para que pare de moverse
         * Se establece el destino como la posición actual del jugador
         */
        canvas.addEventListener('mouseup', function(e : MouseEvent){
            that.mouse = false;
            that.mouseEvent = e;
            that.dest = {"x" : that.image.x, "y" : that.image.y};
        })
        /**
         * Evento de dejar de pulsar la pantalla. Recibe el evento (del que se puede sacar luego la posición)
         * Se establece el estado de: "mouse" a false para que pare de moverse
         * Se establece el destino como la posición actual del jugador
         */
        canvas.addEventListener('touchend', function(e : TouchEvent){
            that.mouse = false;
            that.touchEvent = e;
            that.dest = {"x": that.image.x, "y": that.image.y};
        })
        /**
         * Evento de mover el ratón.
         * Se guarda el evento para actualizar la posición del ratón
         */
        canvas.addEventListener('mousemove', function(e :MouseEvent){
            that.mouseEvent = e;
        })
        /**
         * Evento de mover el dedo por la pantalla
         * Se guarda el evento para actualizar la posición del pulso
         */
        canvas.addEventListener('touchmove', function(e :TouchEvent){
            that.touchEvent = e;
        })
        //#endregion
    }

    /**
     * Coge el rectángulo del canvas y calcula la posición del ratón en el canvas
     * Hace uso del MouseEvent
     */
    private getCursorPosition() {
        const rect = this.canvas.getBoundingClientRect()
        var x :number;
        var y :number;

        x = this.mouseEvent.clientX - rect.left + GraphicsRenderer.instance.scrollX;
        y = this.mouseEvent.clientY - rect.top + GraphicsRenderer.instance.scrollY;
        //// console.log("x: " + x + " y: " + y);
        return {"x" : x, "y" : y}
    }
    /**
     * Coge el rectángulo del canvas y calcula la posición del dedo en el canvas
     * Hace uso del TouchEvent
     */
    private getTouchPosition(){
        const rect = this.canvas.getBoundingClientRect();
        var x :number;
        var y :number;
        x = this.touchEvent.touches[0].clientX - rect.left - GraphicsRenderer.instance.scrollX;
        y = this.touchEvent.touches[0].clientY - rect.top - GraphicsRenderer.instance.scrollY;

        return {"x": x, "y": y};
    }
    /**
     * Calcula el movimiento que se tiene que hacer en cada frame. 
     * Se calcula la distancia desde la posición hasta el destino y se normaliza el vector. Se multiplica por
     * la velocidad del jugador y se mueve la posición en esa cantidad.
     */
    public update(){
        
        if(!this.mouse) {
            this.dest = null;
        }

        this.speed.x = PLAYER_SPEED;
        this.speed.y = PLAYER_SPEED;

        super.update();
    }

    // TODO Revisar esto cuando se implemente el Game loop
    
    /**
     * Genera un bucle en el que se va comprobando la posición del ratón y se estipula como destino del movimiento.
     * Después de 1 ms se vuelve a llamar al método si el ratón sigue pulsado.
     */
    public move(){
        if(this.mouse){
            this.dest = this.getCursorPosition();
            setTimeout(()=>this.move(),1);
        }else{
            return;
        }
        
    }
    /**
     * Genera un bucle en el que se va comprobando la posición del dedo y se estipula como destino del movimiento.
     * Después de 1 ms se vuelve a llamar al método si el ratón sigue pulsado.
     */
    public touchMove(){
        if(this.mouse){
            this.dest = this.getTouchPosition();
            setTimeout(()=>this.touchMove(),1);
        }
        else{
            return;
        }
    }

}