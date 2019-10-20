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
export default class AboutUs {
    //#endregion
    constructor() {
        this.width = GraphicsRenderer.instance.getCanvas().width;
        this.height = GraphicsRenderer.instance.getCanvas().height;
        this.aboutUs_layout = new UILayout(0, 0, this.width, this.height);
        this.background = new UIEntity(false);
        this.back = new UIEntity(true);
        this.FB = new UIEntity(true);
        this.IG = new UIEntity(true);
        this.YT = new UIEntity(true);
        this.itchio = new UIEntity(true);
        this.twitter = new UIEntity(true);
        //#region Collider
        this.background.setCollider(true, 0, 0, this.width, this.height);
        this.back.setCollider(true, 53, 54, 177, 131, (x, y) => {
            MainMenu.instance.activate();
            MainMenu.instance.show();
            this.deactivate();
            this.hide();
        });
        this.FB.setCollider(true, 1370, 490, 264, 254, (x, y) => {
            window.open("https://www.facebook.com/caronte.huertas.3", "_blank");
        });
        this.IG.setCollider(true, 880, 447, 276, 270, (x, y) => {
            window.open("https://www.instagram.com/deadpixelgames_/", "_blank");
        });
        this.twitter.setCollider(true, 467, 812, 273, 252, (x, y) => {
            window.open("https://twitter.com/DeadPixelGames_", "_blank");
        });
        this.YT.setCollider(true, 230, 520, 264, 272, (x, y) => {
            window.open("https://www.youtube.com/channel/UCOBoLIFFDwMA2fXG-Wwz23w", "_blank");
        });
        this.itchio.setCollider(true, 1158, 794, 296, 280, (x, y) => {
            window.open("https://deadpixelgames.itch.io/skeletown", "_blank");
        });
        Interface.instance.addCollider(this.back.getCollider());
        Interface.instance.addCollider(this.YT.getCollider());
        Interface.instance.addCollider(this.twitter.getCollider());
        Interface.instance.addCollider(this.itchio.getCollider());
        Interface.instance.addCollider(this.IG.getCollider());
        Interface.instance.addCollider(this.FB.getCollider());
        //#endregion
        this.aboutUs_layout.addUIEntity(this.background);
        this.aboutUs_layout.addUIEntity(this.back);
        this.aboutUs_layout.addUIEntity(this.FB);
        this.aboutUs_layout.addUIEntity(this.YT);
        this.aboutUs_layout.addUIEntity(this.itchio);
        this.aboutUs_layout.addUIEntity(this.twitter);
        this.aboutUs_layout.addUIEntity(this.IG);
        this.initImage();
    }
    /** La instancia única de esta clase singleton. */
    static get instance() {
        return this._instance;
    }
    /** Inicia el patrón singleton, o lanza un error si ya hay otra instancia de esta clase en funcionamiento. */
    static initSingleton(instance) {
        // Si la instancia singleton de esta clase ya es la actual, no hacemos nada
        if (AboutUs._instance == instance) {
            return;
        }
        // Pero si es otra, ha habido un problema y hay que lanzar un error
        if (AboutUs._instance) {
            throw new Error("Ya hay otra instancia de " + this.name + " en funcionamiento.");
        }
        else {
            // Y si no, es la primera vez que iniciamos este singleton y vamos a usar la instancia actual
            this._instance = instance;
        }
    }
    /**
     * Inicializa la instancia Singleton de `AboutUs` del programa y la asocia al contexto de canvas especificado.
     */
    static initInstance(context, standardX, standardY) {
        if (!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderer no se ha iniciado todavía. Por favor inicia GraphicsRenderer antes de instanciar AboutUs.");
        }
        var ret = new AboutUs();
        AboutUs.initSingleton(ret);
        ret.standardX = standardX;
        ret.standardY = standardY;
        return ret;
    }
    initImage() {
        return __awaiter(this, void 0, void 0, function* () {
            this.background.setImage(true, 99, yield FileLoader.loadImage("resources/interface/menu_contactar/fondo.png"));
            this.back.setImage(true, 100, yield FileLoader.loadImage("resources/interface/menu_contactar/boton_back.png"), 53, 54, 177, 131);
            this.FB.setImage(true, 100, yield FileLoader.loadImage("resources/interface/menu_contactar/facebook.png"), 1370, 490, 264, 254);
            this.YT.setImage(true, 100, yield FileLoader.loadImage("resources/interface/menu_contactar/youtube.png"), 230, 520, 264, 272);
            this.itchio.setImage(true, 100, yield FileLoader.loadImage("resources/interface/menu_contactar/itchio.png"), 1158, 794, 296, 280);
            this.twitter.setImage(true, 100, yield FileLoader.loadImage("resources/interface/menu_contactar/twitter.png"), 467, 812, 273, 252);
            this.IG.setImage(true, 100, yield FileLoader.loadImage("resources/interface/menu_contactar/instagram.png"), 880, 447, 276, 270);
            this.aboutUs_layout.addEntitiesToRenderer();
            this.deactivate();
            this.hide();
        });
    }
    activate() {
        this.aboutUs_layout.activate();
    }
    deactivate() {
        this.aboutUs_layout.deactivate();
    }
    show() {
        this.aboutUs_layout.show();
    }
    hide() {
        this.aboutUs_layout.hide();
    }
    resize(canvasWidth, canvasHeight) {
        var w = canvasWidth * 0.5;
        var h = canvasHeight * 0.5;
        this.aboutUs_layout.position.x = w - this.standardX * 0.5;
        this.aboutUs_layout.position.y = h - this.standardY * 0.5;
        for (let ent of this.aboutUs_layout.uiEntities) {
            ent.x = this.aboutUs_layout.position.x + ent.getRelativePos().x;
            ent.y = this.aboutUs_layout.position.y + ent.getRelativePos().y;
        }
    }
}
//# sourceMappingURL=aboutus.js.map