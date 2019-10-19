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
            var scaleX = GraphicsRenderer.instance.scaleX;
            var scaleY = GraphicsRenderer.instance.scaleY;
            
            if(e instanceof MouseEvent){
                that.colliders.sendUserClick(e.clientX / scaleX, e.clientY / scaleY);
            }else if(window.TouchEvent && e instanceof TouchEvent){
                that.colliders.sendUserClick(e.touches[0].clientX / scaleX, e.touches[0].clientY / scaleY);
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
    public static instance :InterfaceInWorld;

    private colliders :ColliderLayer;


    /**
     * Inicializa la instancia Singleton de `GraphicsRenderer` del programa y la asocia al contexto de canvas especificado.
     */
    public static initInstance() {
        if(!GraphicsRenderer.instance) {
            throw new Error("GameLoop no se ha iniciado todavía. Por favor inicia GameLoop antes de instanciar GraphicsRenderer.");
        }
        this.instance = new InterfaceInWorld();
    }

    private constructor(){
        this.colliders = new ColliderLayer();
        var that = this;
        /**Añadir a los colliders un evento de escucha de clicks */
        var listenerCallback = (e :MouseEvent | TouchEvent)=>{
            if(e instanceof MouseEvent){
                that.colliders.sendUserClick(e.clientX / GraphicsRenderer.instance.scaleX + GraphicsRenderer.instance.scrollX, e.clientY / GraphicsRenderer.instance.scaleY + GraphicsRenderer.instance.scrollY);
            }else if(window.TouchEvent && e instanceof TouchEvent){
                that.colliders.sendUserClick(e.touches[0].clientX / GraphicsRenderer.instance.scaleX + GraphicsRenderer.instance.scrollX, e.touches[0].clientY / GraphicsRenderer.instance.scaleY + GraphicsRenderer.instance.scrollY);
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