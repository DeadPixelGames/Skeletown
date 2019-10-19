import { UIGraphicEntity, UILayout, UIEntity } from "./ui/uiEntity.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import FileLoader from "./fileloader.js";
import Interface from "./ui/interface.js";
import { BoxCollider, CircleCollider } from "./collider.js";
import GameLoop from "./gameloop.js";
import { exitingInventory } from "./main.js";
import { FarmlandManager } from "./farmland.js";
import { TileEntity } from "./graphics/areamap.js";


export class Inventory{
    /**Instancia singleton */
    public static instance :Inventory;

    /**Objetos en el inventario de cultivos */
    public items :[null, ... itemInInventory[]];

    /**Contenedor de los elementos de interfaz del inventario */
    public layout :UILayout;
    /**Contenedor de los elementos de interfaz del apartado de cultivos */
    private cropsLayout :UILayout;
    /**Contenedor de los elementos de interfaz del apartado de cosméticos */
    private clothesLayout :UILayout;
    /**Contenedor de los elementos de interfaz del apartado de wiki */
    private wikiLayout :UILayout;
    /**Contenedor de los elementos de interfaz del apartado de ajustes*/
    private settingsLayout :UILayout;

    //#region Elementos de interfaz del inventario generales
    /**Botón para cerrar el inventario */
    private closeInventory :UIEntity;
    /**Fondo del inventario */
    private background :UIEntity;
    /**Botón para acceder al apartado de cultivos */
    private crops :UIEntity;
    /**Botón para acceder al apartado de cosméticos */
    private clothes :UIEntity;
    /**Botón para acceder al apartado de wiki */
    private wiki :UIEntity;
    /**Botón para acceder al apartado de ajustes */
    private settings :UIEntity;
    //#endregion
    
    /**Mitad de la anchura del contenedor del inventario */
    private halfWidth = 512;
    /**Mitad de la altura del contenedor del inventario */
    private halfHeight = 348;
    /**Tile de cultivo asociada para abonar / plantar */
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
        this.items = [null];
        //#region Inicialización de los contenedores
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

    public addItem(item :Item, count :number, strength? :number){
        var found = false;
        var i = 1;
        while(!found || i == this.items.length){
            var it = this.items[i]
            if(it){
                if(it.blocked) found = true;
                if(it.type == item.type){
                    if(it.id == item.id){
                        it.addItem(count);
                        found = true;
                    }
                }else if(it.count <= 0){
                    it.setItem(item);
                    it.addItem(count);
                    if(item.type == "fertilizer"){
                        if(strength){
                            it.fertStrength = strength
                        }else{
                            console.log("No se ha incluido potencia en el abono: "+item.name)
                        }
                        
                    }
                    found = true;
                }
                i++;
            }
        }
        
    }


