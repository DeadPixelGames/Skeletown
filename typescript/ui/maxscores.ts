import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import { UILayout, ProgressBar, UIEntity } from "./uiEntity.js";
import { enteringInventory, STANDARD_SCREEN_SIZE_X, STANDARD_SCREEN_SIZE_Y } from "../main.js";
import Interface from "./interface.js";
import { BoxCollider, CircleCollider } from "../collider.js";
import FileLoader from "../fileloader.js";
import { MainMenu } from "./mainmenu.js";

export class MaxScore{
    //#region Singleton
    private static _instance :MaxScore;

    /** La instancia única de esta clase singleton. */
    public static get instance() {
        return this._instance;
    }

    /** Inicia el patrón singleton, o lanza un error si ya hay otra instancia de esta clase en funcionamiento. */
    private static initSingleton(instance :MaxScore) {
        // Si la instancia singleton de esta clase ya es la actual, no hacemos nada
        if(MaxScore._instance == instance) {
            return;
        }
        // Pero si es otra, ha habido un problema y hay que lanzar un error
        if(MaxScore._instance) {
            throw new Error("Ya hay otra instancia de " + this.name + " en funcionamiento.");
        } else {
            // Y si no, es la primera vez que iniciamos este singleton y vamos a usar la instancia actual
            this._instance = instance;
        }
    }

    /**
     * Inicializa la instancia Singleton de `MaxScore` del programa y la asocia al contexto de canvas especificado.
     */
    public static initInstance(context :CanvasRenderingContext2D) {
        if(!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderes no se ha iniciado todavía. Por favor inicia GraphicsRenderer antes de instanciar MaxScore.");
        }
        var ret = new MaxScore();
        MaxScore.initSingleton(ret);
        return ret;
    }
    //#endregion


    private maxScore_layout :UILayout;
    private background :UIEntity;
    private back :UIEntity;

    private width :number;
    private height :number;

    private constructor(){
        this.width = GraphicsRenderer.instance.getCanvas().width;
        this.height = GraphicsRenderer.instance.getCanvas().height;

        this.maxScore_layout = new UILayout(0, 0, this.width, this.height);

        this.background = new UIEntity(false);
        this.back = new UIEntity(true);

        //#region Colliders
        this.background.setCollider(true, 0, 0, this.width, this.height);
        this.back.setCollider(true, 63, 67, 125, 117, (x, y)=>{
            MainMenu.instance.show();
            MainMenu.instance.activate();
            this.deactivate();
            this.hide();
        })
        
        
        Interface.instance.addCollider(this.back.getCollider() as BoxCollider);
        //#endregion

        this.maxScore_layout.addUIEntity(this.background);
        this.maxScore_layout.addUIEntity(this.back);

        this.initImages();
        
    }

    private async initImages(){
        this.background.setImage(true, 99, await FileLoader.loadImage("resources/interface/menu/max_scores_page.png"));
        this.back.setImage(true, 100, await FileLoader.loadImage("resources/interface/menu/max_scores_button.png"), 63, 67, 125, 117);

        this.maxScore_layout.addEntitiesToRenderer();

        this.deactivate();
        this.hide();
    }

    public activate(){
        this.maxScore_layout.activate();
    }
    public deactivate(){
        this.maxScore_layout.deactivate();
    }
    public show(){
        this.maxScore_layout.show();
    }
    public hide(){
        this.maxScore_layout.hide();
    }

    public resize(canvasWidth :number, canvasHeight :number){
        var w = canvasWidth * 0.5 / GraphicsRenderer.instance.scaleX;
        var h = canvasHeight * 0.5 / GraphicsRenderer.instance.scaleY;
        this.maxScore_layout.position.x = w - STANDARD_SCREEN_SIZE_X * 0.5;
        this.maxScore_layout.position.y = h - STANDARD_SCREEN_SIZE_Y * 0.5;
        for(let ent of this.maxScore_layout.uiEntities){
            ent.x = this.maxScore_layout.position.x + ent.getRelativePos().x;
            ent.y = this.maxScore_layout.position.y + ent.getRelativePos().y;
        }
    }
}