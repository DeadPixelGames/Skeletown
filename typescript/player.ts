import Entity from "./entity.js";
import Animation from "./animation.js"

export default class Player extends Entity{
    private width :number;
    private height :number;
    private mouse :boolean = false;
    private mouseEvent :MouseEvent; //Evento Actual de ratón
    private touchEvent :TouchEvent;
    //private walkRight :Animation;
    //private idle :Animation;

    /**
     * Constructor
     * @param canvas Elemento Lienzo de HTML
     * @param ctx Contexto del Lienzo de HTML
     * @param width Anchura del sprite del jugador
     * @param height Altura del sprite del jugador
     */
    constructor(canvas :HTMLCanvasElement, ctx :CanvasRenderingContext2D, width: number, height: number){
        super(canvas, ctx);
        this.width = width;
        this.height = height;
        
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
            that.dest = {"x" : that.x, "y" : that.y};
        })
        /**
         * Evento de dejar de pulsar la pantalla. Recibe el evento (del que se puede sacar luego la posición)
         * Se establece el estado de: "mouse" a false para que pare de moverse
         * Se establece el destino como la posición actual del jugador
         */
        canvas.addEventListener('touchend', function(e : TouchEvent){
            that.mouse = false;
            that.touchEvent = e;
            that.dest = {"x": that.x, "y": that.y};
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
    }
    //#region Getters y Setters
    public getWidth (){
        return this.width;
    }
    
    public getHeight(){
        return this.height;
    }

    public setWidth(width :number){
        this.width = width;
    }

    public setHeight(height :number){
        this.height = height;
    }
    //#endregion
    /**
     * Coge el rectángulo del canvas y calcula la posición del ratón en el canvas
     * Hace uso del MouseEvent
     */
    private getCursorPosition() {
        const rect = this.canvas.getBoundingClientRect()
        var x :number;
        var y :number;

        x = this.mouseEvent.clientX - rect.left
        y = this.mouseEvent.clientY - rect.top
        console.log("x: " + x + " y: " + y)
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
        x = this.touchEvent.touches[0].clientX - rect.left;
        y = this.touchEvent.touches[0].clientY - rect.top;

        return {"x": x, "y": y};
    }
    /**
     * Dibuja un rectángulo que representa al jugador en la posición del jugador
    */
    public render(){
        this.ctx.fillStyle = "#00FF88"
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    /**
     * Calcula el movimiento que se tiene que hacer en cada frame. 
     * Se calcula la distancia desde la posición hasta el destino y se normaliza el vector. Se multiplica por
     * la velocidad del jugador y se mueve la posición en esa cantidad.
     */
    public update(){
        var length = Math.sqrt(Math.pow(this.dest.x-this.x,2)+Math.pow(this.dest.y-this.y,2));
        if(length > this.speed){
            this.x += (this.dest.x-this.x)/length * this.speed;
            this.y += (this.dest.y-this.y)/length * this.speed;
        }   
    }
    /**
     * Genera un bucle en el que se va comprobando la posición del ratón y se estipula como destino del movimiento.
     * Después de 1 ms se vuelve a llamar al método si el ratón sigue pulsado.
     */
    public move(){
        if(this.mouse){
            this.dest = this.getCursorPosition();
            setTimeout(()=>this.move(),1);
        }else{
            return;}
        
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