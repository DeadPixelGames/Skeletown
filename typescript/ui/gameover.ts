import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import { UILayout, ProgressBar, UIEntity } from "./uiEntity.js";
import Interface from "./interface.js";
import { BoxCollider, CircleCollider } from "../collider.js";
import FileLoader from "../fileloader.js";
import { MainMenu } from "./mainmenu.js";

export class GameOver {

    private gameOver_layout :UILayout;
    private background :UIEntity;
    private money :UIEntity;
    private moneyQuantity :UIEntity;
    private backToMenu :UIEntity;

    private width :number;
    private height :number;

    private standardX :number;
    private standardY :number;
    //#region Singleton
    private static _instance :GameOver;

    /** La instancia única de esta clase singleton. */
    public static get instance() {
        return this._instance;
    }

    /** Inicia el patrón singleton, o lanza un error si ya hay otra instancia de esta clase en funcionamiento. */
    private static initSingleton(instance :GameOver) {
        // Si la instancia singleton de esta clase ya es la actual, no hacemos nada
        if(GameOver._instance == instance) {
            return;
        }
        // Pero si es otra, ha habido un problema y hay que lanzar un error
        if(GameOver._instance) {
            throw new Error("Ya hay otra instancia de " + this.name + " en funcionamiento.");
        } else {
            // Y si no, es la primera vez que iniciamos este singleton y vamos a usar la instancia actual
            this._instance = instance;
        }
    }

    /**
     * Inicializa la instancia Singleton de `GameOver` del programa y la asocia al contexto de canvas especificado.
     */
    public static initInstance(context :CanvasRenderingContext2D, standardX :number, standardY :number) {
        if(!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderes no se ha iniciado todavía. Por favor inicia GraphicsRenderer antes de instanciar GameOver.");
        }
        var ret = new GameOver();
        GameOver.initSingleton(ret);
        ret.standardX = standardX;
        ret.standardY = standardY;
        return ret;
    }
    //#endregion



    private constructor(){
        this.width = this.standardX;
        this.height = this.standardY;

        this.gameOver_layout = new UILayout(0, 0, this.width, this.height);

        this.background = new UIEntity(false);
        this.money = new UIEntity(true);
        this.moneyQuantity = new UIEntity(false);

        //#region Colliders
        this.background.setCollider(true, 0, 0, this.width, this.height);

        this.money.setCollider(true, 550, 658, 247, 72, (x,y)=>{
            this.deactivate();
            this.hide();
            MainMenu.instance.activate();
            MainMenu.instance.show();
        })

        this.moneyQuantity.setCollider(true, 0, 0, 254, 87);

        Interface.instance.addCollider(this.money.getCollider() as BoxCollider);
        //#endregion

        this.gameOver_layout.addUIEntity(this.background);
        this.gameOver_layout.addUIEntity(this.money);
        this.gameOver_layout.addUIEntity(this.moneyQuantity);

        this.initImages();
    }

    public async initImages(){
        this.background.setImage(true, 99, await FileLoader.loadImage("resources/interface/menu/gameover_page.png"));
        this.money.setImage(true, 100, await FileLoader.loadImage("resources/interface/menu/gameover_button.png"), 550, 658, 247, 72);
        this.moneyQuantity.setImage(true, 100, await FileLoader.loadImage("resources/interface/HUD_money.png"), 0, 0, 254, 87);

        this.gameOver_layout.addEntitiesToRenderer();

        this.moneyQuantity.setText("999999999", {x: 200, y: 55}, 35);

        this.deactivate();
        this.hide();
    }

    public activate(){
        this.gameOver_layout.activate();
    }
    public deactivate(){
        this.gameOver_layout.deactivate();
    }
    public show(){
        this.gameOver_layout.show();
    }
    public hide(){
        this.gameOver_layout.hide();
    }

    public resize(canvasWidth :number, canvasHeight :number){
        var w = canvasWidth * 0.5 / GraphicsRenderer.instance.scaleX;
        var h = canvasHeight * 0.5 / GraphicsRenderer.instance.scaleY;
        this.gameOver_layout.position.x = w - this.standardX * 0.5;
        this.gameOver_layout.position.y = h - this.standardY * 0.5;
        for(let ent of this.gameOver_layout.uiEntities){
            ent.x = this.gameOver_layout.position.x + ent.getRelativePos().x;
            ent.y = this.gameOver_layout.position.y + ent.getRelativePos().y;
        }
    }




}