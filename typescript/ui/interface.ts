import { ColliderLayer, Collider } from "../collider.js";
import GameLoop from "../gameloop.js";
import GraphicsRenderer from "../graphics/graphicsrenderer.js";

/**Controlador de los colliders de la interfaz gráfica */
export default class Interface{
    private width :number;

    private height :number;

    private colliders :ColliderLayer;


    constructor(width :number, height :number){
        this.width = width;
        this.height = height;
        this.colliders = new ColliderLayer();
        var that = this;
        /**Añadir a los colliders un evento de escucha de clicks */
        var listenerCallback = (e :MouseEvent | TouchEvent)=>{
            if(e instanceof MouseEvent){
                that.colliders.sendUserClick(e.clientX, e.clientY);
            }else if(window.TouchEvent && e instanceof TouchEvent){
                that.colliders.sendUserClick(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        document.addEventListener("mousedown", e => listenerCallback(e));
        document.addEventListener("touchstart", e => listenerCallback(e));

       
    }

    //#region GETTERS Y SETTERS
    public getWidth(){return this.width;}
    public getHeight(){return this.height;}
    public getColliders(){return this.colliders;}

    public setWidth(width :number){this.width = width;}
    public setHeight(height :number){this.height = height;}
    //#endregion

    /**Añade un collider a la interfaz */
    public addCollider(collider :Collider){
        this.colliders.add(collider);
    }


}