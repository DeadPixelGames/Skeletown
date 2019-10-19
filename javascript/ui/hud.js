var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import GraphicsRenderer from "../graphics/graphicsrenderer.js";
import { UILayout, ProgressBar, UIEntity } from "./uiEntity.js";
import { enteringInventory, STANDARD_SCREEN_SIZE_X, STANDARD_SCREEN_SIZE_Y } from "../main.js";
import Interface from "./interface.js";
import FileLoader from "../fileloader.js";
export class Hud {
    constructor() {
        this.width = GraphicsRenderer.instance.getCanvas().width;
        this.height = GraphicsRenderer.instance.getCanvas().height;
        console.log(this.width, this.height);
        this.hud_InGame = new UILayout(0, 0, this.width, this.height);
        this.moneyCounter = new UIEntity(true);
        this.time = new UIEntity(false);
        this.inventory = new UIEntity(true);
        this.lifeBar = new ProgressBar(this.width * 0.5 - 351, 5, 703, 128, true, (x, y) => {
            this.lifeBar.setProgress(this.lifeBar.getProgress() - 10);
        });
        //#region Colliders
        this.moneyCounter.setCollider(true, 5, 5, 320, 91, (x, y) => {
        });
        this.time.setCollider(true, this.width - 265, 5, 362, 128);
        this.inventory.setCollider(false, this.width - 245, this.height - 245, 245, 245, (x, y) => {
            enteringInventory();
            this.lifeBar.setProgress(this.lifeBar.getProgress() + 10);
        });
        Interface.instance.addCollider(this.lifeBar.getCollider());
        Interface.instance.addCollider(this.moneyCounter.getCollider());
        Interface.instance.addCollider(this.time.getCollider());
        Interface.instance.addCollider(this.inventory.getCollider());
        //#endregion
        this.hud_InGame.addUIEntity(this.lifeBar);
        this.hud_InGame.addUIEntity(this.moneyCounter);
        this.hud_InGame.addUIEntity(this.time);
        this.hud_InGame.addUIEntity(this.inventory);
        this.initImages();
    }
    /** La instancia única de esta clase singleton. */
    static get instance() {
        return this._instance;
    }
    /** Inicia el patrón singleton, o lanza un error si ya hay otra instancia de esta clase en funcionamiento. */
    static initSingleton(instance) {
        // Si la instancia singleton de esta clase ya es la actual, no hacemos nada
        if (Hud._instance == instance) {
            return;
        }
        // Pero si es otra, ha habido un problema y hay que lanzar un error
        if (Hud._instance) {
            throw new Error("Ya hay otra instancia de " + this.name + " en funcionamiento.");
        }
        else {
            // Y si no, es la primera vez que iniciamos este singleton y vamos a usar la instancia actual
            this._instance = instance;
        }
    }
    /**
     * Inicializa la instancia Singleton de `Hud` del programa y la asocia al contexto de canvas especificado.
     */
    static initInstance(context) {
        if (!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderes no se ha iniciado todavía. Por favor inicia GameLoop antes de instanciar GraphicsRenderer.");
        }
        var ret = new Hud();
        Hud.initSingleton(ret);
        return ret;
    }
    initImages() {
        return __awaiter(this, void 0, void 0, function* () {
            this.lifeBar.setImage(true, 99, yield FileLoader.loadImage("resources/interface/HUD_life3.png"), 0, 0, 768, 91, 768, 91);
            this.lifeBar.setIcon(true, 100, yield FileLoader.loadImage("resources/interface/HUD_life1.png"), 0, 0, 768, 91, 768, 91);
            this.lifeBar.setProgressBar(true, 100, yield FileLoader.loadImage("resources/interface/HUD_life2.png"), 0, 0, 768, 91, 768, 91);
            this.moneyCounter.setImage(true, 100, yield FileLoader.loadImage("resources/interface/HUD_money.png"), 0, 0);
            this.time.setImage(true, 100, yield FileLoader.loadImage("resources/interface/HUD_time.png"), 0, 0, 362, 128);
            this.inventory.setImage(true, 100, yield FileLoader.loadImage("resources/interface/HUD_inventory.png"));
            this.hud_InGame.addEntitiesToRenderer();
            this.moneyCounter.setText("1283902", { x: 250, y: 65 }, "45px");
            this.time.setText("10:21", { x: 145, y: 80 }, "45px");
        });
    }
    activate() {
        this.hud_InGame.activate();
    }
    deactivate() {
        this.hud_InGame.deactivate();
    }
    show() {
        this.hud_InGame.show();
    }
    hide() {
        this.hud_InGame.hide();
    }
    resize(canvasWidth, canvasHeight) {
        var w = canvasWidth * 0.5 / GraphicsRenderer.instance.scaleX;
        var h = canvasHeight * 0.5 / GraphicsRenderer.instance.scaleY;
        this.hud_InGame.position.x = w - STANDARD_SCREEN_SIZE_X * 0.5;
        this.hud_InGame.position.y = h - STANDARD_SCREEN_SIZE_Y * 0.5;
        for (let ent of this.hud_InGame.uiEntities) {
            ent.x = this.hud_InGame.position.x + ent.getRelativePos().x;
            ent.y = this.hud_InGame.position.y + ent.getRelativePos().y;
        }
    }
}
//# sourceMappingURL=hud.js.map