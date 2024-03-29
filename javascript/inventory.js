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
import GameLoop from "./gameloop.js";
import Interface, { exitingInventory } from "./ui/interface.js";
import { unloadGame, saveWorldInfo } from "./worldload.js";
import { MainMenu } from "./ui/mainmenu.js";
import { Hud } from "./ui/hud.js";
import { sleep } from "./util.js";
import AudioManager from "./audiomanager.js";
export class Inventory {
    constructor() {
        //#endregion
        /**Mitad de la anchura del contenedor del inventario */
        this.halfWidth = 512;
        /**Mitad de la altura del contenedor del inventario */
        this.halfHeight = 348;
        this.pageSelected = "crops";
        this.cropSelected = 0;
        this.enemySelected = 0;
        this.items = [];
        //#region Inicialización de los contenedores
        this.layout = new UILayout(this.standardX * 0.5 - this.halfWidth, this.standardY * 0.5 - this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
        this.cropsLayout = new UILayout(this.standardX * 0.5 - this.halfWidth, this.standardY * 0.5 - this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
        this.clothesLayout = new UILayout(this.standardX * 0.5 - this.halfWidth, this.standardY * 0.5 - this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
        this.wikiLayout = new UILayout(this.standardX * 0.5 - this.halfWidth, this.standardY * 0.5 - this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
        this.settingsLayout = new UILayout(this.standardX * 0.5 - this.halfWidth, this.standardY * 0.5 - this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
        //#endregion
        //#region Inicialización elementos del layout base
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
        //#endregion
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
    }
    /**
     * Inicializa la instancia Singleton de `Inventory` del programa y la asocia al contexto de canvas especificado.
     */
    static initInstance(standardX, standardY) {
        if (!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderer no se ha iniciado todavía. Por favor inicia GameLoop antes de instanciar GraphicsRenderer.");
        }
        this.instance = new Inventory();
        this.instance.standardX = standardX;
        this.instance.standardY = standardY;
    }
    addItem(item) {
        var found = false;
        var i = 0;
        while (!found && i < this.items.length) {
            var it = this.items[i];
            if (it) {
                if (it.blocked)
                    found = true;
                if (it.type == item.type) {
                    if (it.id == item.id) {
                        it.addItem(item.count);
                        found = true;
                    }
                }
                else if (it.count <= 0) {
                    it.setItem(item);
                    it.addItem(item.count);
                    if (item.type == "fertilizer") {
                        if (item.strength) {
                            it.fertStrength = item.strength;
                        }
                        else {
                            console.log("No se ha incluido potencia en el abono: " + item.name);
                        }
                    }
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
            this.clothes.setImage(true, 103, yield FileLoader.loadImage("resources/interface/cos_inv_button.png"), 58, 211, 103, 103);
            this.wiki.setImage(true, 103, yield FileLoader.loadImage("resources/interface/bok_inv_button.png"), 57, 360, 110, 110);
            this.settings.setImage(true, 103, yield FileLoader.loadImage("resources/interface/exit_inv_button.png"), 58, 509, 115, 130);
            this.closeInventory.setImage(true, 102, yield FileLoader.loadImage("resources/interface/but_cerrar.png"), 0, 0, 86, 86);
            this.layout.addEntitiesToRenderer();
            this.layout.hide();
        });
    }
    loadColliders() {
        this.background.setCollider(true, 0, 0, 1024, 696);
        this.crops.setCollider(true, 58, 56, 101, 101, (x, y) => {
            this.cropsLayout.show();
            this.cropsLayout.activate();
            this.clothesLayout.hide();
            this.wikiLayout.hide();
            this.wikiLayout.deactivate();
            this.settingsLayout.hide();
            this.settingsLayout.deactivate();
            console.log("CROPS");
            if (AudioManager.instance.contextIsActive) {
                AudioManager.instance.playSound("click");
            }
        });
        this.clothes.setCollider(true, 58, 207, 101, 101, (x, y) => {
            this.cropsLayout.hide();
            this.cropsLayout.deactivate();
            this.clothesLayout.show();
            this.wikiLayout.hide();
            this.wikiLayout.deactivate();
            this.settingsLayout.hide();
            this.settingsLayout.deactivate();
            console.log("CLOTHES");
            if (AudioManager.instance.contextIsActive) {
                AudioManager.instance.playSound("click");
            }
        });
        this.wiki.setCollider(true, 58, 358, 101, 101, (x, y) => {
            this.cropsLayout.hide();
            this.cropsLayout.deactivate();
            this.clothesLayout.hide();
            this.wikiLayout.show();
            this.settingsLayout.hide();
            this.wikiLayout.activate();
            this.settingsLayout.deactivate();
            console.log("WIKI");
            if (AudioManager.instance.contextIsActive) {
                AudioManager.instance.playSound("click");
            }
        });
        this.settings.setCollider(true, 58, 509, 115, 115, (x, y) => {
            this.cropsLayout.hide();
            this.cropsLayout.deactivate();
            this.clothesLayout.hide();
            this.wikiLayout.hide();
            this.wikiLayout.deactivate();
            this.settingsLayout.show();
            this.settingsLayout.activate();
            console.log("SETTINGS");
            if (AudioManager.instance.contextIsActive) {
                AudioManager.instance.playSound("click");
            }
        });
        this.closeInventory.setCollider(false, 981, -43, 100, 100, (x, y) => {
            exitingInventory();
            if (AudioManager.instance.contextIsActive) {
                AudioManager.instance.playSound("click");
            }
        });
        Interface.instance.addCollider(this.crops.getCollider());
        Interface.instance.addCollider(this.clothes.getCollider());
        Interface.instance.addCollider(this.wiki.getCollider());
        Interface.instance.addCollider(this.settings.getCollider());
        Interface.instance.addCollider(this.closeInventory.getCollider());
    }
    //#endregion
    //#region Mostrar / Esconder; Activar / Desactivar el inventario
    show() {
        this.layout.show();
        this.cropsLayout.show();
        this.clothesLayout.hide();
        this.wikiLayout.hide();
        this.settingsLayout.hide();
    }
    hide() {
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
    //#endregion
    //#region Inicialización de los contenedores
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
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 5; j++) {
                    var item = new itemInInventory(j + i * 5 + 1, constX + j * constInBetweenX + j * constW, constY + i * constInBetweenY + i * constW, constW, constW);
                    if (i > 1)
                        item.blocked = true;
                    this.items.push(item);
                }
            }
            for (let item of this.items) {
                if (item)
                    this.cropsLayout.addUIEntity(item.image);
            }
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
            var cropPages = [];
            var enemyPages = [];
            var book = yield FileLoader.loadJSON("resources/interface/book.json");
            for (let en of book.enemies) {
                var aux = new UIEntity(false);
                aux.setImage(true, 104, yield FileLoader.loadImage("resources/interface/" + en.image));
                aux.setCollider(true, 0, 0, this.halfWidth * 2, this.halfHeight * 2);
                aux.setText(en.name + '\n\n' + en.description, { x: 745, y: 145 }, 18, "center");
                //aux.setText(en.description, {x: 745, y: 204}, "15px", "center");
                this.wikiLayout.addUIEntity(aux);
                enemyPages.push(aux);
            }
            for (let veg of book.vegetables) {
                var aux = new UIEntity(false);
                aux.setImage(true, 104, yield FileLoader.loadImage("resources/interface/" + veg.image));
                aux.setCollider(true, 0, 0, this.halfWidth * 2, this.halfHeight * 2);
                aux.setText(veg.name + "\n\n" + veg.description, { x: 745, y: 145 }, 18, "center");
                //aux.setText(veg.description, {x: 745, y: 204}, "15px", "center");
                this.wikiLayout.addUIEntity(aux);
                cropPages.push(aux);
            }
            var next = new UIEntity(true);
            var prev = new UIEntity(true);
            var cr = new UIEntity(true);
            var enemy = new UIEntity(true);
            background.setImage(true, 102, yield FileLoader.loadImage("resources/interface/bok_inv_page.png"));
            next.setImage(true, 103, yield FileLoader.loadImage("resources/interface/bok_inv_next.png"), 870, 255, 26, 302);
            prev.setImage(true, 103, yield FileLoader.loadImage("resources/interface/bok_inv_back.png"), 587, 255, 26, 302);
            cr.setImage(true, 103, yield FileLoader.loadImage("resources/interface/bok_inv_orbutton.png"), 661, 550, 50, 95);
            enemy.setImage(true, 103, yield FileLoader.loadImage("resources/interface/bok_inv_enebutton.png"), 748, 549, 50, 95);
            var that = this;
            background.setCollider(true, 0, 0, 1024, 696);
            next.setCollider(true, 870, 255, 26, 302, (x, y) => {
                if (that.pageSelected == "crops") {
                    var cropSelected = cropPages[that.cropSelected];
                    if (cropSelected) {
                        cropSelected.hide();
                        if (that.cropSelected < cropPages.length - 1) {
                            that.cropSelected++;
                        }
                        cropSelected = cropPages[that.cropSelected];
                        cropSelected.show();
                    }
                }
                else if (that.pageSelected == "enemies") {
                    var enemySelected = enemyPages[that.enemySelected];
                    if (enemySelected) {
                        enemySelected.image.visible = false;
                        if (that.enemySelected < enemyPages.length - 1) {
                            that.enemySelected++;
                        }
                        enemySelected = enemyPages[that.enemySelected];
                        enemySelected.show();
                    }
                }
                if (AudioManager.instance.contextIsActive) {
                    AudioManager.instance.playSound("click");
                }
            });
            prev.setCollider(true, 587, 255, 26, 302, (x, y) => {
                if (that.pageSelected == "crops") {
                    var cropSelected = cropPages[that.cropSelected];
                    if (cropSelected) {
                        cropSelected.hide();
                        if (that.cropSelected > 0) {
                            that.cropSelected--;
                        }
                        cropSelected = cropPages[that.cropSelected];
                        cropSelected.show();
                    }
                }
                else if (that.pageSelected == "enemies") {
                    var enemySelected = enemyPages[that.enemySelected];
                    if (enemySelected) {
                        enemySelected.hide();
                        if (that.enemySelected > 0) {
                            that.enemySelected--;
                        }
                        enemySelected = enemyPages[that.enemySelected];
                        enemySelected.show();
                    }
                }
                if (AudioManager.instance.contextIsActive) {
                    AudioManager.instance.playSound("click");
                }
            });
            cr.setCollider(true, 661, 550, 50, 95, (x, y) => {
                that.pageSelected = "crops";
                var cropSelected = cropPages[that.cropSelected];
                var enemySelected = enemyPages[that.enemySelected];
                if (cropSelected)
                    cropSelected.show();
                if (enemySelected)
                    enemySelected.hide();
                if (AudioManager.instance.contextIsActive) {
                    AudioManager.instance.playSound("click");
                }
            });
            enemy.setCollider(true, 748, 549, 50, 95, (x, y) => {
                that.pageSelected = "enemies";
                var cropSelected = cropPages[that.cropSelected];
                if (cropSelected)
                    cropSelected.hide();
                var enemySelected = enemyPages[that.enemySelected];
                if (enemySelected)
                    enemySelected.show();
                if (AudioManager.instance.contextIsActive) {
                    AudioManager.instance.playSound("click");
                }
            });
            Interface.instance.addCollider(next.getCollider());
            Interface.instance.addCollider(prev.getCollider());
            Interface.instance.addCollider(cr.getCollider());
            Interface.instance.addCollider(enemy.getCollider());
            this.wikiLayout.addUIEntity(background);
            this.wikiLayout.addUIEntity(next);
            this.wikiLayout.addUIEntity(prev);
            this.wikiLayout.addUIEntity(cr);
            this.wikiLayout.addUIEntity(enemy);
            this.wikiLayout.addEntitiesToRenderer();
            this.wikiLayout.show = function () {
                background.show();
                for (let en of enemyPages) {
                    if (en)
                        en.hide();
                }
                for (let crop of cropPages) {
                    if (crop)
                        crop.hide();
                }
                if (that.pageSelected == "crops") {
                    var cropSelected = cropPages[that.cropSelected];
                    if (cropSelected)
                        cropSelected.image.visible = true;
                }
                else if (that.pageSelected == "enemies") {
                    var enemySelected = enemyPages[that.enemySelected];
                    if (enemySelected)
                        enemySelected.image.visible = true;
                }
                console.log("SHOW");
                next.show();
                prev.show();
                cr.show();
                enemy.show();
            };
            this.wikiLayout.hide();
            this.wikiLayout.deactivate();
        });
    }
    initSettingsLayout() {
        return __awaiter(this, void 0, void 0, function* () {
            var background = new UIEntity(false);
            var tuto1 = new UIEntity(true);
            var tuto2 = new UIEntity(true);
            var exit = new UIEntity(true);
            background.setImage(true, 102, yield FileLoader.loadImage("resources/interface/exit_inv_page.png"));
            exit.setImage(true, 104, yield FileLoader.loadImage("resources/interface/exitgame_inv_button.png"), 481, 547, 176, 77);
            tuto1.setImage(true, 104, yield FileLoader.loadImage("resources/interface/exit_inv_tutorial_1.png"), 189, 0, 800, 600);
            tuto2.setImage(true, 104, yield FileLoader.loadImage("resources/interface/exit_inv_tutorial_2.png"), 189, 0, 800, 600);
            background.setCollider(true, 0, 0, 1024, 696);
            exit.setCollider(true, 481, 547, 176, 77, (x, y) => {
                console.log("SALIR AL MENÚ AL PRINCIPAL");
                GraphicsRenderer.instance.fadeOutAndIn(0.3, () => __awaiter(this, void 0, void 0, function* () {
                    Inventory.instance.deactivate();
                    Inventory.instance.hide();
                    Hud.instance.deactivate();
                    Hud.instance.hide();
                    yield sleep(50);
                    saveWorldInfo();
                    yield unloadGame();
                    MainMenu.instance.activate();
                    MainMenu.instance.show();
                }));
                if (AudioManager.instance.contextIsActive) {
                    AudioManager.instance.playSound("click");
                }
            });
            tuto1.setCollider(true, 189, 0, 800, 600, (x, y) => {
                tuto2.show();
                tuto1.hide();
                var col = tuto2.getCollider();
                if (col)
                    col.active = true;
                var col2 = tuto1.getCollider();
                if (col2)
                    col2.active = false;
                if (AudioManager.instance.contextIsActive) {
                    AudioManager.instance.playSound("click");
                }
            });
            tuto2.setCollider(true, 189, 0, 800, 600, (x, y) => {
                tuto2.hide();
                tuto1.show();
                var col = tuto2.getCollider();
                if (col)
                    col.active = false;
                var col2 = tuto1.getCollider();
                if (col2)
                    col2.active = true;
                if (AudioManager.instance.contextIsActive) {
                    AudioManager.instance.playSound("click");
                }
            });
            Interface.instance.addCollider(exit.getCollider());
            Interface.instance.addCollider(tuto1.getCollider());
            Interface.instance.addCollider(tuto2.getCollider());
            this.settingsLayout.addUIEntity(background);
            this.settingsLayout.addUIEntity(exit);
            this.settingsLayout.addUIEntity(tuto1);
            this.settingsLayout.addUIEntity(tuto2);
            this.settingsLayout.addEntitiesToRenderer();
            this.settingsLayout.show = function () {
                background.show();
                exit.show();
            };
            this.settingsLayout.activate = function () {
                var col = exit.getCollider();
                if (col)
                    col.active = true;
                var col2 = tuto1.getCollider();
                if (col2)
                    col2.active = true;
                var col3 = tuto2.getCollider();
                if (col3)
                    col3.active = false;
            };
            this.settingsLayout.hide();
            this.settingsLayout.deactivate();
        });
    }
    //#endregion
    resize(width, height) {
        var posX = width * 0.5 - this.halfWidth;
        var posY = height * 0.5 - this.halfHeight;
        this.layout.position.x = posX;
        this.layout.position.y = posY;
        for (let ent of this.layout.uiEntities) {
            ent.x = this.layout.position.x + ent.getRelativePos().x;
            ent.y = this.layout.position.y + ent.getRelativePos().y;
        }
        this.cropsLayout.position.x = posX;
        this.cropsLayout.position.y = posY;
        for (let ent of this.cropsLayout.uiEntities) {
            ent.x = this.cropsLayout.position.x + ent.getRelativePos().x;
            ent.y = this.cropsLayout.position.y + ent.getRelativePos().y;
        }
        this.clothesLayout.position.x = posX;
        this.clothesLayout.position.y = posY;
        for (let ent of this.clothesLayout.uiEntities) {
            ent.x = this.clothesLayout.position.x + ent.getRelativePos().x;
            ent.y = this.clothesLayout.position.y + ent.getRelativePos().y;
        }
        this.wikiLayout.position.x = posX;
        this.wikiLayout.position.y = posY;
        for (let ent of this.wikiLayout.uiEntities) {
            ent.x = this.wikiLayout.position.x + ent.getRelativePos().x;
            ent.y = this.wikiLayout.position.y + ent.getRelativePos().y;
        }
        this.settingsLayout.position.x = posX;
        this.settingsLayout.position.y = posY;
        for (let ent of this.settingsLayout.uiEntities) {
            ent.x = this.settingsLayout.position.x + ent.getRelativePos().x;
            ent.y = this.settingsLayout.position.y + ent.getRelativePos().y;
        }
    }
    /**Método que abre el inventario en el contenedor de los cultivos y no da posibilidad a cambiarlo */
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
                                if (it.type == "crop" && !Inventory.instance.farmableTile.planted) {
                                    Inventory.instance.farmableTile.plantCrop(this.id);
                                    it.takeItem(1);
                                    Inventory.instance.farmableTile = undefined;
                                    exitingInventory();
                                    if (it.count == 0) {
                                        this.id = -1;
                                    }
                                }
                                else if (it.type == "fertilizer" && Inventory.instance.farmableTile.planted) {
                                    if (Inventory.instance.farmableTile.fertilizerType == -1) {
                                        Inventory.instance.farmableTile.fertilize(this.id, this.fertStrength);
                                        it.takeItem(1);
                                        Inventory.instance.farmableTile = undefined;
                                        exitingInventory();
                                        if (it.count == 0) {
                                            this.id = -1;
                                        }
                                    }
                                    else {
                                        console.log("Ya hay fertilizante");
                                    }
                                }
                                else {
                                    console.log("Action not posible");
                                }
                            }
                        }
                    }
                    if (AudioManager.instance.contextIsActive) {
                        AudioManager.instance.playSound("click");
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
            GameLoop.instance.suscribe(this, null, this.update, null, null);
        });
    }
    setItem(item) {
        this.id = item.id;
        this.name = item.name;
        this.type = item.type;
        this.item = item;
    }
    addItem(count) {
        this.count += count;
    }
    takeItem(count) {
        this.count -= count;
    }
    update(deltaTime) {
        if (this.id >= 0) {
            if (this.type == "crop") {
                this.image.image.setSection(512, this.id * 128, 128, 128);
            }
            else if (this.type == "fertilizer") {
                this.image.image.setSection(640 + this.fertStrength * 128, this.id * 128, 128, 128);
            }
            this.image.setText(this.count.toString(), { x: 110, y: 110 }, 30);
        }
        else {
            this.image.image.setSection(1, 1, 1, 1);
            this.image.hide();
        }
    }
}
//# sourceMappingURL=inventory.js.map