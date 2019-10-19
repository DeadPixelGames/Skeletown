import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import { UILayout, ProgressBar, UIEntity } from "./uiEntity.js";
import { enteringInventory, STANDARD_SCREEN_SIZE_X, STANDARD_SCREEN_SIZE_Y } from "../main.js";
import Interface from "./interface.js";
import { BoxCollider, CircleCollider } from "../collider.js";
import FileLoader from "../fileloader.js";
import { MaxScore } from "./maxscores.js";
import { GameOver } from "./gameover.js";


export class MainMenu {
    //#region Singleton
    private static _instance :MainMenu;

    /** La instancia única de esta clase singleton. */
    public static get instance() {
        return this._instance;
    }

    /** Inicia el patrón singleton, o lanza un error si ya hay otra instancia de esta clase en funcionamiento. */
    private static initSingleton(instance :MainMenu) {
        // Si la instancia singleton de esta clase ya es la actual, no hacemos nada
        if(MainMenu._instance == instance) {
            return;
        }
        // Pero si es otra, ha habido un problema y hay que lanzar un error
        if(MainMenu._instance) {
            throw new Error("Ya hay otra instancia de " + this.name + " en funcionamiento.");
        } else {
            // Y si no, es la primera vez que iniciamos este singleton y vamos a usar la instancia actual
            this._instance = instance;
        }
    }

    /**
     * Inicializa la instancia Singleton de `MainMenu` del programa y la asocia al contexto de canvas especificado.
     */
    public static initInstance(context :CanvasRenderingContext2D) {
        if(!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderes no se ha iniciado todavía. Por favor inicia GraphicsRenderer antes de instanciar MainMenu.");
        }
        var ret = new MainMenu();
        MainMenu.initSingleton(ret);
        return ret;
    }
    //#endregion
    private menu_layout :UILayout;
    private background :UIEntity;
    private settings :UIEntity;
    private play :UIEntity;
    private contact :UIEntity;
    private continue :UIEntity;
    private maxScore :UIEntity;

    private width :number;
    private height :number;


    private constructor(){
        this.width = GraphicsRenderer.instance.getCanvas().width;
        this.height = GraphicsRenderer.instance.getCanvas().height;

        this.menu_layout = new UILayout(0, 0, this.width, this.height);

        this.background = new UIEntity(false);
        this.settings = new UIEntity(true);
        this.play = new UIEntity(true);
        this.contact = new UIEntity(true);
        this.continue = new UIEntity(true);
        this.maxScore = new UIEntity(true);

        //#region Collider
        this.background.setCollider(true, 0, 0, this.width, this.height);
        this.settings.setCollider(true, 1189, 27, 130, 130, (x :number, y :number)=>{
            console.log("SETTINGS");
        })
        this.play.setCollider(true, 575, 522, 214, 119, (x :number, y :number)=>{
            console.log("PLAY");
        })
        this.contact.setCollider(true, 921, 519, 347, 119, (x :number, y :number)=>{
            console.log("CONTACT");
        })
        this.continue.setCollider(true, 121, 501, 284, 146, (x :number, y :number)=>{
            console.log("CONTINUE");
            this.deactivate();
            this.hide();
            GameOver.instance.activate();
            GameOver.instance.show();
        })
        this.maxScore.setCollider(true, 68, 77, 141, 200, (x :number, y :number)=>{
            console.log("MAXSCORE");
            MaxScore.instance.activate();
            MaxScore.instance.show();
            this.deactivate();
            this.hide();
        })


        Interface.instance.addCollider(this.settings.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.play.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.contact.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.continue.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.maxScore.getCollider() as BoxCollider);
        //#endregion

        this.menu_layout.addUIEntity(this.background);
        this.menu_layout.addUIEntity(this.settings);
        this.menu_layout.addUIEntity(this.play);
        this.menu_layout.addUIEntity(this.contact);
        this.menu_layout.addUIEntity(this.continue);
        this.menu_layout.addUIEntity(this.maxScore);

        this.initImage();

    }

    private async initImage(){
        this.background.setImage(true, 99, await FileLoader.loadImage("resources/interface/menu/base.png"));
        this.settings.setImage(true, 100, await FileLoader.loadImage("resources/interface/menu/ajustes.png"), 1189, 27, 130, 130);
        this.play.setImage(true, 100, await FileLoader.loadImage("resources/interface/menu/jugar.png"), 575, 522, 214, 119);
        this.contact.setImage(true, 100, await FileLoader.loadImage("resources/interface/menu/contactar.png"), 921, 519, 347, 119);
        this.continue.setImage(true, 100, await FileLoader.loadImage("resources/interface/menu/continuar.png"), 121, 501, 284, 146);
        this.maxScore.setImage(true, 100, await FileLoader.loadImage("resources/interface/menu/max_scores.png"), 68, 77, 141, 200);

        this.menu_layout.addEntitiesToRenderer();

        this.deactivate();
        this.hide();
    }

    public activate(){
        this.menu_layout.activate();
    }
    public deactivate(){
        this.menu_layout.deactivate();
    }
    public show(){
        this.menu_layout.show();
    }
    public hide(){
        this.menu_layout.hide();
    }

    public resize(canvasWidth :number, canvasHeight :number){
        var w = canvasWidth * 0.5 / GraphicsRenderer.instance.scaleX;
        var h = canvasHeight * 0.5 / GraphicsRenderer.instance.scaleY;
        this.menu_layout.position.x = w - STANDARD_SCREEN_SIZE_X * 0.5;
        this.menu_layout.position.y = h - STANDARD_SCREEN_SIZE_Y * 0.5;
        for(let ent of this.menu_layout.uiEntities){
            ent.x = this.menu_layout.position.x + ent.getRelativePos().x;
            ent.y = this.menu_layout.position.y + ent.getRelativePos().y;
        }
    }

}