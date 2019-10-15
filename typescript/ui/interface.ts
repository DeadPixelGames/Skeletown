import { ColliderLayer, Collider } from "../collider.js";
import GameLoop from "../gameloop.js";
import GraphicsRenderer from "../graphics/graphicsrenderer.js";

/**Controlador de los colliders de la interfaz gráfica en coordenadas del canvas*/
export default class Interface{
    /**Instancia de la interfaz. SINGLETON */
    public static instance  = new Interface();

    private colliders :ColliderLayer;


    private constructor(){

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
    public getColliders(){return this.colliders;}

    //#endregion

    /**Añade un collider a la interfaz */
    public addCollider(collider :Collider){
        this.colliders.add(collider);
    }


}

/**Controlador de los colliders de la interfaz gráfica en coordenadas del mundo */
export class InterfaceInWorld{
    /**Instancia de la interfaz. SINGLETON */
    public static instance = new InterfaceInWorld();

    private colliders :ColliderLayer;

    private constructor(){
        this.colliders = new ColliderLayer();
        var that = this;
        /**Añadir a los colliders un evento de escucha de clicks */
        var listenerCallback = (e :MouseEvent | TouchEvent)=>{
            if(e instanceof MouseEvent){
                that.colliders.sendUserClick(e.clientX + GraphicsRenderer.instance.scrollX, e.clientY + GraphicsRenderer.instance.scrollY);
            }else if(window.TouchEvent && e instanceof TouchEvent){
                that.colliders.sendUserClick(e.touches[0].clientX + GraphicsRenderer.instance.scrollX, e.touches[0].clientY + GraphicsRenderer.instance.scrollY);
            }
        };

        document.addEventListener("mousedown", e => listenerCallback(e));
        document.addEventListener("touchstart", e => listenerCallback(e));       
    }

    //#region GETTERS Y SETTERS
    public getColliders(){return this.colliders;}

    //#endregion

    /**Añade un collider a la interfaz */
    public addCollider(collider :Collider){
        this.colliders.add(collider);
    }
}