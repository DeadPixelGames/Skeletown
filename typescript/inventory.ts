import { UIGraphicEntity, UILayout, UIEntity } from "./ui/uiEntity.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import FileLoader from "./fileloader.js";
import Interface from "./ui/interface.js";
import { BoxCollider, CircleCollider } from "./collider.js";
import GameLoop from "./gameloop.js";
import { hud_InGame, exitingInventory } from "./main.js";
import { FarmlandManager } from "./farmland.js";
import { TileEntity } from "./graphics/areamap.js";


export class Inventory{
    public static instance :Inventory;

    private items :[null, ... itemInInventory[]];

    public layout :UILayout;

    private cropsLayout :UILayout;
    private clothesLayout :UILayout;
    private wikiLayout :UILayout;
    private settingsLayout :UILayout;

    private closeInventory :UIEntity;

    private background :UIEntity;
    private crops :UIEntity;
    private clothes :UIEntity;
    private wiki :UIEntity;
    private settings :UIEntity;

    private halfWidth = 512;
    private halfHeight = 348;

    private shown :boolean;

    public farmableTile? :TileEntity;

    /**
     * Inicializa la instancia Singleton de `Inventory` del programa y la asocia al contexto de canvas especificado.
     */
    public static initInstance() {
        if(!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderer no se ha iniciado todavía. Por favor inicia GameLoop antes de instanciar GraphicsRenderer.");
        }
        this.instance = new Inventory();
    }


