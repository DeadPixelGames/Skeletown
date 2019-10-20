import { UIGraphicEntity, UILayout, UIEntity } from "./ui/uiEntity.js";
import GraphicsRenderer from "./graphics/graphicsrenderer.js";
import FileLoader from "./fileloader.js";
import { BoxCollider, CircleCollider } from "./collider.js";
import GameLoop from "./gameloop.js";
import Interface, { exitingInventory} from "./ui/interface.js";
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

    private standardX :number;
    private standardY :number;

    public pageSelected :string = "crops";
    public cropSelected :number = 0;
    public enemySelected :number = 0;

    /**
     * Inicializa la instancia Singleton de `Inventory` del programa y la asocia al contexto de canvas especificado.
     */
    public static initInstance(standardX :number, standardY :number) {
        if(!GraphicsRenderer.instance) {
            throw new Error("GraphicsRenderer no se ha iniciado todavía. Por favor inicia GameLoop antes de instanciar GraphicsRenderer.");
        }
        this.instance = new Inventory();
        this.instance.standardX = standardX;
        this.instance.standardY = standardY;
    }


    private constructor(){
        this.items = [null];
        //#region Inicialización de los contenedores
        this.layout = new UILayout(
            this.standardX * 0.5 - this.halfWidth, 
            this.standardY * 0.5 - this.halfHeight, 
            this.halfWidth * 2, 
            this.halfHeight * 2
        );
        this.cropsLayout = new UILayout(
            this.standardX* 0.5 - this.halfWidth, 
            this.standardY * 0.5 - this.halfHeight, 
            this.halfWidth*2, 
            this.halfHeight*2
        );
        this.clothesLayout = new UILayout(
            this.standardX* 0.5 - this.halfWidth, 
            this.standardY * 0.5 - this.halfHeight, 
            this.halfWidth*2, 
            this.halfHeight*2
        );
        this.wikiLayout = new UILayout(
            this.standardX* 0.5 - this.halfWidth, 
            this.standardY * 0.5 - this.halfHeight, 
            this.halfWidth*2, 
            this.halfHeight*2
        );
        this.settingsLayout = new UILayout(
            this.standardX* 0.5 - this.halfWidth, 
            this.standardY * 0.5 - this.halfHeight, 
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
        this.clothes.setImage(true, 103, await FileLoader.loadImage("resources/interface/cos_inv_button.png"), 58, 211, 103, 103);
        this.wiki.setImage(true, 103, await FileLoader.loadImage("resources/interface/bok_inv_button.png"), 57, 360, 110, 110);
        this.settings.setImage(true, 103, await FileLoader.loadImage("resources/interface/exit_inv_button.png"), 58, 509, 115, 130);
        this.closeInventory.setImage(true, 102, await FileLoader.loadImage("resources/interface/but_cerrar.png"), 0, 0, 86, 86);
        this.layout.addEntitiesToRenderer();
        this.layout.hide();
    }

    private loadColliders(){
        this.background.setCollider(true, 0, 0, 1024, 696);

        this.crops.setCollider(true, 58, 56, 101, 101, (x,y)=>{
            this.cropsLayout.show();
            this.cropsLayout.activate();
            this.clothesLayout.hide();
            this.wikiLayout.hide();
            this.wikiLayout.deactivate();
            this.settingsLayout.hide();
            this.settingsLayout.deactivate();
            console.log("CROPS");
        })

        this.clothes.setCollider(true, 58, 207, 101, 101, (x,y)=>{
            this.cropsLayout.hide();
            this.cropsLayout.deactivate();
            this.clothesLayout.show();
            this.wikiLayout.hide();
            this.wikiLayout.deactivate();
            this.settingsLayout.hide();
            this.settingsLayout.deactivate();
            console.log("CLOTHES");
        })

        this.wiki.setCollider(true, 58, 358, 101, 101, (x,y)=>{
            this.cropsLayout.hide();
            this.cropsLayout.deactivate();
            this.clothesLayout.hide();
            this.wikiLayout.show();
            this.settingsLayout.hide();
            this.wikiLayout.activate();
            this.settingsLayout.deactivate();
            console.log("WIKI");
        })

        this.settings.setCollider(true, 58, 509, 115, 115, (x,y)=>{
            this.cropsLayout.hide();
            this.cropsLayout.deactivate();
            this.clothesLayout.hide();
            this.wikiLayout.hide();
            this.wikiLayout.deactivate();
            this.settingsLayout.show();
            this.settingsLayout.activate();
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
        var cropPages :UIEntity[] = [];
        var enemyPages :UIEntity[] = [];
        
        var book = await FileLoader.loadJSON("resources/interface/book.json") as InventoryBook
        for(let en of book.enemies){
            var aux = new UIEntity(false);
            aux.setImage(true, 104, await FileLoader.loadImage("resources/interface/"+ en.image));
            aux.setCollider(true, 0, 0, this.halfWidth * 2, this.halfHeight * 2);
            aux.setText(en.name + '\n\n\n' + en.description, {x: 745, y: 145}, 20, "center");
            //aux.setText(en.description, {x: 745, y: 204}, "15px", "center");
            this.wikiLayout.addUIEntity(aux);
            enemyPages.push(aux);
        }
        for(let veg of book.vegetables){
            var aux = new UIEntity(false);
            aux.setImage(true, 104, await FileLoader.loadImage("resources/interface/"+veg.image));
            aux.setCollider(true, 0, 0, this.halfWidth * 2, this.halfHeight * 2);
            aux.setText(veg.name + "\n\n\n" + veg.description, {x: 745, y: 145}, 20, "center");
            //aux.setText(veg.description, {x: 745, y: 204}, "15px", "center");
            this.wikiLayout.addUIEntity(aux);
            cropPages.push(aux);
        }

    
        var next = new UIEntity(true);
        var prev = new UIEntity(true);
        var cr = new UIEntity(true);
        var enemy = new UIEntity(true);

        background.setImage(true, 102, await FileLoader.loadImage("resources/interface/bok_inv_page.png"));
        next.setImage(true, 103, await FileLoader.loadImage("resources/interface/bok_inv_next.png"), 870, 255, 26, 302);
        prev.setImage(true, 103, await FileLoader.loadImage("resources/interface/bok_inv_back.png"), 587, 255, 26, 302);
        cr.setImage(true, 103, await FileLoader.loadImage("resources/interface/bok_inv_orbutton.png"), 661, 550, 50, 95);
        enemy.setImage(true, 103, await FileLoader.loadImage("resources/interface/bok_inv_enebutton.png"), 748, 549, 50, 95);

        

        var that = this;

        background.setCollider(true, 0, 0, 1024, 696);
        next.setCollider(true, 870, 255, 26, 302, (x,y)=>{
            if(that.pageSelected == "crops") {
                var cropSelected = cropPages[that.cropSelected];
                if(cropSelected) {
                    cropSelected.hide();
                    if(that.cropSelected < cropPages.length - 1) {
                        that.cropSelected++;
                    }
                    cropSelected = cropPages[that.cropSelected];
                    cropSelected.show();
                }
            }else if(that.pageSelected == "enemies") {
                var enemySelected = enemyPages[that.enemySelected];
                if(enemySelected){
                    enemySelected.image.visible = false;
                    if(that.enemySelected < enemyPages.length - 1) {
                        that.enemySelected++;
                    }
                    enemySelected = enemyPages[that.enemySelected];
                    enemySelected.show();
                }
            }
        })
        prev.setCollider(true, 587, 255, 26, 302, (x,y)=>{
            if(that.pageSelected == "crops") {
                var cropSelected = cropPages[that.cropSelected];
                if(cropSelected) {
                    cropSelected.hide();
                    if(that.cropSelected > 0){
                        that.cropSelected--;
                    }
                    cropSelected = cropPages[that.cropSelected];
                    cropSelected.show();
                }
            }else if(that.pageSelected == "enemies") {
                var enemySelected = enemyPages[that.enemySelected];
                if(enemySelected){
                    enemySelected.hide();
                    if(that.enemySelected > 0) {
                        that.enemySelected--;
                    }
                    enemySelected = enemyPages[that.enemySelected];
                    enemySelected.show();
                }
            }
        })
        cr.setCollider(true, 661, 550, 50, 95, (x, y)=>{
            that.pageSelected = "crops";
            var cropSelected = cropPages[that.cropSelected];
            var enemySelected = enemyPages[that.enemySelected];
            if(cropSelected)
                cropSelected.show();
            if(enemySelected)
                enemySelected.hide();
        })
        enemy.setCollider(true, 748, 549, 50, 95, (x, y)=>{
            that.pageSelected = "enemies";
            var cropSelected = cropPages[that.cropSelected]
            if(cropSelected)
            cropSelected.hide();
            var enemySelected = enemyPages[that.enemySelected]
            if(enemySelected)
            enemySelected.show();
        })

        Interface.instance.addCollider(next.getCollider() as BoxCollider);
        Interface.instance.addCollider(prev.getCollider() as BoxCollider);
        Interface.instance.addCollider(cr.getCollider() as BoxCollider);
        Interface.instance.addCollider(enemy.getCollider() as BoxCollider);

        this.wikiLayout.addUIEntity(background);
        this.wikiLayout.addUIEntity(next);
        this.wikiLayout.addUIEntity(prev);
        this.wikiLayout.addUIEntity(cr);
        this.wikiLayout.addUIEntity(enemy);
        this.wikiLayout.addEntitiesToRenderer();
        this.wikiLayout.show = function() {
            background.show();
            for(let en of enemyPages){
                if(en)
                    en.hide();
            }
            for(let crop of cropPages){
                if(crop)
                    crop.hide();
            }
            if(that.pageSelected == "crops"){
                var cropSelected = cropPages[that.cropSelected];
                if(cropSelected)
                    cropSelected.image.visible = true;
            } else if(that.pageSelected == "enemies"){
                var enemySelected = enemyPages[that.enemySelected]
                if(enemySelected)
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
    }
    private async initSettingsLayout(){
        var background = new UIEntity(false);
        var exit = new UIEntity(true);
        background.setImage(true, 102, await FileLoader.loadImage("resources/interface/exit_inv_page.png"));
        exit.setImage(true, 104, await FileLoader.loadImage("resources/interface/exitgame_inv_button.png"), 481, 547, 176, 77);
        background.setCollider(true, 0, 0, 1024, 696);
        exit.setCollider(true, 481, 547, 176, 77, (x,y)=>{
            console.log("SALIR AL MENÚ AL PRINCIPAL");
            // TODO Hacer lo de salir al menú principal
        })


        Interface.instance.addCollider(exit.getCollider() as BoxCollider);

        this.settingsLayout.addUIEntity(background);
        this.settingsLayout.addUIEntity(exit);

        this.settingsLayout.addEntitiesToRenderer();
        this.settingsLayout.hide();
        this.settingsLayout.deactivate();
    }
    //#endregion
    
    public resize(width :number, height :number){
        var posX = width * 0.5  - this.halfWidth;
        var posY = height * 0.5 - this.halfHeight ;
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
        GameLoop.instance.suscribe(this, null, this.update, null, null);
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
            
            this.image.setText(this.count.toString(), {x: 110, y: 110}, 30);
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
