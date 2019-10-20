import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import { UILayout, ProgressBar, UIEntity } from "./uiEntity.js";
import Interface from "./interface.js";
import { BoxCollider, CircleCollider } from "../collider.js";
import FileLoader from "../fileloader.js";
import { MaxScore } from "./maxscores.js";
import { GameOver } from "./gameover.js";
import loadWorld from "../worldload.js";
import { Hud } from "./hud.js";
import AnimatedGraphicEntity from "../graphics/animatedgraphicentity.js";
import { sleep } from "../util.js";
import AboutUs from "./aboutus.js";


export class MainMenu {

    private menu_layout :UILayout;
    private background :UIEntity;
    private settings :UIEntity;
    private play :UIEntity;
    private contact :UIEntity;
    private continue :UIEntity;
    private maxScore :UIEntity;

    private width :number;
    private height :number;

    private standardX :number;
    private standardY :number;

    private backgrounds :string[] = ["resources/interface/menu/base_orange.png", "resources/interface/menu/base_blue.png"]
    private currentBg :number = 0;

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
    public static initInstance(context :CanvasRenderingContext2D, standardX :number, standardY :number) {
        if(!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderes no se ha iniciado todavía. Por favor inicia GraphicsRenderer antes de instanciar MainMenu.");
        }
        var ret = new MainMenu();
        MainMenu.initSingleton(ret);
        ret.standardX = standardX;
        ret.standardY = standardY;
        return ret;
    }
    //#endregion


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
        this.settings.setCollider(true, 1737, 49, 149, 149,  async (x :number, y :number)=>{
            console.log("SETTINGS");
            if(this.currentBg >= this.backgrounds.length - 1){
                this.currentBg = 0;
            }else{
                this.currentBg++;
            }
            this.background.image.sourceElement = await FileLoader.loadImage(this.backgrounds[this.currentBg])

        })
        this.play.setCollider(true, 830, 750, 345, 205, (x :number, y :number)=>{
            console.log("PLAY");
            GraphicsRenderer.instance.fadeOutAndIn(0.5, async () => {
                this.deactivate();
                this.hide();
                await loadWorld();
                Hud.instance.activate();
                Hud.instance.show();
            });
        })
        this.contact.setCollider(true, 1395, 880, 465, 172, (x :number, y :number)=>{
            console.log("CONTACT");
            AboutUs.instance.show();
            AboutUs.instance.activate();
            this.deactivate();
            this.hide();
        })
        this.continue.setCollider(true, 198, 815, 413, 220, (x :number, y :number)=>{
            console.log("CONTINUE");
            this.deactivate();
            this.hide();
            GameOver.instance.activate();
            GameOver.instance.show();
        })
        this.maxScore.setCollider(true, 71, 60, 250, 287, (x :number, y :number)=>{
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
        this.background.setImage(true, 99, await FileLoader.loadImage("resources/interface/menu/base_orange.png"));
        this.settings.setImage(true, 100, await FileLoader.loadImage("resources/interface/menu/ajustes.png"), 1737, 49, 149, 149);
        this.play.setImage(true, 100, await FileLoader.loadImage("resources/interface/menu/jugar.png"), 830, 750, 345, 205);
        this.contact.setImage(true, 100, await FileLoader.loadImage("resources/interface/menu/contactar.png"), 1395, 880, 465, 172);
        this.continue.setImage(true, 100, await FileLoader.loadImage("resources/interface/menu/continuar.png"), 198, 815, 413, 220);
        this.maxScore.setImage(true, 100, await FileLoader.loadImage("resources/interface/menu/max_scores.png"), 71, 60, 208, 287);

        this.menu_layout.addEntitiesToRenderer();


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
        var w = canvasWidth * 0.5;
        var h = canvasHeight * 0.5;
        this.menu_layout.position.x = w - this.standardX * 0.5;
        this.menu_layout.position.y = h - this.standardY * 0.5;
        for(let ent of this.menu_layout.uiEntities){
            ent.x = this.menu_layout.position.x + ent.getRelativePos().x;
            ent.y = this.menu_layout.position.y + ent.getRelativePos().y;
        }
    }

}