    private constructor(){
        this.layout = new UILayout(
            GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, 
            GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, 
            this.halfWidth * 2, 
            this.halfHeight * 2
        );
        this.cropsLayout = new UILayout(
            GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, 
            GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, 
            this.halfWidth*2, 
            this.halfHeight*2
        );
        this.clothesLayout = new UILayout(
            GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, 
            GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, 
            this.halfWidth*2, 
            this.halfHeight*2
        );
        this.wikiLayout = new UILayout(
            GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, 
            GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, 
            this.halfWidth*2, 
            this.halfHeight*2
        );
        this.settingsLayout = new UILayout(
            GraphicsRenderer.instance.getCanvas().width * 0.5 - this.halfWidth, 
            GraphicsRenderer.instance.getCanvas().height * 0.5 - this.halfHeight, 
            this.halfWidth*2, 
            this.halfHeight*2
        );

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

    public addItem(item :Item, count :number){
        for(let it of this.items){
            if(it){
                if(it.blocked) return;
                if(it.id == item.id){
                    it.addItem(count);
                }else if(it.count <= 0){
                    console.log("UwU")
                    it.setItem(item);
                    it.addItem(count);
                    return;
                }
            }
        }
    }


    //#region Loading imágenes y colliders
    private async loadImages(){
        this.background.setImage(true, 101, await FileLoader.loadImage("resources/interface/inv_base.png"), 0, 0, this.halfWidth*2, this.halfHeight*2);
        this.crops.setImage(true, 103, await FileLoader.loadImage("resources/interface/or_inv_button.png"), 58, 56, 101, 101);
        this.clothes.setImage(true, 103, await FileLoader.loadImage("resources/interface/or_inv_button.png"), 58, 56, 101, 101);
        this.wiki.setImage(true, 103, await FileLoader.loadImage("resources/interface/or_inv_button.png"), 58, 56, 101, 101);
        this.settings.setImage(true, 103, await FileLoader.loadImage("resources/interface/or_inv_button.png"), 58, 56, 101, 101);
        this.closeInventory.setImage(true, 102, await FileLoader.loadImage("resources/interface/but_cerrar.png"), 0, 0, 86, 86);
        this.layout.addEntitiesToRenderer();
        this.layout.hide();
    }

    private loadColliders(){
        this.background.setCollider(true, 0, 0, 1024, 696);

        this.crops.setCollider(true, 58, 56, 101, 101, (x,y)=>{
            this.cropsLayout.show();
            this.clothesLayout.hide();
            this.wikiLayout.hide();
            this.settingsLayout.hide();
            console.log("CROPS");
        })

        this.clothes.setCollider(true, 58, 207, 101, 101, (x,y)=>{
            this.cropsLayout.hide();
            this.clothesLayout.show();
            this.wikiLayout.hide();
            this.settingsLayout.hide();
            console.log("CLOTHES");
        })

        this.wiki.setCollider(true, 58, 358, 101, 101, (x,y)=>{
            this.cropsLayout.hide();
            this.clothesLayout.hide();
            this.wikiLayout.show();
            this.settingsLayout.hide();
            console.log("WIKI");
        })

        this.settings.setCollider(true, 58, 509, 101, 101, (x,y)=>{
            this.cropsLayout.hide();
            this.clothesLayout.hide();
            this.wikiLayout.hide();
            this.settingsLayout.show();
            console.log("SETTINGS");
        })

        this.closeInventory.setCollider(false, 981, -43, 86, 86, (x,y)=>{
            exitingInventory();
        })

        
        Interface.instance.addCollider(this.crops.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.clothes.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.wiki.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.settings.getCollider() as BoxCollider);
        Interface.instance.addCollider(this.closeInventory.getCollider() as CircleCollider);
    }
    //#endregion

    
    public show(){
        this.shown = true;
        this.layout.show();
        this.cropsLayout.show();
        this.clothesLayout.hide();
        this.wikiLayout.hide();
        this.settingsLayout.hide();
    }

    public hide(){
        this.shown = false;
        this.layout.hide();
        this.cropsLayout.hide();
        this.clothesLayout.hide();
        this.wikiLayout.hide();
        this.settingsLayout.hide();
    }


    public activate(){
        this.layout.activate();
        this.cropsLayout.activate();
        this.clothesLayout.deactivate();
        this.wikiLayout.deactivate();
        this.settingsLayout.deactivate();
    }

    public deactivate(){
        this.layout.deactivate();
        this.cropsLayout.deactivate();
        this.clothesLayout.deactivate();
        this.wikiLayout.deactivate();
        this.settingsLayout.deactivate();
    }
    //#region initLayouts
    private async initCropsLayout(){
        var background = new UIEntity(false);

        background.setImage(true, 102, await FileLoader.loadImage("resources/interface/or_inv_page.png"));
        background.setCollider(true, 0, 0, 1024, 696);
        background.setPercentRelPos(false);
        this.cropsLayout.addUIEntity(background);
        
        var constX = 201;
        var constY = 56;
        var constInBetweenX = 24;
        var constInBetweenY = 20;
        var constW = 128;

        this.items = [null];
        for(var i = 0; i < 4; i++){
            for(var j = 0; j < 5; j++){
                var item = new itemInInventory(constX + j * constInBetweenX + j * constW, 
                    constY + i * constInBetweenY + i * constW, 
                    constW, constW,
                    (x,y)=>{
                        if(!item.blocked){
                            if(this.farmableTile){
                                this.farmableTile.plantCrop(item.id);
                                this.farmableTile = undefined;
                                
                            }
                        }
                    });
                if(i != 0) item.blocked = true;
                this.items.push(item);
            }
        }
        for(let item of this.items){
            if(item)
            this.cropsLayout.addUIEntity(item.image);
        }
        this.cropsLayout.addEntitiesToRenderer();
        this.cropsLayout.hide();
    }
    private async initClothesLayout(){
        var background = new UIEntity(false);

        background.setImage(true, 102, await FileLoader.loadImage("resources/interface/or_inv_page.png"));
        background.setCollider(true, 0, 0, 1024, 696);
        background.setPercentRelPos(false);
        this.clothesLayout.addUIEntity(background);
        this.clothesLayout.addEntitiesToRenderer();
        this.clothesLayout.hide();
    }
    private async initWikiLayout(){
        var background = new UIEntity(false);

        background.setImage(true, 102, await FileLoader.loadImage("resources/interface/or_inv_page.png"));
        background.setCollider(true, 0, 0, 1024, 696);
        background.setPercentRelPos(false);
        this.wikiLayout.addUIEntity(background);
        this.wikiLayout.addEntitiesToRenderer();
        this.wikiLayout.hide();
    }
    private async initSettingsLayout(){
        var background = new UIEntity(false);

        background.setImage(true, 102, await FileLoader.loadImage("resources/interface/or_inv_page.png"));
        background.setCollider(true, 0, 0, 1024, 696);
        background.setPercentRelPos(false);
        this.settingsLayout.addUIEntity(background);
        this.settingsLayout.addEntitiesToRenderer();
        this.settingsLayout.hide();
    }
    //#endregion
    public resize(width :number, height :number){
        this.layout.position.x = width * 0.5 - this.halfWidth;
        this.layout.position.y = height * 0.5 - this.halfHeight;
        for(let ent of this.layout.uiEntities){
            ent.x = this.layout.position.x + ent.getRelativePos().x;
            ent.y = this.layout.position.y + ent.getRelativePos().y;
        }

        this.cropsLayout.position.x = width * 0.5 - this.halfWidth;
        this.cropsLayout.position.y = height * 0.5 - this.halfHeight;
        for(let ent of this.cropsLayout.uiEntities){
            ent.x = this.cropsLayout.position.x + ent.getRelativePos().x;
            ent.y = this.cropsLayout.position.y + ent.getRelativePos().y;
        }

        this.clothesLayout.position.x = width * 0.5 - this.halfWidth;
        this.clothesLayout.position.y = height * 0.5 - this.halfHeight;
        for(let ent of this.clothesLayout.uiEntities){
            ent.x = this.clothesLayout.position.x + ent.getRelativePos().x;
            ent.y = this.clothesLayout.position.y + ent.getRelativePos().y;
        }

        this.wikiLayout.position.x = width * 0.5 - this.halfWidth;
        this.wikiLayout.position.y = height * 0.5 - this.halfHeight;
        for(let ent of this.wikiLayout.uiEntities){
            ent.x = this.wikiLayout.position.x + ent.getRelativePos().x;
            ent.y = this.wikiLayout.position.y + ent.getRelativePos().y;
        }

        this.settingsLayout.position.x = width * 0.5 - this.halfWidth;
        this.settingsLayout.position.y = height * 0.5 - this.halfHeight;
        for(let ent of this.settingsLayout.uiEntities){
            ent.x = this.settingsLayout.position.x + ent.getRelativePos().x;
            ent.y = this.settingsLayout.position.y + ent.getRelativePos().y;
        }
    }
    

    public togglePlanting(tile :TileEntity){
        this.farmableTile = tile;

        this.layout.activate();

        this.cropsLayout.activate();

        this.clothesLayout.deactivate();

        this.wikiLayout.deactivate();

        this.settingsLayout.deactivate();
    }
}


class itemInInventory{
    public id :number;
    public name :string;
    public count :number;

    public image :UIEntity;

    public blocked :boolean;

    constructor(left :number, top :number, width :number, height :number, onClick? :(x :number,y :number)=>void){
        this.count = 0;
        this.image = new UIEntity(true);
        this.initImage(left, top, width, height, onClick);

        GameLoop.instance.suscribe(this, null, this.update, null, null);
    }

    private async initImage(left :number, top :number, width :number, height :number, onClick? :(x :number,y :number)=>void){
        this.image.setImage(true, 103, await FileLoader.loadImage("resources/sprites/harvest_spritesheet.png"),512,0,128,128);
        this.image.setPercentRelPos(false);
        this.image.setCollider(false, left, top, width, height, onClick);
        var coll = this.image.getCollider();
        if(coll){
            Interface.instance.addCollider(coll);
            console.log("OwO")
        }
        
    }

    public setItem(item :Item){
        this.id = item.id;
        this.name = item.name;
    }

    public addItem(count :number){
        this.count += count;
    }

    public takeItem(count :number){
        this.count -= count;
    }

    public update(deltaTime :number){
        if(this.id)
        this.image.image.setSection( 512,this.id * 128, 128, 128);
    }
}

type Item = {
    id :number,
    name :string,
    description :string
}
