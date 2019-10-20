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
import { UILayout, UIEntity } from "./uiEntity.js";
import Interface from "./interface.js";
import FileLoader from "../fileloader.js";
import { MainMenu } from "./mainmenu.js";
import AudioManager from "../audiomanager.js";
export class MaxScore {
    //#endregion
    constructor() {
        this.width = GraphicsRenderer.instance.getCanvas().width;
        this.height = GraphicsRenderer.instance.getCanvas().height;
        this.maxScore_layout = new UILayout(0, 0, this.width, this.height);
        this.background = new UIEntity(false);
        this.back = new UIEntity(true);
        //#region Colliders
        this.background.setCollider(true, 0, 0, this.width, this.height);
        this.back.setCollider(true, 88, 93, 157, 146, (x, y) => {
            MainMenu.instance.show();
            MainMenu.instance.activate();
            this.deactivate();
            this.hide();
            if (AudioManager.instance.contextIsActive) {
                AudioManager.instance.playSound("click");
            }
        });
        Interface.instance.addCollider(this.back.getCollider());
        //#endregion
        this.maxScore_layout.addUIEntity(this.background);
        this.maxScore_layout.addUIEntity(this.back);
        this.initImages();
    }
    /** La instancia única de esta clase singleton. */
    static get instance() {
        return this._instance;
    }
    /** Inicia el patrón singleton, o lanza un error si ya hay otra instancia de esta clase en funcionamiento. */
    static initSingleton(instance) {
        // Si la instancia singleton de esta clase ya es la actual, no hacemos nada
        if (MaxScore._instance == instance) {
            return;
        }
        // Pero si es otra, ha habido un problema y hay que lanzar un error
        if (MaxScore._instance) {
            throw new Error("Ya hay otra instancia de " + this.name + " en funcionamiento.");
        }
        else {
            // Y si no, es la primera vez que iniciamos este singleton y vamos a usar la instancia actual
            this._instance = instance;
        }
    }
    /**
     * Inicializa la instancia Singleton de `MaxScore` del programa y la asocia al contexto de canvas especificado.
     */
    static initInstance(context, standardX, standardY) {
        if (!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderes no se ha iniciado todavía. Por favor inicia GraphicsRenderer antes de instanciar MaxScore.");
        }
        var ret = new MaxScore();
        MaxScore.initSingleton(ret);
        ret.standardX = standardX;
        ret.standardY = standardY;
        return ret;
    }
    initImages() {
        return __awaiter(this, void 0, void 0, function* () {
            this.background.setImage(true, 99, yield FileLoader.loadImage("resources/interface/menu/max_scores_page.png"));
            this.back.setImage(true, 100, yield FileLoader.loadImage("resources/interface/menu/max_scores_button.png"), 88, 93, 157, 146);
            this.maxScore_layout.addEntitiesToRenderer();
            this.deactivate();
            this.hide();
        });
    }
    activate() {
        this.maxScore_layout.activate();
    }
    deactivate() {
        this.maxScore_layout.deactivate();
    }
    show() {
        this.maxScore_layout.show();
    }
    hide() {
        this.maxScore_layout.hide();
    }
    resize(canvasWidth, canvasHeight) {
        var w = canvasWidth * 0.5;
        var h = canvasHeight * 0.5;
        this.maxScore_layout.position.x = w - this.standardX * 0.5;
        this.maxScore_layout.position.y = h - this.standardY * 0.5;
        for (let ent of this.maxScore_layout.uiEntities) {
            ent.x = this.maxScore_layout.position.x + ent.getRelativePos().x;
            ent.y = this.maxScore_layout.position.y + ent.getRelativePos().y;
        }
    }
}
//# sourceMappingURL=maxscores.js.map