    //#region Loading imágenes y colliders
    private async loadImages(){
        this.background.setImage(true, 101, await FileLoader.loadImage("resources/interface/inv_base.png"), 0, 0, this.halfWidth*2, this.halfHeight*2);
        this.crops.setImage(true, 103, await FileLoader.loadImage("resources/interface/or_inv_button.png"), 58, 56, 101, 101);
        this.clothes.setImage(true, 103, await FileLoader.loadImage("resources/interface/cos_inv_button.png"), 58, 211, 102, 102);
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

    //#region Mostrar / Esconder; Activar / Desactivar el inventario
    public show(){
        this.layout.show();
        this.cropsLayout.show();
        this.clothesLayout.hide();
        this.wikiLayout.hide();
        this.settingsLayout.hide();
    }

    public hide(){
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
    //#endregion

    //#region Inicialización de los contenedores
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

        
       
        for(var i = 0; i < 4; i++){
            for(var j = 0; j < 5; j++){
                var item = new itemInInventory(j + i * 5 + 1, constX + j * constInBetweenX + j * constW, 
                    constY + i * constInBetweenY + i * constW, 
                    constW, constW);
                if(i > 1) item.blocked = true;
                this.items.push(item);
            }
        }
        for(let item of this.items){
            if(item)
            this.cropsLayout.addUIEntity(item.image);
        }
        this.cropsLayout.addEntitiesToRenderer();
        this.cropsLayout.hide();
        this.deactivate();
    }
    private async initClothesLayout(){
        var background = new UIEntity(false);

        background.setImage(true, 102, await FileLoader.loadImage("resources/interface/cos_inv_page.png"));
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
        var posX = width * 0.5  / GraphicsRenderer.instance.scaleX - this.halfWidth;
        var posY = height * 0.5 / GraphicsRenderer.instance.scaleY - this.halfHeight ;
        this.layout.position.x = posX;
        this.layout.position.y = posY;
        for(let ent of this.layout.uiEntities){
            ent.x = this.layout.position.x + ent.getRelativePos().x;
            ent.y = this.layout.position.y + ent.getRelativePos().y;
        }

        this.cropsLayout.position.x = posX;
        this.cropsLayout.position.y = posY;
        for(let ent of this.cropsLayout.uiEntities){
            ent.x = this.cropsLayout.position.x + ent.getRelativePos().x;
            ent.y = this.cropsLayout.position.y + ent.getRelativePos().y;
        }

        this.clothesLayout.position.x = posX;
        this.clothesLayout.position.y = posY;
        for(let ent of this.clothesLayout.uiEntities){
            ent.x = this.clothesLayout.position.x + ent.getRelativePos().x;
            ent.y = this.clothesLayout.position.y + ent.getRelativePos().y;
        }

        this.wikiLayout.position.x = posX;
        this.wikiLayout.position.y = posY;
        for(let ent of this.wikiLayout.uiEntities){
            ent.x = this.wikiLayout.position.x + ent.getRelativePos().x;
            ent.y = this.wikiLayout.position.y + ent.getRelativePos().y;
        }

        this.settingsLayout.position.x = posX;
        this.settingsLayout.position.y = posY;
        for(let ent of this.settingsLayout.uiEntities){
            ent.x = this.settingsLayout.position.x + ent.getRelativePos().x;
            ent.y = this.settingsLayout.position.y + ent.getRelativePos().y;
        }
    }
    
    /**Método que abre el inventario en el contenedor de los cultivos y no da posibilidad a cambiarlo */
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
    public type :string;
    public image :UIEntity;
    public fertStrength :number;

    public blocked :boolean;

    private pos :number;

    constructor(pos :number, left :number, top :number, width :number, height :number){
        this.count = 0;
        this.image = new UIEntity(true);
        this.initImage(left, top, width, height);
        this.pos = pos;

        GameLoop.instance.suscribe(this, null, this.update, null, null);
    }

    private async initImage(left :number, top :number, width :number, height :number){
        
        this.image.setPercentRelPos(false);
        this.image.setCollider(false, left, top, width, height, (x,y)=>{
            if( !this.blocked){
                if(Inventory.instance.farmableTile){
                    var it = Inventory.instance.items[this.pos]
                    if(it){
                        if(it.count > 0){
                            if(it.type == "crop" && !Inventory.instance.farmableTile.planted){
                                Inventory.instance.farmableTile.plantCrop(this.id);
                                it.takeItem(1);
                                Inventory.instance.farmableTile = undefined;
                                exitingInventory();
                                if(it.count == 0){
                                    this.id = -1;
                                }
                            }else if(it.type == "fertilizer" && Inventory.instance.farmableTile.planted){
                                if(Inventory.instance.farmableTile.fertilizerType == -1){
                                    Inventory.instance.farmableTile.fertilize(this.id, this.fertStrength);
                                    it.takeItem(1);
                                    Inventory.instance.farmableTile = undefined;
                                    exitingInventory();
                                    if(it.count == 0){
                                        this.id = -1;
                                    }
                                }else{
                                    console.log("Ya hay fertilizante")
                                }
                                
                            }else{
                                console.log("Action not posible")
                            }
                            
                        }
                        
                    }
                }
            }

        });
        var coll = this.image.getCollider();
        if(coll){
            Interface.instance.addCollider(coll);
        }
        this.image.setImage(true, 105, await FileLoader.loadImage("resources/sprites/harvest_spritesheet.png"),512,0,128,128);
        this.image.hide();
        GraphicsRenderer.instance.addExistingEntity(this.image.image);
        
    }

    public setItem(item :Item){
        this.id = item.id;
        this.name = item.name;
        this.type = item.type;
    }

    public addItem(count :number){
        this.count += count;
    }

    public takeItem(count :number){
        this.count -= count;
    }

    public update(deltaTime :number){
        if(this.id >= 0){
            if(this.type == "crop"){
                this.image.image.setSection( 512, this.id * 128, 128, 128);
            }else if(this.type == "fertilizer"){
                this.image.image.setSection( 640 + this.fertStrength * 128, this.id * 128, 128, 128);
            }
            
            this.image.setText(this.count.toString(), {x: 110, y: 110}, "30px");
        }else{
            this.image.image.setSection( 1, 1, 1, 1);
            this.image.hide();
        }

    }
}

type Item = {
    id :number,
    name :string,
    description :string,
    type :string
}
