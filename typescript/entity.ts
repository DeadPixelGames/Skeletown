export default class Entity{
    protected x :number;
    protected y :number;

    protected dest = {"x":0, "y":0};

    public canvas :HTMLCanvasElement;
    protected ctx :CanvasRenderingContext2D;

    protected speed :number;

    private image :string;

    /**
     * Constructor
     * @param canvas Elemento lienzo de HTML
     * @param ctx Contexto del lienzo del HTML
     */
    constructor(canvas :HTMLCanvasElement, ctx :CanvasRenderingContext2D){
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = 0;
        this.y = 0;
        this.speed = 5;
        this.dest.x = this.x;
        this.dest.y = this.y;
    }
    
    //#region GETTERS Y SETTERS
    public getX () {
        return this.x;
    }

    public getY(){
        return this.y;
    }

    public getSpeed(){
        return this.speed;
    }

    public getImage(){
        return this.image;
    }

    public setX(x :number){
        this.x = x;
    }

    public setY(y :number){
        this.y = y;
    }

    public setSpeed(speed :number){
        this.speed = speed;
    }

    public setImage(image :string){
        this.image = image;
    }
    //#endregion
    

}