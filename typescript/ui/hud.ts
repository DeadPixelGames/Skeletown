import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import { UILayout, ProgressBar, UIEntity } from "./uiEntity.js";
import Interface, { enteringInventory } from "./interface.js";
import { BoxCollider, CircleCollider } from "../collider.js";
import FileLoader from "../fileloader.js";
import GameLoop from "../gameloop.js";
import AudioManager from "../audiomanager.js";


export class Hud {

    private hud_InGame :UILayout;
    public lifeBar :ProgressBar;
    private moneyCounter :UIEntity;
    private time :UIEntity;
    private inventory :UIEntity;

    public gold :number;


    private width :number;
    private height :number;

    private standardX :number;
    private standardY :number;
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
    public static initInstance(context :CanvasRenderingContext2D, standardX :number, standardY :number) {
        if(!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderer no se ha iniciado todavía. Por favor inicia GraphicsRenderer antes de instanciar Hud.");
        }
        var ret = new Hud();
        Hud.initSingleton(ret);
        ret.standardX = standardX;
        ret.standardY = standardY;

        
        return ret;
    }
    //#endregion



    private constructor(){
        this.width = GraphicsRenderer.instance.getCanvas().width;
        this.height = GraphicsRenderer.instance.getCanvas().height;
        this.hud_InGame = new UILayout(0, 0, this.width, this.height);

        this.gold = 0;

        this.moneyCounter = new UIEntity(true);
        this.time = new UIEntity(false);
        this.inventory = new UIEntity(true);

        this.lifeBar = new ProgressBar(this.width * 0.5 - 365, 33, 703, 128, true, (x :number, y :number)=>{
            //this.lifeBar.setProgress(this.lifeBar.getProgress()-10);
        });

        //#region Colliders

        this.moneyCounter.setCollider(true, 30, 32, 320, 91, (x :number, y :number)=>{

        });
        this.time.setCollider(true, this.width - 315, 15, 362, 128);
        this.inventory.setCollider(false, this.width - 205, this.height - 215, 245, 245,(x :number, y :number)=>{

            enteringInventory();
            //this.lifeBar.setProgress(this.lifeBar.getProgress()+10);
            if(AudioManager.instance.contextIsActive){
                AudioManager.instance.playSound("click");
            }
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
        this.setGoldText();
        var date = new Date();
        this.setTimeText("");
        GameLoop.instance.suscribe(this, null, this.update, null, null);
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

        var w = canvasWidth * 0.5;
        var h = canvasHeight * 0.5;
        this.hud_InGame.position.x = w - this.standardX * 0.5;
        this.hud_InGame.position.y = h - this.standardY * 0.5;
        for(let ent of this.hud_InGame.uiEntities){
            ent.x = this.hud_InGame.position.x + ent.getRelativePos().x;
            ent.y = this.hud_InGame.position.y + ent.getRelativePos().y;
        }

    }

    private update(deltaTime :number) {
        var date = new Date();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var separator = date.getSeconds() % 2 == 0 ? ":" : ".";

        this.setTimeText((hour < 10 ? "0" + hour : hour) + separator + (minute < 10 ? "0" + minute : minute));
        this.setGoldText();
    }

    private setTimeText(time :string) {
        this.time.setText(time, {x: 230, y: 80}, 45);
    }

    private setGoldText() {
        this.moneyCounter.setText(this.gold + "", {x: 250, y: 61}, 36);
    }
}