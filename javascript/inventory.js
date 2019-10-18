var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UILayout, UIEntity } from "./ui/uiEntity.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import FileLoader from "./fileloader.js";
import Interface from "./ui/interface.js";
import GameLoop from "./gameloop.js";
import { exitingInventory } from "./main.js";
export class Inventory {
    constructor() {
        this.halfWidth = 512;
        this.halfHeight = 348;
        this.layout = new UILayout(GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
        this.cropsLayout = new UILayout(GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
        this.clothesLayout = new UILayout(GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
        this.wikiLayout = new UILayout(GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
        this.settingsLayout = new UILayout(GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
        this.background = new UIEntity(false);
        this.crops = new UIEntity(true);
        this.clothes = new UIEntity(true);
        this.wiki = new UIEntity(true);
        this.settings = new UIEntity(true);
        this.closeInventory = new UIEntity(true);
        this.background.setPercentRelPos(false);
        this.crops.setPercentRelPos(false);
        this.clothes.setPercentRelPos(false);
        this.wiki.setPercentRelPos(false);
        this.settings.setPercentRelPos(false);
        this.closeInventory.setPercentRelPos(false);
        this.loadImages();
        this.loadColliders();
        this.layout.addUIEntity(this.background);
        this.layout.addUIEntity(this.crops);
        this.layout.addUIEntity(this.clothes);
        this.layout.addUIEntity(this.wiki);
        this.layout.addUIEntity(this.settings);
        this.layout.addUIEntity(this.closeInventory);
        this.initCropsLayout();
        this.initClothesLayout();
        this.initWikiLayout();
        this.initSettingsLayout();
        this.deactivate();
        this.shown = false;
    }
    /**
     * Inicializa la instancia Singleton de `Inventory` del programa y la asocia al contexto de canvas especificado.
     */
    static initInstance() {
        if (!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderer no se ha iniciado todavía. Por favor inicia GameLoop antes de instanciar GraphicsRenderer.");
        }
        this.instance = new Inventory();
    }
    addItem(item, count) {
        var found = false;
        var i = 1;
        while (!found || i == this.items.length) {
            var it = this.items[i];
            if (it) {
                if (it.blocked)
                    found = true;
                if (it.id == item.id) {
                    it.addItem(count);
                    found = true;
                }
                else if (it.count <= 0) {
                    it.setItem(item);
                    it.addItem(count);
                    found = true;
                }
                i++;
            }
        }
    }
    //#region Loading imágenes y colliders
    loadImages() {
        return __awaiter(this, void 0, void 0, function* () {
            this.background.setImage(true, 101, yield FileLoader.loadImage("resources/interface/inv_base.png"), 0, 0, this.halfWidth * 2, this.halfHeight * 2);
            this.crops.setImage(true, 103, yield FileLoader.loadImage("resources/interface/or_inv_button.png"), 58, 56, 101, 101);
            this.clothes.setImage(true, 103, yield FileLoader.loadImage("resources/interface/cos_inv_button.png"), 113, 0, 101, 101);
            this.wiki.setImage(true, 103, yield FileLoader.loadImage("resources/interface/or_inv_button.png"), 58, 56, 101, 101);
            this.settings.setImage(true, 103, yield FileLoader.loadImage("resources/interface/or_inv_button.png"), 58, 56, 101, 101);
            this.closeInventory.setImage(true, 102, yield FileLoader.loadImage("resources/interface/but_cerrar.png"), 0, 0, 86, 86);
            this.layout.addEntitiesToRenderer();
            this.layout.hide();
        });
    }
    loadColliders() {
        this.background.setCollider(true, 0, 0, 1024, 696);
        this.crops.setCollider(true, 58, 56, 101, 101, (x, y) => {
            this.cropsLayout.show();
            this.clothesLayout.hide();
            this.wikiLayout.hide();
            this.settingsLayout.hide();
            console.log("CROPS");
        });
        this.clothes.setCollider(true, 58, 207, 101, 101, (x, y) => {
            this.cropsLayout.hide();
            this.clothesLayout.show();
            this.wikiLayout.hide();
            this.settingsLayout.hide();
            console.log("CLOTHES");
        });
        this.wiki.setCollider(true, 58, 358, 101, 101, (x, y) => {
            this.cropsLayout.hide();
            this.clothesLayout.hide();
            this.wikiLayout.show();
            this.settingsLayout.hide();
            console.log("WIKI");
        });
        this.settings.setCollider(true, 58, 509, 101, 101, (x, y) => {
            this.cropsLayout.hide();
            this.clothesLayout.hide();
            this.wikiLayout.hide();
            this.settingsLayout.show();
            console.log("SETTINGS");
        });
        this.closeInventory.setCollider(false, 981, -43, 86, 86, (x, y) => {
            exitingInventory();
        });
        Interface.instance.addCollider(this.crops.getCollider());
        Interface.instance.addCollider(this.clothes.getCollider());
        Interface.instance.addCollider(this.wiki.getCollider());
        Interface.instance.addCollider(this.settings.getCollider());
        Interface.instance.addCollider(this.closeInventory.getCollider());
    }
    //#endregion
    show() {
        this.shown = true;
        this.layout.show();
        this.cropsLayout.show();
        this.clothesLayout.hide();
        this.wikiLayout.hide();
        this.settingsLayout.hide();
    }
    hide() {
        this.shown = false;
        this.layout.hide();
        this.cropsLayout.hide();
        this.clothesLayout.hide();
        this.wikiLayout.hide();
        this.settingsLayout.hide();
    }
    activate() {
        this.layout.activate();
        this.cropsLayout.activate();
        this.clothesLayout.deactivate();
        this.wikiLayout.deactivate();
        this.settingsLayout.deactivate();
    }
    deactivate() {
        this.layout.deactivate();
        this.cropsLayout.deactivate();
        this.clothesLayout.deactivate();
        this.wikiLayout.deactivate();
        this.settingsLayout.deactivate();
    }
    //#region initLayouts
    initCropsLayout() {
        return __awaiter(this, void 0, void 0, function* () {
            var background = new UIEntity(false);
            background.setImage(true, 102, yield FileLoader.loadImage("resources/interface/or_inv_page.png"));
            background.setCollider(true, 0, 0, 1024, 696);
            background.setPercentRelPos(false);
            this.cropsLayout.addUIEntity(background);
            var constX = 201;
            var constY = 56;
            var constInBetweenX = 24;
            var constInBetweenY = 20;
            var constW = 128;
            this.items = [null];
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 5; j++) {
                    var item = new itemInInventory(j + i * 5 + 1, constX + j * constInBetweenX + j * constW, constY + i * constInBetweenY + i * constW, constW, constW);
                    if (i != 0)
                        item.blocked = true;
                    this.items.push(item);
                }
            }
            for (let item of this.items) {
                if (item)
                    this.cropsLayout.addUIEntity(item.image);
            }
            console.log(this.cropsLayout);
            this.cropsLayout.addEntitiesToRenderer();
            this.cropsLayout.hide();
            this.deactivate();
        });
    }
    initClothesLayout() {
        return __awaiter(this, void 0, void 0, function* () {
            var background = new UIEntity(false);
            background.setImage(true, 102, yield FileLoader.loadImage("resources/interface/cos_inv_page.png"));
            background.setCollider(true, 0, 0, 1024, 696);
            background.setPercentRelPos(false);
            this.clothesLayout.addUIEntity(background);
            this.clothesLayout.addEntitiesToRenderer();
            this.clothesLayout.hide();
        });
    }
    initWikiLayout() {
        return __awaiter(this, void 0, void 0, function* () {
            var background = new UIEntity(false);
            background.setImage(true, 102, yield FileLoader.loadImage("resources/interface/or_inv_page.png"));
            background.setCollider(true, 0, 0, 1024, 696);
            background.setPercentRelPos(false);
            this.wikiLayout.addUIEntity(background);
            this.wikiLayout.addEntitiesToRenderer();
            this.wikiLayout.hide();
        });
    }
    initSettingsLayout() {
        return __awaiter(this, void 0, void 0, function* () {
            var background = new UIEntity(false);
            background.setImage(true, 102, yield FileLoader.loadImage("resources/interface/or_inv_page.png"));
            background.setCollider(true, 0, 0, 1024, 696);
            background.setPercentRelPos(false);
            this.settingsLayout.addUIEntity(background);
            this.settingsLayout.addEntitiesToRenderer();
            this.settingsLayout.hide();
        });
    }
    //#endregion
    resize(width, height) {
        this.layout.position.x = width * 0.5 - this.halfWidth;
        this.layout.position.y = height * 0.5 - this.halfHeight;
        for (let ent of this.layout.uiEntities) {
            ent.x = this.layout.position.x + ent.getRelativePos().x;
            ent.y = this.layout.position.y + ent.getRelativePos().y;
        }
        this.cropsLayout.position.x = width * 0.5 - this.halfWidth;
        this.cropsLayout.position.y = height * 0.5 - this.halfHeight;
        for (let ent of this.cropsLayout.uiEntities) {
            ent.x = this.cropsLayout.position.x + ent.getRelativePos().x;
            ent.y = this.cropsLayout.position.y + ent.getRelativePos().y;
        }
        this.clothesLayout.position.x = width * 0.5 - this.halfWidth;
        this.clothesLayout.position.y = height * 0.5 - this.halfHeight;
        for (let ent of this.clothesLayout.uiEntities) {
            ent.x = this.clothesLayout.position.x + ent.getRelativePos().x;
            ent.y = this.clothesLayout.position.y + ent.getRelativePos().y;
        }
        this.wikiLayout.position.x = width * 0.5 - this.halfWidth;
        this.wikiLayout.position.y = height * 0.5 - this.halfHeight;
        for (let ent of this.wikiLayout.uiEntities) {
            ent.x = this.wikiLayout.position.x + ent.getRelativePos().x;
            ent.y = this.wikiLayout.position.y + ent.getRelativePos().y;
        }
        this.settingsLayout.position.x = width * 0.5 - this.halfWidth;
        this.settingsLayout.position.y = height * 0.5 - this.halfHeight;
        for (let ent of this.settingsLayout.uiEntities) {
            ent.x = this.settingsLayout.position.x + ent.getRelativePos().x;
            ent.y = this.settingsLayout.position.y + ent.getRelativePos().y;
        }
    }
    togglePlanting(tile) {
        this.farmableTile = tile;
        this.layout.activate();
        this.cropsLayout.activate();
        this.clothesLayout.deactivate();
        this.wikiLayout.deactivate();
        this.settingsLayout.deactivate();
    }
}
class itemInInventory {
    constructor(pos, left, top, width, height) {
        this.count = 0;
        this.image = new UIEntity(true);
        this.initImage(left, top, width, height);
        this.pos = pos;
        GameLoop.instance.suscribe(this, null, this.update, null, null);
    }
    initImage(left, top, width, height) {
        return __awaiter(this, void 0, void 0, function* () {
            this.image.setPercentRelPos(false);
            this.image.setCollider(false, left, top, width, height, (x, y) => {
                if (!this.blocked) {
                    if (Inventory.instance.farmableTile) {
                        var it = Inventory.instance.items[this.pos];
                        if (it) {
                            if (it.count > 0) {
                                it.takeItem(1);
                                Inventory.instance.farmableTile.plantCrop(this.id);
                                Inventory.instance.farmableTile = undefined;
                                exitingInventory();
                                if (it.count == 0) {
                                    this.id = -1;
                                }
                            }
                        }
                    }
                }
            });
            var coll = this.image.getCollider();
            if (coll) {
                Interface.instance.addCollider(coll);
            }
            this.image.setImage(true, 105, yield FileLoader.loadImage("resources/sprites/harvest_spritesheet.png"), 512, 0, 128, 128);
            this.image.hide();
            GraphicsRenderer.instance.addExistingEntity(this.image.image);
        });
    }
    setItem(item) {
        this.id = item.id;
        this.name = item.name;
    }
    addItem(count) {
        this.count += count;
    }
    takeItem(count) {
        this.count -= count;
    }
    update(deltaTime) {
        if (this.id >= 0) {
            this.image.image.setSection(512, this.id * 128, 128, 128);
            this.image.setText(this.count.toString(), { x: 110, y: 110 }, "30px");
        }
        else {
            this.image.hide();
        }
    }
}
//# sourceMappingURL=inventory.js.map