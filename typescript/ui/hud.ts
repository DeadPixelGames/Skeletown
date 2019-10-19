import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import { UILayout, ProgressBar, UIEntity } from "./uiEntity.js";
import { enteringInventory, STANDARD_SCREEN_SIZE_X, STANDARD_SCREEN_SIZE_Y } from "../main.js";
import Interface from "./interface.js";
import { BoxCollider, CircleCollider } from "../collider.js";
import FileLoader from "../fileloader.js";


export class Hud{
    //#region Singleton
    private static _instance :Hud;

    /** La instancia única de esta clase singleton. */
    public static get instance() {
        return this._instance;
    }

    /** Inicia el patrón singleton, o lanza un error si ya hay otra instancia de esta clase en funcionamiento. */
    private static initSingleton(instance :Hud) {
        // Si la instancia singleton de esta clase ya es la actual, no hacemos nada
        if(Hud._instance == instance) {
            return;
        }
        // Pero si es otra, ha habido un problema y hay que lanzar un error
        if(Hud._instance) {
            throw new Error("Ya hay otra instancia de " + this.name + " en funcionamiento.");
        } else {
            // Y si no, es la primera vez que iniciamos este singleton y vamos a usar la instancia actual
            this._instance = instance;
        }
    }

    /**
     * Inicializa la instancia Singleton de `Hud` del programa y la asocia al contexto de canvas especificado.
     */
    public static initInstance(context :CanvasRenderingContext2D) {
        if(!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderes no se ha iniciado todavía. Por favor inicia GraphicsRenderer antes de instanciar Hud.");
        }
        var ret = new Hud();
        Hud.initSingleton(ret);
        return ret;
    }
    //#endregion

    private hud_InGame :UILayout;
    public lifeBar :ProgressBar;
    private moneyCounter :UIEntity;
    private time :UIEntity;
    private inventory :UIEntity;

    private width :number;
    private height :number;

    private constructor(){
        this.width = GraphicsRenderer.instance.getCanvas().width;
        this.height = GraphicsRenderer.instance.getCanvas().height;
        this.hud_InGame = new UILayout(0, 0, this.width, this.height);

        this.moneyCounter = new UIEntity(true);
        this.time = new UIEntity(false);
        this.inventory = new UIEntity(true);
        this.lifeBar = new ProgressBar(this.width * 0.5 - 351, 5, 703, 128, true, (x :number, y :number)=>{
            this.lifeBar.setProgress(this.lifeBar.getProgress()-10);
        });

        //#region Colliders
        this.moneyCounter.setCollider(true, 5, 5, 320, 91, (x :number, y :number)=>{

        });
        this.time.setCollider(true, this.width - 265, 5, 362, 128);
        this.inventory.setCollider(false, this.width - 245, this.height - 245, 245, 245,(x :number, y :number)=>{
            enteringInventory();
            this.lifeBar.setProgress(this.lifeBar.getProgress()+10);
        })


        Interface.instance.addCollider(this.lifeBar.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.moneyCounter.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.time.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.inventory.getCollider() as CircleCollider);
        
        //#endregion
        this.hud_InGame.addUIEntity(this.lifeBar);
        this.hud_InGame.addUIEntity(this.moneyCounter);
        this.hud_InGame.addUIEntity(this.time);
        this.hud_InGame.addUIEntity(this.inventory);

        this.initImages();


    }

    private async initImages(){
        this.lifeBar.setImage(true, 99, await FileLoader.loadImage("resources/interface/HUD_life3.png"), 0, 0, 768, 91, 768, 91);
        this.lifeBar.setIcon(true, 100, await FileLoader.loadImage("resources/interface/HUD_life1.png"), 0, 0, 768, 91, 768, 91);
        this.lifeBar.setProgressBar(true, 100, await FileLoader.loadImage("resources/interface/HUD_life2.png"), 0, 0, 768, 91, 768, 91);
        this.moneyCounter.setImage(true, 100, await FileLoader.loadImage("resources/interface/HUD_money.png"), 0, 0);
        this.time.setImage(true, 100, await FileLoader.loadImage("resources/interface/HUD_time.png"), 0, 0, 362, 128);
        this.inventory.setImage(true, 100, await FileLoader.loadImage("resources/interface/HUD_inventory.png"));
        
        this.hud_InGame.addEntitiesToRenderer();
        this.moneyCounter.setText("1283902", {x: 250, y: 65}, "45px");
        this.time.setText("10:21", {x: 145, y: 80}, "45px");
        this.deactivate();
        this.hide();
    }

    public activate(){
        this.hud_InGame.activate();
    }
    public deactivate(){
        this.hud_InGame.deactivate();
    }
    public show(){
        this.hud_InGame.show();
    }
    public hide(){
        this.hud_InGame.hide();
    }


    public resize(canvasWidth :number, canvasHeight :number){
        var w = canvasWidth * 0.5 / GraphicsRenderer.instance.scaleX;
        var h = canvasHeight * 0.5 / GraphicsRenderer.instance.scaleY;
        this.hud_InGame.position.x = w - STANDARD_SCREEN_SIZE_X * 0.5;
        this.hud_InGame.position.y = h - STANDARD_SCREEN_SIZE_Y * 0.5;
        for(let ent of this.hud_InGame.uiEntities){
            ent.x = this.hud_InGame.position.x + ent.getRelativePos().x;
            ent.y = this.hud_InGame.position.y + ent.getRelativePos().y;
        }
    }


}